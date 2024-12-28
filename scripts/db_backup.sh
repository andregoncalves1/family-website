#!/usr/bin/env bash
# scripts/db_backup.sh
# Faz backup da base de dados 'famhealth' do container postgres_db

# Cria a pasta backups se não existir
mkdir -p "$(dirname "$0")/backups"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$(dirname "$0")/backups/famhealth_backup_${TIMESTAMP}.sql"

echo "Iniciando backup da DB famhealth para: $BACKUP_FILE"

docker exec -t postgres_db pg_dump -U admin famhealth > "$BACKUP_FILE"

echo "Backup concluído."
