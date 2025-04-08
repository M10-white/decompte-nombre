# Étape 1 : Image ffmpeg minimale
FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

# Étape 2 : Image Node.js
FROM node:18-alpine

# Crée le dossier de travail
WORKDIR /app

# Copie uniquement le package.json pour installer les deps d’abord
COPY backend/package*.json ./

# Installe les dépendances (backend)
RUN npm install

# Copie le reste de ton backend
COPY backend/ .

# Copie ffmpeg depuis l'autre image
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg /usr/bin/ffprobe /usr/bin/ffprobe

# Expose le port
EXPOSE 8080

# Lancement de ton backend
CMD ["node", "index.js"]
