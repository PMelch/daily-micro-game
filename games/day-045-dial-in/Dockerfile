FROM node:20-alpine
WORKDIR /app
COPY server/package.json .
RUN npm install --production
COPY server/server.js .
EXPOSE 3045
CMD ["node", "server.js"]
