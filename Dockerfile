FROM node:18-bullseye

# Installation de ffmpeg directement depuis apt
RUN apt update && apt install -y ffmpeg && apt clean

# Création du dossier de travail
WORKDIR /app

# Installation des dépendances backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copie de tout le projet (frontend + backend)
COPY . .

# Exposition du port
EXPOSE 8080

# Lancement de l'application
CMD ["node", "backend/index.js"]
