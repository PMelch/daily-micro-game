const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

const STORE_PATH = path.join(__dirname, '..', 'test-api-data.json');

function request(server, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const opts = { hostname: '127.0.0.1', port: addr.port, path: urlPath, method };
    if (body) opts.headers = { 'Content-Type': 'application/json' };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data, json: () => JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('API', () => {
  let server;

  before(async () => {
    if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
    process.env.GAMES_DATA_PATH = STORE_PATH;
    // Clear cache
    for (const key of Object.keys(require.cache)) {
      if (key.includes('daily-games/dashboard')) delete require.cache[key];
    }
    const createApp = require('../app');
    server = createApp();
    await new Promise(r => server.listen(0, '127.0.0.1', r));
  });

  after(async () => {
    await new Promise(r => server.close(r));
    if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
  });

  it('GET /api/games returns empty list', async () => {
    const res = await request(server, 'GET', '/api/games');
    assert.equal(res.status, 200);
    assert.deepStrictEqual(res.json(), []);
  });

  it('POST /api/games/:id/rate returns 404 for unknown game', async () => {
    const res = await request(server, 'POST', '/api/games/nope/rate', { rating: 3 });
    assert.equal(res.status, 404);
  });

  it('GET / returns HTML', async () => {
    const res = await request(server, 'GET', '/');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('<!DOCTYPE html>') || res.body.includes('<html'));
  });
});
