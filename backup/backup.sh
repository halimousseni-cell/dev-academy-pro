#!/bin/sh
# Effectue un dump de la base PostgreSQL, le compresse puis le chiffre
# (AES-256-CBC, clé dérivée par PBKDF2 depuis BACKUP_ENCRYPTION_KEY).
# Purge ensuite les sauvegardes plus anciennes que BACKUP_RETENTION_DAYS.
set -eu

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "BACKUP_ENCRYPTION_KEY n'est pas défini, sauvegarde annulée." >&2
  exit 1
fi

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
FILE="/backups/devacademy_${TIMESTAMP}.sql.gz.enc"
TMP_FILE="${FILE}.tmp"

export PGPASSWORD="$POSTGRES_PASSWORD"

echo "Sauvegarde de la base '$POSTGRES_DB' vers $FILE ..."
pg_dump -h "${PGHOST:-db}" -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip \
  | openssl enc -aes-256-cbc -pbkdf2 -salt -pass "pass:$BACKUP_ENCRYPTION_KEY" -out "$TMP_FILE"

mv "$TMP_FILE" "$FILE"
echo "Sauvegarde terminée ($(du -h "$FILE" | cut -f1))."

RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
echo "Purge des sauvegardes de plus de $RETENTION_DAYS jour(s) ..."
find /backups -name 'devacademy_*.sql.gz.enc' -mtime +"$RETENTION_DAYS" -print -delete
