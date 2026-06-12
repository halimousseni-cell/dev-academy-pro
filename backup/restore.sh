#!/bin/sh
# Restaure une sauvegarde chiffrée dans la base PostgreSQL.
#
# Usage : docker compose exec backup restore.sh /backups/devacademy_<horodatage>.sql.gz.enc
#
# Attention : la restauration s'applique sur la base existante
# (POSTGRES_DB) et peut écraser des données. À utiliser sur une base vide
# ou après confirmation explicite.
set -eu

FILE="${1:?Usage: restore.sh /backups/devacademy_<horodatage>.sql.gz.enc}"

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "BACKUP_ENCRYPTION_KEY n'est pas défini, restauration annulée." >&2
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "Fichier introuvable : $FILE" >&2
  exit 1
fi

export PGPASSWORD="$POSTGRES_PASSWORD"

echo "Restauration de $FILE vers la base '$POSTGRES_DB' ..."
openssl enc -d -aes-256-cbc -pbkdf2 -salt -pass "pass:$BACKUP_ENCRYPTION_KEY" -in "$FILE" \
  | gunzip \
  | psql -h "${PGHOST:-db}" -U "$POSTGRES_USER" "$POSTGRES_DB"

echo "Restauration terminée."
