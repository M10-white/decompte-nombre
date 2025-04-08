# Étape 1 : Récupère ffmpeg
FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

# Étape 2 : Backend Node.js
FROM node:18-alpine

WORKDIR /app

# Copie les dépendances backend
COPY backend/package*.json ./
RUN npm install

# Copie les fichiers backend
COPY backend/ .

# Corrigé ici : copie ffmpeg depuis /usr/local/bin
COPY --from=ffmpeg /usr/local/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg /usr/local/bin/ffprobe /usr/bin/ffprobe

# Port d'écoute
EXPOSE 8080

# Lancement
CMD ["node", "index.js"]
