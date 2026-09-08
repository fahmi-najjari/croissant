# Use the official Python 3.12 image as the base
FROM python:3.12

# Set the working directory inside the container to /app
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies listed in requirements.txt (Django, DRF, etc.)
RUN pip install -r requirements.txt

# Copy all project files from your local folder into the container
COPY . .

# Default command: run Django’s development server on all interfaces, port 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
