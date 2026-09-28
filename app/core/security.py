import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models import User

settings = get_settings()
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt$16384$8$1${salt.hex()}${derived.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, n, r, p, salt_hex, hash_hex = encoded.split("$")
        if algorithm != "scrypt":
            return False
        candidate = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=int(n), r=int(r), p=int(p))
        return hmac.compare_digest(candidate.hex(), hash_hex)
    except (TypeError, ValueError):
        return False


def _secret() -> bytes:
    if not settings.jwt_secret:
        raise RuntimeError("JWT_SECRET must be configured before authentication can be used")
    return settings.jwt_secret.encode()


def create_access_token(user: User, expires_delta: timedelta | None = None) -> str:
    expire_minutes = settings.access_token_expire_minutes
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta is not None else timedelta(minutes=expire_minutes))
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": int(expire.timestamp()),
    }
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).rstrip(b"=")
    signature = hmac.new(_secret(), body, hashlib.sha256).digest()
    return f"{body.decode()}.{base64.urlsafe_b64encode(signature).rstrip(b'=').decode()}"


def _decode_token(token: str) -> dict:
    try:
        parts = token.strip().split(".")
        if len(parts) == 2:
            body, signature = parts
            signed_data = body.encode()
        elif len(parts) == 3:
            header, body, signature = parts
            signed_data = f"{header}.{body}".encode()
        else:
            raise ValueError("malformed token structure")

        expected = hmac.new(_secret(), signed_data, hashlib.sha256).digest()
        actual = base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))
        if not hmac.compare_digest(expected, actual):
            # Check fallback in case 3-part token was signed with just body
            fallback = hmac.new(_secret(), body.encode(), hashlib.sha256).digest()
            if not hmac.compare_digest(fallback, actual):
                raise ValueError("invalid signature")

        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if int(payload.get("exp", 0)) <= int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("expired token")
        return payload
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token") from exc



def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    payload = _decode_token(credentials.credentials)
    user = db.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is unavailable")
    return user


def require_roles(*roles: str):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return dependency
