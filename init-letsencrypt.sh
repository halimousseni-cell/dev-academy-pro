#!/bin/bash
# Initialise les certificats Let's Encrypt pour le reverse proxy Nginx.
#
# À exécuter une seule fois sur le serveur de production, après avoir
# configuré DOMAIN et LETSENCRYPT_EMAIL dans .env et pointé le DNS du
# domaine vers ce serveur.
#
# Étapes : génère un certificat auto-signé temporaire pour que Nginx
# démarre, lance la pile, demande le vrai certificat à Let's Encrypt via le
# challenge HTTP-01 (servi par Nginx sur /.well-known/acme-challenge/), puis
# recharge Nginx avec le certificat obtenu.

set -euo pipefail

if [ ! -f .env ]; then
  echo "Fichier .env introuvable. Copiez .env.example en .env et renseignez DOMAIN / LETSENCRYPT_EMAIL." >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a; source .env; set +a

if [ -z "${DOMAIN:-}" ] || [ -z "${LETSENCRYPT_EMAIL:-}" ]; then
  echo "DOMAIN et LETSENCRYPT_EMAIL doivent être définis dans .env." >&2
  exit 1
fi

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
CERT_PATH="certbot/conf/live/$DOMAIN"

echo "### Création d'un certificat temporaire pour $DOMAIN ..."
mkdir -p "$CERT_PATH"
docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  --entrypoint sh certbot/certbot -c "
    mkdir -p '/etc/letsencrypt/live/$DOMAIN' &&
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
      -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
      -subj '/CN=localhost'
  "

echo "### Démarrage de Nginx avec le certificat temporaire ..."
$COMPOSE up -d nginx

echo "### Suppression du certificat temporaire ..."
docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  --entrypoint sh certbot/certbot -c "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf"

echo "### Demande du certificat Let's Encrypt pour $DOMAIN ..."
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --webroot -w /var/www/certbot \
    --email "$LETSENCRYPT_EMAIL" -d "$DOMAIN" \
    --rsa-key-size 4096 --agree-tos --no-eff-email

echo "### Rechargement de Nginx avec le certificat définitif ..."
$COMPOSE exec nginx nginx -s reload

echo "Terminé. Le renouvellement automatique est géré par le service 'certbot'."
