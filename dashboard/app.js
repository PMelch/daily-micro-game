const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

function createApp() {
  // Re-init store with current env
  const storePath = require.resolve('./store');
  delete require.cache[storePath];
  const store = require('./store');

  const gamesDir = path.join(__dirname, '..', 'games');
  const publicDir = path.join(__dirname, 'public');

  const MIME = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  };

  function serveStatic(dir, urlPath, res) {
    const filePath = path.join(dir, urlPath);
    // Prevent directory traversal
    if (!filePath.startsWith(dir)) { res.writeHead(403); res.end(); return true; }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return true;
    }
    // Try index.html for directories
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
      return true;
    }
    return false;
  }

  function readBody(req) {
    return new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(d)); });
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // API routes
    if (pathname === '/api/games' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(store.listGames()));
      return;
    }

    if (pathname === '/api/tags' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(store.allTags()));
      return;
    }

    const rateMatch = pathname.match(/^\/api\/games\/([^/]+)\/rate$/);
    if (rateMatch && req.method === 'POST') {
      try {
        const body = JSON.parse(await readBody(req));
        store.rateGame(rateMatch[1], body.rating);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        const status = e.message.includes('not found') ? 404 : 400;
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }

    // Serve game files under /games/
    if (pathname.startsWith('/games/')) {
      const gamePath = pathname.slice(7); // remove /games/
      if (serveStatic(gamesDir, gamePath, res)) return;
    }

    // Serve dashboard static files
    if (pathname === '/' || pathname === '/index.html') {
      if (serveStatic(publicDir, 'index.html', res)) return;
    }
    if (serveStatic(publicDir, pathname.slice(1), res)) return;

    res.writeHead(404);
    res.end('Not Found');
  });

  return server;
}

module.exports = createApp;
