FROM node:20-alpine
WORKDIR /app
COPY server/package.json .
RUN npm install --production
COPY server/game-logic.js ./game-logic.js
COPY server/server.js ./server.js
EXPOSE 3064
CMD ["node", "server.js"]
