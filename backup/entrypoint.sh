#!/bin/sh
# Boucle de sauvegarde périodique : exécute backup.sh immédiatement, puis
# toutes les BACKUP_INTERVAL_HOURS heures. Le conteneur reste démarré entre
# deux sauvegardes pour permettre une restauration manuelle via
# `docker compose exec backup restore.sh ...`.
set -eu

INTERVAL_HOURS="${BACKUP_INTERVAL_HOURS:-24}"

trap exit TERM

while :; do
  backup.sh
  sleep "${INTERVAL_HOURS}h" &
  wait $!
done
