#!/usr/bin/env bash
# scripts/db_restore.sh
# Restaura um ficheiro .sql para a base de dados 'famhealth' no container postgres_db

if [ -z "$1" ]; then
  echo "Uso: $0 caminho/para/ficheiro.sql"
  exit 1
fi

RESTORE_FILE=$1

echo "Restaurando DB famhealth a partir de: $RESTORE_FILE"

docker exec -i postgres_db psql -U admin famhealth < "$RESTORE_FILE"

echo "Restauração concluída."
