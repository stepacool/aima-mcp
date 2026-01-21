# Use the official Python 3.13 slim image as the base
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen

# Copy the contents of src directly to /app
COPY src/ ./

ENV PYTHONPATH="."
# Set the entrypoint
ENTRYPOINT ["uv", "run", "python", "entrypoints/api/main.py"]
