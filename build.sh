#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🔷 Iniciando Build do Backend SPH Partilhas (Multi-Context)..."

# Garante que estamos na raiz ou na pasta backend
if [ -d "backend" ]; then
    pip install -r backend/requirements.txt
else
    pip install -r requirements.txt
fi

echo "✅ Build concluído com sucesso!"
