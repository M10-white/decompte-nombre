# Étape 1 : FFmpeg (à copier)
FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

# Étape 2 : Node backend
FROM node:18-alpine

# Dossier de travail
WORKDIR /app

# Copie du code source
COPY . .

# Copie de ffmpeg et ffprobe depuis l'étape précédente
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg /usr/bin/ffprobe /usr/bin/ffprobe

# Installation des dépendances backend
WORKDIR /app/backend
RUN npm install

# Expose le port
EXPOSE 8080

# Lancement de ton backend
CMD ["node", "index.js"]
