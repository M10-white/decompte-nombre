FROM jrottenberg/ffmpeg:4.4-alpine as ffmpeg

FROM node:18-alpine

WORKDIR /app

# Copie le backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copie tout le reste (frontend inclus)
COPY . .

# Copie ffmpeg et ffprobe depuis l'étape ffmpeg
COPY --from=ffmpeg /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /usr/local/bin/ffprobe /usr/local/bin/ffprobe

# Lien symbolique si nécessaire
RUN ln -s /usr/local/bin/ffmpeg /usr/bin/ffmpeg && \
    ln -s /usr/local/bin/ffprobe /usr/bin/ffprobe

EXPOSE 8080

CMD ["node", "backend/index.js"]
