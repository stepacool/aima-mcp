"""Request-scoped context for ephemeral environment variables."""

import os
from contextvars import ContextVar
from typing import Iterator

# ContextVar for per-request environment variable overrides
request_env_vars: ContextVar[dict[str, str]] = ContextVar(
    "request_env_vars", default={}
)


class DynamicEnvDict(dict):
    """
    A dict-like object that checks request context before static values.

    Lookup order:
    1. Per-request context (from headers via middleware)
    2. Static env vars (from DB, set at compile time)
    3. Real os.environ (fallback)
    """

    def __getitem__(self, key: str) -> str:
        # 1. Check per-request context
        ctx_vars = request_env_vars.get()
        if key in ctx_vars:
            return ctx_vars[key]
        # 2. Check static env vars (self)
        if key in dict.keys(self):
            return super().__getitem__(key)
        # 3. Fallback to real os.environ
        return os.environ[key]

    def get(self, key: str, default: str | None = None) -> str | None:
        """Get an environment variable with optional default."""
        try:
            return self[key]
        except KeyError:
            return default

    def __contains__(self, key: object) -> bool:
        """Check if key exists in any of the env sources."""
        if not isinstance(key, str):
            return False
        ctx_vars = request_env_vars.get()
        return key in ctx_vars or key in dict.keys(self) or key in os.environ

    def keys(self) -> list[str]:
        """Return all keys from all sources."""
        ctx_vars = request_env_vars.get()
        all_keys = set(os.environ.keys())
        all_keys.update(dict.keys(self))
        all_keys.update(ctx_vars.keys())
        return list(all_keys)

    def values(self) -> list[str]:
        """Return all values."""
        return [self[k] for k in self.keys()]

    def items(self) -> list[tuple[str, str]]:
        """Return all key-value pairs."""
        return [(k, self[k]) for k in self.keys()]

    def __iter__(self) -> Iterator[str]:
        """Iterate over all keys."""
        return iter(self.keys())

    def __len__(self) -> int:
        """Return count of all unique keys."""
        return len(self.keys())
