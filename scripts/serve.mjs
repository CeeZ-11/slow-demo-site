// Minimal static server for local testing (`npm run dev`). Serves public/ with
// no compression, matching what the page is meant to be audited for.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'public');
const port = Number(process.env.PORT ?? 5050);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath);
    if (!file.startsWith(root) || !fs.existsSync(file)) {
      res.writeHead(404).end('Not found');
      return;
    }
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, '127.0.0.1', () => console.log(`Slow demo site on http://127.0.0.1:${port}`));
