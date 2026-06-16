# ============================================================
# Stage 1: Install dependencies (Builder)
# ============================================================
FROM python:3.12-slim AS builder

WORKDIR /app
COPY requirements.txt .

# Virtual environment khusus, supaya stage final tidak ikut bawa
# build tools/cache pip dari stage ini.
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# ============================================================
# Stage 2: Production (final image, ringan + non-root)
# ============================================================
FROM python:3.12-slim

WORKDIR /app

# Copy HANYA virtual environment dari stage builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY . .

# Setup user non-root — container tidak boleh jalan sebagai root
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8002

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8002/health')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
