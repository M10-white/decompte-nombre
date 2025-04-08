# Utilise une image Node.js officielle avec ffmpeg
FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

FROM node:18-alpine

# Copie ffmpeg depuis la 1ère image
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg /usr/bin/ffprobe /usr/bin/ffprobe

# Crée et définit le dossier de travail
WORKDIR /app

# Copie tous les fichiers
COPY . .

# Installe les dépendances
RUN npm install

# Lance le backend
CMD ["node", "backend/index.js"]
