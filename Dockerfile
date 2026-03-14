# ══════════════════════════════════════════════════════════════
# Stage 1 — Build React frontend
# ══════════════════════════════════════════════════════════════
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies first (better layer caching)
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build
# Output: /app/frontend/dist


# ══════════════════════════════════════════════════════════════
# Stage 2 — Python Flask API + serve built frontend
# ══════════════════════════════════════════════════════════════
# FROM python:3.8-slim

FROM python:3.11-slim
# Prevent .pyc files and buffer output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Port read by app.py via os.environ.get("PORT", 5000)
ENV PORT=5000

# ── System dependencies required by TensorFlow & HDF5 ──
RUN apt-get update && apt-get install -y \
    build-essential \
    libatlas-base-dev \
    libhdf5-dev \
    libprotobuf-dev \
    protobuf-compiler \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies (cached layer) ──
COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --retries 5 --timeout 120 -r requirements.txt

# ── Application source code & ML artifacts ──
COPY . .

# ── Copy built React app from Stage 1 ──
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose Flask port
EXPOSE $PORT

# Start Flask (app.py reads PORT from environment)
CMD ["python", "app.py"]
