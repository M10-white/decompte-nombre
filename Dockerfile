# Étape 1 : Récupère ffmpeg
FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

# Étape 2 : Backend Node.js
FROM node:18-alpine

WORKDIR /app

# Dépendances backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copie l'intégralité du projet dans /app (inclut index.html, assets, etc.)
COPY . .

# Copie ffmpeg/ffprobe
COPY --from=ffmpeg /usr/local/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg /usr/local/bin/ffprobe /usr/bin/ffprobe

EXPOSE 8080

# Lance le serveur depuis le dossier backend
CMD ["node", "backend/index.js"]
