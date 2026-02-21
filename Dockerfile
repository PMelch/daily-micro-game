FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY dashboard/ ./dashboard/
COPY shared/ ./shared/
EXPOSE 3000
ENV GAMES_DATA_PATH=/app/data/games.json
CMD ["node", "dashboard/server.js"]
