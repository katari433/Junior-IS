# Use a lightweight Python 3.12 image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy and install project dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY app ./app

# Start the FastAPI server on port 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]