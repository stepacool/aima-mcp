import json
from enum import Enum

from pydantic import BaseModel


class DeploymentTarget(str, Enum):
    MODAL = "modal"
    CLOUDFLARE = "cloudflare"
    VERCEL = "vercel"
    STANDALONE = "standalone"


class DeploymentArtifact(BaseModel):
    """Generated deployment artifact."""

    target: DeploymentTarget
    files: dict[str, str]  # filename -> content
    instructions: str


class ArtifactGenerator:
    """Generates deployment-ready artifacts for MCP servers."""

    def generate(
        self,
        server_code: str,
        server_name: str,
        target: DeploymentTarget = DeploymentTarget.STANDALONE,
    ) -> DeploymentArtifact:
        """Generate deployment artifact for the specified target."""
        if target == DeploymentTarget.MODAL:
            return self._generate_modal(server_code, server_name)
        elif target == DeploymentTarget.CLOUDFLARE:
            return self._generate_cloudflare(server_code, server_name)
        elif target == DeploymentTarget.VERCEL:
            return self._generate_vercel(server_code, server_name)
        else:
            return self._generate_standalone(server_code, server_name)

    def _generate_standalone(
        self, server_code: str, server_name: str
    ) -> DeploymentArtifact:
        """Generate a standalone Python package."""
        requirements = """fastmcp>=2.0.0
pydantic>=2.0.0
"""

        readme = f"""# {server_name}

Auto-generated MCP server.

## Installation

```bash
pip install -r requirements.txt
```

## Running

```bash
python server.py
```

## Using with Claude Desktop

Add to your Claude Desktop config:

```json
{{
  "mcpServers": {{
    "{server_name}": {{
      "command": "python",
      "args": ["/path/to/server.py"]
    }}
  }}
}}
```
"""

        return DeploymentArtifact(
            target=DeploymentTarget.STANDALONE,
            files={
                "server.py": server_code,
                "requirements.txt": requirements,
                "README.md": readme,
            },
            instructions="Download the files and run `pip install -r requirements.txt && python server.py`",
        )

    def _generate_modal(self, server_code: str, server_name: str) -> DeploymentArtifact:
        """Generate a Modal deployment package."""
        modal_app = f'''"""
Modal deployment for {server_name} MCP server.
"""
import modal

app = modal.App("{server_name}")

image = modal.Image.debian_slim().pip_install("fastmcp>=2.0.0", "pydantic>=2.0.0")


@app.function(image=image)
@modal.asgi_app()
def serve():
    from fastmcp import FastMCP
    from pydantic import Field

    # Server code embedded below
{self._indent_code(server_code, 4)}

    return mcp.http_app()
'''

        readme = f"""# {server_name} - Modal Deployment

## Prerequisites

1. Install Modal: `pip install modal`
2. Authenticate: `modal token new`

## Deploy

```bash
modal deploy app.py
```

## Usage

After deployment, Modal will provide a URL for your MCP server.
Add it to Claude Desktop config as an SSE endpoint.
"""

        return DeploymentArtifact(
            target=DeploymentTarget.MODAL,
            files={
                "app.py": modal_app,
                "README.md": readme,
            },
            instructions="Install Modal CLI, authenticate, and run `modal deploy app.py`",
        )

    def _generate_cloudflare(
        self, server_code: str, server_name: str
    ) -> DeploymentArtifact:
        """Generate a Cloudflare Workers deployment package."""
        worker_code = f'''"""
Cloudflare Workers deployment for {server_name} MCP server.

Note: This requires the MCP server to be adapted for the Workers runtime.
For full Python support, consider using Cloudflare's Python Workers (beta).
"""
from fastmcp import FastMCP
from pydantic import Field

# Server implementation
{server_code}

# Export for Workers
app = mcp.http_app()
'''

        wrangler_toml = f'''name = "{server_name}"
main = "server.py"
compatibility_date = "2024-01-01"

[build]
command = "pip install -r requirements.txt -t ."
'''

        requirements = """fastmcp>=2.0.0
pydantic>=2.0.0
"""

        readme = f"""# {server_name} - Cloudflare Workers Deployment

## Prerequisites

1. Install Wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`

## Deploy

```bash
wrangler deploy
```

## Note

Full Python support in Cloudflare Workers is in beta.
Consider using Modal or a traditional server for production.
"""

        return DeploymentArtifact(
            target=DeploymentTarget.CLOUDFLARE,
            files={
                "server.py": worker_code,
                "wrangler.toml": wrangler_toml,
                "requirements.txt": requirements,
                "README.md": readme,
            },
            instructions="Install Wrangler CLI, authenticate, and run `wrangler deploy`",
        )

    def _generate_vercel(
        self, server_code: str, server_name: str
    ) -> DeploymentArtifact:
        """Generate a Vercel serverless deployment package."""
        api_handler = f'''"""
Vercel serverless function for {server_name} MCP server.
"""
from fastmcp import FastMCP
from pydantic import Field

# Server implementation
{server_code}

# Export handler
handler = mcp.http_app()
'''

        vercel_json = json.dumps(
            {
                "version": 2,
                "builds": [{"src": "api/server.py", "use": "@vercel/python"}],
                "routes": [{"src": "/(.*)", "dest": "api/server.py"}],
            },
            indent=2,
        )

        requirements = """fastmcp>=2.0.0
pydantic>=2.0.0
"""

        readme = f"""# {server_name} - Vercel Deployment

## Prerequisites

1. Install Vercel CLI: `npm install -g vercel`
2. Authenticate: `vercel login`

## Deploy

```bash
vercel deploy
```

## Production

```bash
vercel deploy --prod
```
"""

        return DeploymentArtifact(
            target=DeploymentTarget.VERCEL,
            files={
                "api/server.py": api_handler,
                "vercel.json": vercel_json,
                "requirements.txt": requirements,
                "README.md": readme,
            },
            instructions="Install Vercel CLI, authenticate, and run `vercel deploy`",
        )

    def _indent_code(self, code: str, spaces: int) -> str:
        """Indent code by the specified number of spaces."""
        indent = " " * spaces
        lines = code.split("\n")
        return "\n".join(indent + line if line.strip() else line for line in lines)


# Singleton instance
_artifact_generator: ArtifactGenerator | None = None


def get_artifact_generator() -> ArtifactGenerator:
    global _artifact_generator
    if _artifact_generator is None:
        _artifact_generator = ArtifactGenerator()
    return _artifact_generator
