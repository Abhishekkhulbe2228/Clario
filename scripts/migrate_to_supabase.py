#!/usr/bin/env python3
"""
Clario - Supabase Storage Migration Script

Migrates existing locally-stored organizational documents from the local `uploads/` directory
to the private Supabase Storage bucket (`clario-documents`).

Usage:
    python scripts/migrate_to_supabase.py [--dry-run] [--cleanup-local] [--verify-only]

Features:
- Validates Supabase Storage configuration before beginning.
- Reads local files, uploads them to the private Supabase bucket.
- Verifies the upload by checking file existence and byte size.
- Updates DocumentRecord metadata (storage_key) in the existing database.
- Preserves existing Pinecone vectors (does NOT duplicate or re-embed chunks).
- Preserves local original files unless --cleanup-local is explicitly passed.
"""

import argparse
import hashlib
import logging
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import select
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models import DocumentRecord
from app.services.audit import init_db
from app.services.storage import (
    StorageConfigurationError,
    StorageError,
    get_storage_service,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("clario-migration")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migrate local document files to Supabase Storage."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate the migration without uploading files or updating the database.",
    )
    parser.add_argument(
        "--cleanup-local",
        action="store_true",
        help="Delete local copies from uploads/ only AFTER successful upload and verification.",
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Verify if documents recorded in the database exist in Supabase Storage without uploading.",
    )
    return parser.parse_args()


def run_migration(dry_run: bool = False, cleanup_local: bool = False, verify_only: bool = False) -> int:
    settings = get_settings()
    storage = get_storage_service()

    print("\n" + "=" * 65)
    print(" Clario Document Migration -> Supabase Storage")
    print("=" * 65)
    print(f" Target Bucket: {storage.bucket_name}")
    print(f" Dry Run:       {dry_run}")
    print(f" Cleanup Local: {cleanup_local}")
    print(f" Verify Only:   {verify_only}")
    print("=" * 65 + "\n")

    # Step 1: Validate storage configuration
    if not storage.is_configured():
        logger.error(
            "Supabase Storage credentials are missing. "
            "Please ensure SUPABASE_URL and SUPABASE_SECRET_KEY are set in your environment or .env file."
        )
        return 1

    try:
        storage.validate_configuration(check_bucket=True)
        logger.info("Successfully connected to Supabase bucket '%s'.", storage.bucket_name)
    except StorageConfigurationError as err:
        logger.error("Storage configuration check failed: %s", err)
        return 1

    init_db()

    upload_dir = Path(settings.upload_dir)
    total_records = 0
    already_in_storage = 0
    migrated_count = 0
    failed_count = 0
    missing_local_count = 0
    cleaned_count = 0

    with SessionLocal() as db:
        records = db.scalars(select(DocumentRecord).order_by(DocumentRecord.created_at.asc())).all()
        total_records = len(records)
        logger.info("Found %d document records in database.", total_records)

        for record in records:
            storage_key = record.storage_key or record.stored_filename
            local_path = upload_dir / record.stored_filename

            print(f"\n--- Document [{record.id[:8]}] '{record.original_filename}' ---")

            # Check if file already exists in Supabase Storage
            exists_in_cloud = False
            try:
                exists_in_cloud = storage.file_exists(storage_key)
            except Exception:
                exists_in_cloud = False

            if exists_in_cloud:
                logger.info("Object '%s' already exists in Supabase Storage.", storage_key)
                already_in_storage += 1
                if not record.storage_key and not dry_run:
                    record.storage_key = storage_key
                    db.commit()
                    logger.info("Updated record storage_key metadata to '%s'.", storage_key)
                continue

            if verify_only:
                logger.warning("Object '%s' NOT found in Supabase Storage.", storage_key)
                failed_count += 1
                continue

            # Check local file
            if not local_path.is_file():
                logger.error("Local file missing at '%s'. Cannot migrate.", local_path)
                missing_local_count += 1
                continue

            content = local_path.read_bytes()
            content_hash = hashlib.sha256(content).hexdigest()
            if record.content_hash and content_hash != record.content_hash:
                logger.warning(
                    "Hash mismatch for '%s': db=%s, disk=%s",
                    record.original_filename,
                    record.content_hash,
                    content_hash,
                )

            if dry_run:
                logger.info("[DRY RUN] Would upload %d bytes from '%s' to '%s'", len(content), local_path, storage_key)
                migrated_count += 1
                continue

            # Upload to Supabase Storage
            try:
                storage.upload_file(
                    storage_key=storage_key,
                    content=content,
                    content_type=record.content_type or "application/octet-stream",
                    upsert=True,
                )
                logger.info("Uploaded '%s' (%d bytes) to Supabase Storage.", storage_key, len(content))

                # Verify upload by downloading
                downloaded = storage.download_file(storage_key)
                if len(downloaded) != len(content):
                    raise StorageError(f"Size mismatch after upload: uploaded {len(content)}, got {len(downloaded)}")

                logger.info("Verified download from Supabase Storage matches uploaded file.")

                # Update database record
                record.storage_key = storage_key
                db.commit()
                migrated_count += 1

                # Clean up local file only if explicitly requested and verified
                if cleanup_local:
                    local_path.unlink(missing_ok=True)
                    logger.info("Cleaned up local file '%s'.", local_path)
                    cleaned_count += 1

            except Exception as exc:
                logger.exception("Failed to migrate document '%s': %s", record.original_filename, exc)
                failed_count += 1

    print("\n" + "=" * 65)
    print(" Migration Summary")
    print("=" * 65)
    print(f" Total document records:     {total_records}")
    print(f" Already in Supabase Storage: {already_in_storage}")
    print(f" Newly migrated:             {migrated_count}")
    print(f" Missing local files:        {missing_local_count}")
    print(f" Failed:                     {failed_count}")
    if cleanup_local:
        print(f" Local files deleted:        {cleaned_count}")
    print("=" * 65 + "\n")

    return 0 if (failed_count == 0 and missing_local_count == 0) else 1


if __name__ == "__main__":
    args = parse_args()
    code = run_migration(
        dry_run=args.dry_run,
        cleanup_local=args.cleanup_local,
        verify_only=args.verify_only,
    )
    sys.exit(code)
