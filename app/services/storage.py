import contextlib
import logging
import os
import tempfile
from collections.abc import Generator
from pathlib import Path
from typing import Any

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


class StorageError(Exception):
    """Base exception for Supabase Storage operations."""
    pass


class StorageConfigurationError(StorageError):
    """Raised when Supabase Storage credentials or bucket configuration are missing or invalid."""
    pass


class StorageFileNotFoundError(StorageError):
    """Raised when a requested object is not found in Supabase Storage."""
    pass


class StorageUploadError(StorageError):
    """Raised when uploading a document to Supabase Storage fails."""
    pass


class SupabaseStorageService:
    """
    Dedicated client for managing Clario document storage via Supabase Storage.
    Supports modern Supabase Secret API keys (`sb_secret_...`), private buckets,
    secure temporary downloads for parsing, and authorized access.
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client: Any = None

    @property
    def settings(self) -> Settings:
        return self._settings

    @property
    def bucket_name(self) -> str:
        return (self._settings.supabase_storage_bucket or "clario-documents").strip()

    def is_configured(self) -> bool:
        """Returns True if minimum required Supabase credentials are provided."""
        url = (self._settings.supabase_url or "").strip()
        key = (self._settings.supabase_secret_key or "").strip()
        return bool(url and key)

    def get_client(self) -> Any:
        """
        Lazily creates and caches the official Supabase Python client.
        Fails fast with StorageConfigurationError if credentials are missing.
        """
        if self._client is not None:
            return self._client

        url = (self._settings.supabase_url or "").strip()
        key = (self._settings.supabase_secret_key or "").strip()

        if not url or not key:
            raise StorageConfigurationError(
                "Supabase Storage credentials are missing. "
                "Both SUPABASE_URL and SUPABASE_SECRET_KEY must be configured."
            )

        if not (url.startswith("http://") or url.startswith("https://")):
            raise StorageConfigurationError(
                f"Invalid SUPABASE_URL '{url}'. URL must begin with https:// or http://"
            )

        try:
            from supabase import create_client
            # create_client supports both modern Secret API keys (sb_secret_...) and legacy service_role keys
            self._client = create_client(url, key)
            return self._client
        except Exception as exc:
            logger.exception("Failed to initialize Supabase client")
            raise StorageConfigurationError(f"Failed to initialize Supabase client: {exc}") from exc

    def get_bucket(self) -> Any:
        """Returns the private bucket proxy for Clario documents."""
        client = self.get_client()
        return client.storage.from_(self.bucket_name)

    def validate_configuration(self, check_bucket: bool = True) -> dict[str, Any]:
        """
        Validates the storage configuration.
        When check_bucket=True and credentials are provided, verifies access to the private bucket.
        """
        if not self.is_configured():
            raise StorageConfigurationError(
                "Supabase Storage is not configured. "
                "SUPABASE_URL and SUPABASE_SECRET_KEY are required for document persistence."
            )

        if check_bucket:
            try:
                bucket = self.get_bucket()
                # Attempt a lightweight listing of up to 1 item to verify authentication and bucket existence
                bucket.list(path="", options={"limit": 1})
            except StorageConfigurationError:
                raise
            except Exception as exc:
                msg = str(exc)
                logger.error("Supabase Storage bucket check failed for '%s': %s", self.bucket_name, msg)
                raise StorageConfigurationError(
                    f"Unable to access private Supabase bucket '{self.bucket_name}': {msg}. "
                    "Ensure the bucket exists in Supabase Dashboard and the secret key is valid."
                ) from exc

        return {
            "status": "ok",
            "bucket": self.bucket_name,
            "url": self._settings.supabase_url,
        }

    def generate_storage_key(self, document_id: str, original_filename: str) -> str:
        """
        Generates a sanitized, deterministic storage key using the document UUID and extension.
        User-supplied paths and characters are not trusted as storage paths.
        """
        suffix = Path(original_filename).suffix.lower()
        return f"{document_id}{suffix}"

    def upload_file(
        self,
        storage_key: str,
        content: bytes,
        content_type: str = "application/octet-stream",
        upsert: bool = False,
    ) -> str:
        """
        Uploads document bytes to the private bucket.
        """
        try:
            bucket = self.get_bucket()
            file_options = {
                "content-type": content_type or "application/octet-stream",
                "upsert": "true" if upsert else "false",
            }
            bucket.upload(
                path=storage_key,
                file=content,
                file_options=file_options,
            )
            logger.info("Uploaded document to Supabase Storage: bucket=%s, key=%s, bytes=%d", self.bucket_name, storage_key, len(content))
            return storage_key
        except StorageConfigurationError:
            raise
        except Exception as exc:
            logger.exception("Upload to Supabase Storage failed for key '%s'", storage_key)
            raise StorageUploadError(f"Failed to upload document to Supabase Storage: {exc}") from exc

    def download_file(self, storage_key: str) -> bytes:
        """
        Downloads the document bytes from Supabase Storage.
        """
        try:
            bucket = self.get_bucket()
            data = bucket.download(storage_key)
            if data is None:
                raise StorageFileNotFoundError(f"Document object '{storage_key}' not found in bucket '{self.bucket_name}'.")
            return data
        except (StorageFileNotFoundError, StorageConfigurationError):
            raise
        except Exception as exc:
            msg = str(exc)
            if "not found" in msg.lower() or "404" in msg:
                raise StorageFileNotFoundError(f"Document '{storage_key}' not found in Supabase Storage.") from exc
            logger.exception("Failed to download document '%s' from Supabase Storage", storage_key)
            raise StorageError(f"Failed to download document from Supabase Storage: {exc}") from exc

    def file_exists(self, storage_key: str) -> bool:
        """
        Checks whether an object exists in Supabase Storage.
        """
        try:
            bucket = self.get_bucket()
            parent_dir = str(Path(storage_key).parent).replace("\\", "/") if "/" in storage_key or "\\" in storage_key else ""
            filename = Path(storage_key).name
            files = bucket.list(parent_dir if parent_dir not in {".", ""} else None)
            for item in files:
                item_name = item.get("name") if isinstance(item, dict) else getattr(item, "name", None)
                if item_name == filename:
                    return True
            return False
        except Exception as exc:
            logger.warning("Error checking if '%s' exists in Supabase Storage: %s", storage_key, exc)
            return False

    @contextlib.contextmanager
    def get_temporary_file(self, storage_key: str) -> Generator[Path, None, None]:
        """
        Downloads the document to a temporary file, yields the file path for parsing,
        and guarantees the temporary file is deleted in a finally block.
        """
        data = self.download_file(storage_key)
        suffix = Path(storage_key).suffix.lower()
        fd, temp_path_str = tempfile.mkstemp(suffix=suffix, prefix="clario_ingest_")
        temp_path = Path(temp_path_str)
        try:
            with os.fdopen(fd, "wb") as f:
                f.write(data)
            yield temp_path
        finally:
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception as clean_err:
                    logger.warning("Could not delete temporary file '%s': %s", temp_path, clean_err)

    def delete_file(self, storage_key: str) -> bool:
        """
        Deletes a document object from Supabase Storage.
        Idempotent: does not fail if the object is already gone.
        """
        try:
            bucket = self.get_bucket()
            bucket.remove([storage_key])
            logger.info("Deleted document from Supabase Storage: bucket=%s, key=%s", self.bucket_name, storage_key)
            return True
        except StorageConfigurationError:
            raise
        except Exception as exc:
            logger.warning("Deletion for key '%s' encountered an issue: %s", storage_key, exc)
            return False

    def create_signed_url(self, storage_key: str, expires_in: int = 300) -> str:
        """
        Generates a short-lived signed URL (default 5 minutes) for authorized document retrieval.
        """
        try:
            bucket = self.get_bucket()
            res = bucket.create_signed_url(storage_key, expires_in=expires_in)
            if isinstance(res, dict):
                signed_url = res.get("signedURL") or res.get("signed_url") or res.get("url")
            else:
                signed_url = getattr(res, "signed_url", None) or getattr(res, "signedURL", None) or getattr(res, "url", None)

            if not signed_url:
                raise StorageError("Supabase Storage response did not contain a signed URL.")
            return str(signed_url)
        except (StorageError, StorageConfigurationError):
            raise
        except Exception as exc:
            logger.exception("Failed to create signed URL for '%s'", storage_key)
            raise StorageError(f"Failed to generate signed URL for document: {exc}") from exc


_storage_service: SupabaseStorageService | None = None


def get_storage_service() -> SupabaseStorageService:
    global _storage_service
    if _storage_service is None:
        _storage_service = SupabaseStorageService()
    return _storage_service
