"""OAuth 2.1 Service for Authorization Code Grant flow with PKCE."""

import base64
import hashlib
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

import jwt
from loguru import logger

from infrastructure.models.oauth import OAuthClient
from infrastructure.repositories.oauth import (
    OAuthAccessTokenCreate,
    OAuthAuthorizationCodeCreate,
    OAuthClientCreate,
    OAuthRefreshTokenCreate,
)
from infrastructure.repositories.repo_provider import Provider
from settings import settings


class OAuthError(Exception):
    """Base OAuth error."""

    def __init__(self, error: str, description: str):
        self.error = error
        self.description = description
        super().__init__(f"{error}: {description}")


class InvalidClientError(OAuthError):
    """Invalid client error."""

    def __init__(self, description: str = "Client authentication failed"):
        super().__init__("invalid_client", description)


class InvalidGrantError(OAuthError):
    """Invalid grant error."""

    def __init__(self, description: str = "The provided grant is invalid"):
        super().__init__("invalid_grant", description)


class InvalidRequestError(OAuthError):
    """Invalid request error."""

    def __init__(self, description: str = "The request is missing a required parameter"):
        super().__init__("invalid_request", description)


class UnauthorizedClientError(OAuthError):
    """Unauthorized client error."""

    def __init__(self, description: str = "Client is not authorized"):
        super().__init__("unauthorized_client", description)


class InvalidScopeError(OAuthError):
    """Invalid scope error."""

    def __init__(self, description: str = "The requested scope is invalid"):
        super().__init__("invalid_scope", description)


@dataclass
class TokenResponse:
    """OAuth token response."""

    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str | None
    scope: str


@dataclass
class ClientRegistrationResponse:
    """OAuth client registration response (RFC 7591)."""

    client_id: str
    client_secret: str | None
    client_id_issued_at: int
    client_secret_expires_at: int
    redirect_uris: list[str]
    grant_types: list[str]
    token_endpoint_auth_method: str
    client_name: str


