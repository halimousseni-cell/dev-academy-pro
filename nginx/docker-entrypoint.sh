#!/bin/sh
# Recharge périodiquement la configuration Nginx pour prendre en compte le
# renouvellement automatique des certificats Let's Encrypt par Certbot
# (le conteneur certbot ne peut pas signaler ce conteneur directement).
set -e

(
  while :; do
    sleep 6h
    nginx -s reload
  done
) &
