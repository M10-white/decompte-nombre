# Étape 1 : image avec FFmpeg
FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

# Étape 2 : image Node.js
FROM node:18-alpine

# Dossier de travail dans le backend
WORKDIR /backend

# Copie des fichiers package.json uniquement
COPY backend/package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code backend
COPY backend/. .

# ✅ Correction : copier depuis /usr/local/bin et non /usr/bin
COPY --from=ffmpeg /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /usr/local/bin/ffprobe /usr/local/bin/ffprobe

# Port Railway
ENV PORT=8080
EXPOSE 8080

# Lancement de ton serveur Express
CMD ["node", "index.js"]
