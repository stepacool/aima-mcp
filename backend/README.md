This is a service that generates MCP servers for users from prompts and structured setup wizard. 

Paid tier does a VPS hosting and isn't really limited, free tier is all about attaching a generated starlette app with
up to 3 endpoints/actions to the running main fastapi app - see load_and_register_all_mcp_servers.

Tests run on a real postgres db.

The code is split into 3 parts:
- infrastructure - this is where db and other external tools live, encapsulated by clients that return dataclasses/pydantic models
or similar "clean" types instead of json. SQLALchemy models are exceptions, they don't get mapped into Pydantic/Dataclasses, but they are alike, especially with MappedColumn
- entrypoints - the layer for APIs/Scripts and anything you actually run, it exports stuff from infra/core and can have simple logic inside
- core - the layer for complex logic that is not infrastructural. Can "skip" infra for too-common stuff like openai client.

