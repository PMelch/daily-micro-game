FROM node:20-alpine
WORKDIR /app
COPY server/package.json .
RUN npm install --production
COPY server/server.js .
COPY server/state.js .
EXPOSE 3057
CMD ["node", "server.js"]
