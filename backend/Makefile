lint:
	uv run ruff check src --fix
	uv run ruff format src
	mypy src
lint-test-files:
	uv run ruff check tests --fix
	uv run ruff format tests
format:
	ruff check src --fix
	ruff format src --line-length=120
