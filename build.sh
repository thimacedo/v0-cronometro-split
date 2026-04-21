#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🔷 Iniciando Build do Backend SPH Partilhas..."

# Instala dependências do Python
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "✅ Build concluído com sucesso!"
