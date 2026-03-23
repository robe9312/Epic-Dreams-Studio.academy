FROM python:3.12-slim

# Evita que Python se quede esperando logs
ENV PYTHONUNBUFFERED=1

WORKDIR /code

# Instalamos certificados y herramientas de red básicas
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Instalamos librerías
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código
COPY . .

# Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]