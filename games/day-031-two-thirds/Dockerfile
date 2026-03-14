FROM node:22-alpine
WORKDIR /app
RUN npm install ws
COPY server.js game-logic.js ./
EXPOSE 3031
CMD ["node", "server.js"]
