FROM python:3.12-slim

# Evita que Python se quede esperando logs
ENV PYTHONUNBUFFERED=1

# Forzar a que las librerías de Python confíen en el almacén de certificados del sistema
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

WORKDIR /code

# Instalamos certificados, herramientas de diagnóstico de red y dependencias de sistema para psycopg2
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    dnsutils \
    gcc \
    libpq-dev \
    python3-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Instalamos librerías
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código
COPY . .

# Comando de arranque: uviorn sobre el paquete app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]