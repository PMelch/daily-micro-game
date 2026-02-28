FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY game.js server.js ./
ENV PORT=3017
EXPOSE 3017
CMD ["node", "server.js"]
