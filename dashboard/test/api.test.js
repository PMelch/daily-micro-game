import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = path.join(import.meta.dir, '..', 'test-api-data.json');

describe('API', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
    process.env.GAMES_DATA_PATH = STORE_PATH;
    const createApp = require('../app');
    server = createApp();
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterAll(async () => {
    await new Promise(r => server.close(r));
    if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
  });

  it('GET /api/games returns empty list', async () => {
    const res = await fetch(`${baseUrl}/api/games`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('POST /api/games/:id/rate returns 404 for unknown game', async () => {
    const res = await fetch(`${baseUrl}/api/games/nope/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 3 })
    });
    expect(res.status).toBe(404);
  });

  it('GET / returns HTML', async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('<html');
  });
});
