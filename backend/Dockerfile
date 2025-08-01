# Usa un'immagine Node.js come base
FROM node:18-alpine

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia i file package.json e package-lock.json (o yarn.lock)
COPY backend/package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dei file del backend
COPY backend/. ./

# Costruisci l'applicazione NestJS (se necessario)
RUN npm run build

# Comando per avviare l'applicazione NestJS
CMD ["npm", "run", "start:prod"]