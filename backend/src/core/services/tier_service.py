"""Tier management and curated library validation for freemium model."""

import ast
from enum import Enum
from typing import Any

from pydantic import BaseModel


class Tier(str, Enum):
    FREE = "free"
    PAID = "paid"


# Curated libraries allowed for free tier
CURATED_LIBRARIES = {
    # HTTP client
    "httpx": ["AsyncClient", "Client", "get", "post", "put", "patch", "delete"],
    "aiohttp": ["ClientSession"],
    # Database clients
    "asyncpg": ["connect", "create_pool", "Connection", "Pool"],
    "aiomysql": ["connect", "create_pool", "Connection", "Pool"],
    "mysql.connector": ["connect", "MySQLConnection"],
    "psycopg": ["connect", "AsyncConnection", "Connection"],
    # Google APIs
    "google.oauth2.credentials": ["Credentials"],
    "googleapiclient.discovery": ["build"],
    "gspread": ["authorize", "Client", "Spreadsheet", "Worksheet"],
    "google.auth": ["default"],
    # Standard library (always allowed)
    "json": None,  # None means all exports allowed
    "datetime": None,
    "typing": None,
    "pydantic": ["BaseModel", "Field"],
    "asyncio": None,
    "re": None,
    "os": ["getenv", "environ"],  # Limited os access
    "pathlib": ["Path"],
    "urllib": None,  # URL parsing utilities
    "base64": None,  # Base64 encoding/decoding
    "hashlib": None,  # Hashing functions
    "uuid": None,  # UUID generation
    "math": None,  # Math functions
    "random": None,  # Random number generation
    "string": None,  # String constants and utilities
    "collections": None,  # Collection types
    "itertools": None,  # Iterator utilities
    "functools": None,  # Function utilities
    "time": None,  # Time functions
    "dateutil": None,  # Date utilities
}

# Dangerous modules that should never be allowed
BLOCKED_MODULES = {
    "subprocess",
    "os.system",
    "eval",
    "exec",
    "compile",
    "open",  # file operations
    "builtins",
    "__builtins__",
    "importlib",
    "sys",
    "ctypes",
    "pickle",
    "marshal",
    "socket",  # raw sockets not allowed, use httpx
}

FREE_TIER_MAX_TOOLS = 3


class TierLimits(BaseModel):
    """Limits for each tier."""

    max_tools: int
    can_deploy: bool
    curated_only: bool


TIER_LIMITS = {
    Tier.FREE: TierLimits(max_tools=3, can_deploy=False, curated_only=True),
    Tier.PAID: TierLimits(max_tools=100, can_deploy=True, curated_only=False),
}


class CodeValidationError(Exception):
    """Raised when code validation fails."""

    pass


class CodeValidator:
    """Validates that code only uses curated libraries."""

    def __init__(self, tier: Tier = Tier.FREE):
        self.tier = tier
        self.limits = TIER_LIMITS[tier]

    def validate(self, code: str) -> list[str]:
        """
        Validate code against tier restrictions.

        Returns list of validation errors (empty if valid).
        """
        errors = []

        if not self.limits.curated_only:
            return errors  # Paid tier can use any library

        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return [f"Syntax error: {e}"]

        # Check imports
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    error = self._check_import(alias.name)
                    if error:
                        errors.append(error)

            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    error = self._check_import_from(node.module, node.names)
                    if error:
                        errors.append(error)

            # Check for dangerous function calls
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in ("eval", "exec", "compile", "open"):
                        errors.append(f"Function '{node.func.id}' is not allowed")

        return errors

    def _check_import(self, module_name: str) -> str | None:
        """Check if a module import is allowed."""
        base_module = module_name.split(".")[0]

        if module_name in BLOCKED_MODULES or base_module in BLOCKED_MODULES:
            return f"Module '{module_name}' is not allowed in free tier"

        if base_module not in CURATED_LIBRARIES:
            return f"Module '{module_name}' is not in curated libraries. Allowed: {', '.join(sorted(CURATED_LIBRARIES.keys()))}"

        return None

    def _check_import_from(
        self, module: str, names: list[ast.alias]
    ) -> str | None:
        """Check if a from-import is allowed."""
        base_module = module.split(".")[0]

        if module in BLOCKED_MODULES or base_module in BLOCKED_MODULES:
            return f"Module '{module}' is not allowed in free tier"

        if base_module not in CURATED_LIBRARIES:
            return f"Module '{module}' is not in curated libraries"

        allowed_names = CURATED_LIBRARIES.get(base_module)
        if allowed_names is None:
            return None  # All exports allowed

        for alias in names:
            if alias.name != "*" and alias.name not in allowed_names:
                return f"'{alias.name}' from '{module}' is not allowed. Allowed: {', '.join(allowed_names)}"

        return None


class ToolCodeTemplate:
    """Generate safe tool code from action specs."""

    @staticmethod
    def generate_tool_function(
        name: str,
        description: str,
        parameters: list[dict[str, Any]],
        implementation: str,
    ) -> str:
        """Generate a tool function with proper structure."""
        # Build parameter string
        params = []
        for p in parameters:
            param_name = p.get("name", "arg")
            param_type = p.get("type", "str")
            param_desc = p.get("description", "")
            params.append(
                f'{param_name}: {param_type} = Field(description="{param_desc}")'
            )

        params_str = ", ".join(params) if params else ""

        # Wrap implementation safely
        code = f'''
@mcp.tool()
async def {name}({params_str}):
    """{description}"""
{_indent(implementation, 4)}
'''
        return code.strip()


def _indent(text: str, spaces: int) -> str:
    """Indent text by specified spaces."""
    indent = " " * spaces
    lines = text.strip().split("\n")
    return "\n".join(indent + line for line in lines)


def get_tier_limits(tier: Tier) -> TierLimits:
    """Get limits for a tier."""
    return TIER_LIMITS[tier]


def validate_tool_count(current_count: int, tier: Tier) -> bool:
    """Check if adding another tool is allowed."""
    limits = TIER_LIMITS[tier]
    return current_count < limits.max_tools
