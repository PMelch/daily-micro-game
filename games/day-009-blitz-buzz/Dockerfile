FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY server.js .
COPY game-logic.js .
COPY index.html .
EXPOSE 3009
CMD ["node", "server.js"]
