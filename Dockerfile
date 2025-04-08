# Étape 1 : image avec FFmpeg
FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

# Étape 2 : image Node.js
FROM node:18-alpine

# Dossier de travail => on reste dans /backend comme chez toi
WORKDIR /backend

# Copie des fichiers nécessaires depuis le dossier local backend/
COPY backend/package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code backend
COPY backend/. .

# Ajout de ffmpeg/ffprobe à l'image
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg /usr/bin/ffprobe /usr/bin/ffprobe

# Port Railway
ENV PORT=8080
EXPOSE 8080

# Commande de lancement
CMD ["node", "index.js"]
