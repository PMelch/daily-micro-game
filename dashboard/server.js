const createApp = require('./app');
const PORT = process.env.PORT || 3000;
const server = createApp();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Daily Games dashboard running on port ${PORT}`);
});
