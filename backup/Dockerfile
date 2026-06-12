# syntax=docker/dockerfile:1

# Sauvegardes chiffrées périodiques de la base PostgreSQL. Basé sur l'image
# postgres:16-alpine pour disposer de pg_dump/psql en version compatible
# avec le serveur (service "db" de docker-compose.yml).
FROM postgres:16-alpine

RUN apk add --no-cache openssl

COPY backup.sh restore.sh entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/restore.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
