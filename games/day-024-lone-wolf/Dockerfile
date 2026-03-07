FROM node:22-alpine
WORKDIR /app
RUN npm install ws
COPY server.js game-logic.js ./
EXPOSE 3024
CMD ["node", "server.js"]
