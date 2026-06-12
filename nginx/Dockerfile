# syntax=docker/dockerfile:1

# Reverse proxy HTTPS (Let's Encrypt) devant le conteneur frontend.
# Le template /etc/nginx/templates/app.conf.template est rendu au démarrage
# par l'entrypoint officiel de l'image (envsubst, variable ${DOMAIN}).
FROM nginx:alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY templates/ /etc/nginx/templates/
COPY docker-entrypoint.sh /docker-entrypoint.d/40-reload-loop.sh
RUN chmod +x /docker-entrypoint.d/40-reload-loop.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1