class OAuthService:
    """Service for OAuth 2.1 operations."""

    def __init__(self):
        self.issuer = settings.OAUTH_ISSUER
        self.access_token_lifetime = settings.ACCESS_TOKEN_LIFETIME
        self.refresh_token_lifetime = settings.REFRESH_TOKEN_LIFETIME
        self.auth_code_lifetime = settings.AUTH_CODE_LIFETIME
        self.supported_scopes = settings.OAUTH_SCOPES.split()

    # =========================================================================
    # PKCE Verification
    # =========================================================================

    @staticmethod
    def generate_code_verifier() -> str:
        """Generate a random code verifier for PKCE."""
        return secrets.token_urlsafe(64)[:128]

    @staticmethod
    def generate_code_challenge(verifier: str) -> str:
        """Generate code challenge from verifier using S256."""
        digest = hashlib.sha256(verifier.encode("ascii")).digest()
        return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")

    @staticmethod
    def verify_pkce(code_verifier: str, code_challenge: str) -> bool:
        """Verify PKCE: SHA256(code_verifier) == code_challenge."""
        expected_challenge = OAuthService.generate_code_challenge(code_verifier)
        return secrets.compare_digest(expected_challenge, code_challenge)

    # =========================================================================
    # Client Registration (RFC 7591)
    # =========================================================================

    async def register_client(
        self,
        server_id: UUID,
        redirect_uris: list[str],
        client_name: str,
        grant_types: list[str] | None = None,
        is_public: bool = True,
    ) -> ClientRegistrationResponse:
        """Register a new OAuth client (RFC 7591 Dynamic Client Registration)."""
        if not redirect_uris:
            raise InvalidRequestError("redirect_uris is required")

        # Validate grant types
        allowed_grant_types = ["authorization_code", "refresh_token"]
        if grant_types is None:
            grant_types = ["authorization_code", "refresh_token"]
        for gt in grant_types:
            if gt not in allowed_grant_types:
                raise InvalidRequestError(f"Unsupported grant type: {gt}")

        # Generate client credentials
        client_id = f"mcp_{secrets.token_urlsafe(24)}"
        client_secret = None
        client_secret_hash = None

        if not is_public:
            client_secret = secrets.token_urlsafe(48)
            client_secret_hash = hashlib.sha256(
                client_secret.encode()
            ).hexdigest()

        # Create client in database
        client_create = OAuthClientCreate(
            client_id=client_id,
            client_secret_hash=client_secret_hash,
            name=client_name,
            redirect_uris=redirect_uris,
            scopes=self.supported_scopes,
            grant_types=grant_types,
            is_public=is_public,
            server_id=server_id,
            registration_type="dynamic",
        )

        await Provider.oauth_client_repo().create(client_create)

        return ClientRegistrationResponse(
            client_id=client_id,
            client_secret=client_secret,
            client_id_issued_at=int(datetime.utcnow().timestamp()),
            client_secret_expires_at=0,  # Never expires
            redirect_uris=redirect_uris,
            grant_types=grant_types,
            token_endpoint_auth_method="none" if is_public else "client_secret_post",
            client_name=client_name,
        )

    # =========================================================================
    # Authorization Code
    # =========================================================================

    async def create_authorization_code(
        self,
        client_id: str,
        user_id: str,
        redirect_uri: str,
        scope: str,
        code_challenge: str,
        code_challenge_method: str,
        server_id: UUID,
        state: str | None = None,
    ) -> str:
        """Create an authorization code after user consent."""
        # Validate client
        client = await Provider.oauth_client_repo().get_by_client_id(client_id)
        if not client:
            raise InvalidClientError("Unknown client_id")

        # Validate redirect URI
        if redirect_uri not in client.redirect_uris:
            raise InvalidRequestError("redirect_uri not registered for this client")

        # Validate code challenge method (only S256 supported)
        if code_challenge_method != "S256":
            raise InvalidRequestError("Only S256 code_challenge_method is supported")

        # Validate scope
        requested_scopes = scope.split() if scope else []
        for s in requested_scopes:
            if s not in self.supported_scopes:
                raise InvalidScopeError(f"Unsupported scope: {s}")

        # Generate authorization code
        code = secrets.token_urlsafe(48)
        expires_at = datetime.utcnow() + timedelta(seconds=self.auth_code_lifetime)

        # Store the code
        code_create = OAuthAuthorizationCodeCreate(
            code=code,
            client_id=client.id,  # Use OAuthClient.id (UUID)
            user_id=user_id,
            redirect_uri=redirect_uri,
            scope=scope,
            code_challenge=code_challenge,
            code_challenge_method=code_challenge_method,
            server_id=server_id,
            expires_at=expires_at,
            state=state,
        )

        await Provider.oauth_authorization_code_repo().create(code_create)

        logger.info(f"Created authorization code for user {user_id}, client {client_id}")
        return code

    # =========================================================================
    # Token Exchange
    # =========================================================================

    async def exchange_code_for_tokens(
        self,
        code: str,
        client_id: str,
        redirect_uri: str,
        code_verifier: str,
        client_secret: str | None = None,
    ) -> TokenResponse:
        """Exchange authorization code for tokens with PKCE validation."""
        # Get and validate the authorization code
        auth_code = await Provider.oauth_authorization_code_repo().get_valid_code(code)
        if not auth_code:
            raise InvalidGrantError("Authorization code is invalid or expired")

        # Get client
        client = await Provider.oauth_client_repo().get_by_client_id(client_id)
        if not client:
            raise InvalidClientError("Unknown client_id")

        # Verify client matches
        if auth_code.client_id != client.id:
            raise InvalidGrantError("Authorization code was not issued to this client")

        # Verify redirect URI matches
        if auth_code.redirect_uri != redirect_uri:
            raise InvalidGrantError("redirect_uri does not match")

        # Verify PKCE
        if not self.verify_pkce(code_verifier, auth_code.code_challenge):
            raise InvalidGrantError("code_verifier verification failed")

        # For confidential clients, verify client_secret
        if not client.is_public:
            if not client_secret:
                raise InvalidClientError("client_secret required for confidential client")
            expected_hash = hashlib.sha256(client_secret.encode()).hexdigest()
            if not secrets.compare_digest(expected_hash, client.client_secret_hash or ""):
                raise InvalidClientError("Invalid client_secret")

        # Mark code as used (one-time use)
        used = await Provider.oauth_authorization_code_repo().mark_as_used(code)
        if not used:
            raise InvalidGrantError("Authorization code has already been used")

        # Generate tokens
        return await self._generate_tokens(
            client=client,
            user_id=auth_code.user_id,
            scope=auth_code.scope,
            server_id=auth_code.server_id,
        )

    async def refresh_tokens(
        self,
        refresh_token: str,
        client_id: str,
        scope: str | None = None,
        client_secret: str | None = None,
    ) -> TokenResponse:
        """Refresh tokens using a refresh token."""
        # Hash the refresh token to look it up
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        # Get and validate refresh token
        token_record = await Provider.oauth_refresh_token_repo().get_valid_token(
            token_hash
        )
        if not token_record:
            raise InvalidGrantError("Refresh token is invalid or expired")

        # Get client
        client = await Provider.oauth_client_repo().get_by_client_id(client_id)
        if not client:
            raise InvalidClientError("Unknown client_id")

        # Verify client matches
        if token_record.client_id != client.id:
            raise InvalidGrantError("Refresh token was not issued to this client")

        # For confidential clients, verify client_secret
        if not client.is_public:
            if not client_secret:
                raise InvalidClientError("client_secret required for confidential client")
            expected_hash = hashlib.sha256(client_secret.encode()).hexdigest()
            if not secrets.compare_digest(expected_hash, client.client_secret_hash or ""):
                raise InvalidClientError("Invalid client_secret")

        # Validate scope (can only reduce scope, not expand)
        final_scope = token_record.scope
        if scope:
            requested_scopes = set(scope.split())
            original_scopes = set(token_record.scope.split())
            if not requested_scopes.issubset(original_scopes):
                raise InvalidScopeError("Cannot expand scope beyond original grant")
            final_scope = scope

        # Revoke old refresh token (rotation for public clients)
        if client.is_public:
            await Provider.oauth_refresh_token_repo().revoke(token_hash)

        # Generate new tokens
        return await self._generate_tokens(
            client=client,
            user_id=token_record.user_id,
            scope=final_scope,
            server_id=token_record.server_id,
        )

    async def _generate_tokens(
        self,
        client: OAuthClient,
        user_id: str,
        scope: str,
        server_id: UUID,
    ) -> TokenResponse:
        """Generate access and refresh tokens."""
        now = datetime.utcnow()
        jti = secrets.token_urlsafe(24)

        # Generate access token (JWT)
        access_token_expires = now + timedelta(seconds=self.access_token_lifetime)
        access_token_payload = {
            "iss": self.issuer,
            "sub": user_id,
            "aud": str(server_id),
            "exp": int(access_token_expires.timestamp()),
            "iat": int(now.timestamp()),
            "jti": jti,
            "client_id": client.client_id,
            "scope": scope,
        }

        # Sign with RS256 if keys are configured, otherwise use HS256
        if settings.JWT_PRIVATE_KEY:
            access_token = jwt.encode(
                access_token_payload,
                settings.JWT_PRIVATE_KEY,
                algorithm=settings.JWT_ALGORITHM,
            )
        else:
            # Fallback to HS256 with admin key (not recommended for production)
            access_token = jwt.encode(
                access_token_payload,
                settings.ADMIN_ROUTES_API_KEY,
                algorithm="HS256",
            )

        # Store access token metadata
        access_token_hash = hashlib.sha256(access_token.encode()).hexdigest()
        access_token_create = OAuthAccessTokenCreate(
            token_hash=access_token_hash,
            jti=jti,
            client_id=client.id,
            user_id=user_id,
            scope=scope,
            audience=str(server_id),
            server_id=server_id,
            expires_at=access_token_expires,
        )
        access_token_record = await Provider.oauth_access_token_repo().create(
            access_token_create
        )

        # Generate refresh token
        refresh_token = secrets.token_urlsafe(64)
        refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        refresh_token_expires = now + timedelta(seconds=self.refresh_token_lifetime)

        refresh_token_create = OAuthRefreshTokenCreate(
            token_hash=refresh_token_hash,
            client_id=client.id,
            user_id=user_id,
            access_token_id=access_token_record.id,
            scope=scope,
            server_id=server_id,
            expires_at=refresh_token_expires,
        )
        await Provider.oauth_refresh_token_repo().create(refresh_token_create)

        logger.info(f"Generated tokens for user {user_id}, client {client.client_id}")

        return TokenResponse(
            access_token=access_token,
            token_type="Bearer",
            expires_in=self.access_token_lifetime,
            refresh_token=refresh_token,
            scope=scope,
        )

    # =========================================================================
    # Token Validation
    # =========================================================================

    async def validate_access_token(
        self, token: str, server_id: UUID | None = None
    ) -> dict[str, Any]:
        """
        Validate an access token and return its claims.

        Returns the decoded JWT payload if valid.
        Raises OAuthError if invalid.
        """
        try:
            # Decode and verify the JWT
            if settings.JWT_PUBLIC_KEY:
                payload = jwt.decode(
                    token,
                    settings.JWT_PUBLIC_KEY,
                    audience=str(server_id),  # TODO: poshel naxui
                    algorithms=[settings.JWT_ALGORITHM],
                    options={"require": ["exp", "iat", "sub", "jti"]},
                )
            else:
                # Fallback to HS256 with admin key
                payload = jwt.decode(
                    token,
                    settings.ADMIN_ROUTES_API_KEY,
                    algorithms=["HS256"],
                    options={"require": ["exp", "iat", "sub", "jti"]},
                )
        except jwt.ExpiredSignatureError:
            raise InvalidGrantError("Access token has expired")
        except jwt.InvalidTokenError as e:
            raise InvalidGrantError(f"Invalid access token: {e}")

        # Verify audience (server_id) if provided
        if server_id:
            token_audience = payload.get("aud")
            if token_audience != str(server_id):
                raise InvalidGrantError("Token not valid for this server")

        # Check if token is revoked
        jti = payload.get("jti")
        if jti:
            is_valid = await Provider.oauth_access_token_repo().is_token_valid(jti)
            if not is_valid:
                raise InvalidGrantError("Access token has been revoked")

        return payload

    # =========================================================================
    # Token Revocation
    # =========================================================================

    async def revoke_token(
        self,
        token: str,
        token_type_hint: str | None = None,
        client_id: str | None = None,
    ) -> bool:
        """Revoke a token (access or refresh)."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()

        # Try refresh token first if hint suggests it
        if token_type_hint != "access_token":
            revoked = await Provider.oauth_refresh_token_repo().revoke(token_hash)
            if revoked:
                return True

        # Try access token
        if token_type_hint != "refresh_token":
            # For access tokens, we need to find by hash
            access_token = await Provider.oauth_access_token_repo().get_by_token_hash(
                token_hash
            )
            if access_token:
                await Provider.oauth_access_token_repo().revoke(access_token.jti)
                return True

        return False


# Singleton instance
oauth_service = OAuthService()
