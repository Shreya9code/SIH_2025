# Use Python 3.10 base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy dependency file first (for caching)
COPY requirements.txt .

# Install system dependencies (mediapipe requires these)
RUN apt-get update && apt-get install -y \
    ffmpeg libsm6 libxext6 libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all app files
COPY . .

# Expose the port Render will use
EXPOSE 10000

# Start your app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]
