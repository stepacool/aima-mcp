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
    "urllib.parse": None,  # URL parsing utilities
    "urlparse": None,
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

FREE_TIER_MAX_TOOLS = 5


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
    """Validates that code only uses curated libraries and matches expected schema."""

    tier: Tier
    limits: TierLimits

    def __init__(self, tier: Tier = Tier.FREE):
        self.tier = tier
        self.limits = TIER_LIMITS[tier]

    def validate(
        self,
        code: str,
        expected_params: set[str] | None = None,
        expected_name: str | None = None,
    ) -> list[str]:
        """
        Validate code against tier restrictions and optional schema constraints.

        Args:
            code: Python source code to validate.
            expected_params: If provided, the function signature must contain
                exactly these parameter names (no more, no less).
            expected_name: If provided, the function must be named this.

        Returns:
            List of validation errors (empty if valid).
        """
        errors: list[str] = []

        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return [f"Syntax error: {e}"]

        if not self.limits.curated_only:
            # Paid tier: skip import checks but still validate signature
            if expected_params is not None or expected_name is not None:
                errors.extend(
                    self._validate_signature(tree, expected_params, expected_name)
                )
            return errors

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
                    if node.func.id in (
                        "eval",
                        "exec",
                        "compile",
                        "open",
                        "dir",
                        "globals",
                        "locals",
                        "vars",
                    ):
                        errors.append(
                            f"Function '{node.func.id}' is not allowed (restricted at runtime)"
                        )

        # Validate function signature against expected schema
        if expected_params is not None or expected_name is not None:
            errors.extend(
                self._validate_signature(tree, expected_params, expected_name)
            )

        return errors

    def _validate_signature(
        self,
        tree: ast.Module,
        expected_params: set[str] | None,
        expected_name: str | None,
    ) -> list[str]:
        """
        Check that the first async def in the code has the expected name and params.

        This prevents the LLM from renaming parameters that the tool schema defines,
        which would cause runtime validation failures when MCP clients call the tool
        with the schema-defined parameter names.
        """
        errors: list[str] = []

        # Find the first async function definition
        func_def: ast.AsyncFunctionDef | ast.FunctionDef | None = None
        for node in ast.walk(tree):
            if isinstance(node, ast.AsyncFunctionDef):
                func_def = node
                break
            if isinstance(node, ast.FunctionDef) and func_def is None:
                func_def = node

        if func_def is None:
            errors.append("No function definition found in generated code")
            return errors

        # Check function name
        if expected_name is not None and func_def.name != expected_name:
            errors.append(
                f"Function name mismatch: expected '{expected_name}', "
                f"got '{func_def.name}'"
            )

        # Check parameter names
        if expected_params is not None:
            # Collect actual param names, excluding 'self' and params with defaults
            actual_params: set[str] = set()
            for arg in func_def.args.args:
                if arg.arg != "self":
                    actual_params.add(arg.arg)
            # Also include keyword-only args
            for arg in func_def.args.kwonlyargs:
                actual_params.add(arg.arg)

            missing = expected_params - actual_params
            extra = actual_params - expected_params

            if missing:
                errors.append(
                    f"Missing parameters in code signature: {sorted(missing)}. "
                    f"Expected exactly: {sorted(expected_params)}"
                )
            if extra:
                errors.append(
                    f"Extra parameters in code signature: {sorted(extra)}. "
                    f"Expected exactly: {sorted(expected_params)}"
                )

        return errors

    def _check_import(self, module_name: str) -> str | None:
        """Check if a module import is allowed."""
        base_module = module_name.split(".")[0]

        if module_name in BLOCKED_MODULES or base_module in BLOCKED_MODULES:
            return f"Module '{module_name}' is not allowed in free tier"

        if base_module not in CURATED_LIBRARIES:
            return f"Module '{module_name}' is not in curated libraries. Allowed: {', '.join(sorted(CURATED_LIBRARIES.keys()))}"

        return None

    def _check_import_from(self, module: str, names: list[ast.alias]) -> str | None:
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
        params: list[str] = []
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
