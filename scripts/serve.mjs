import './build.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';

const root = fileURLToPath(new URL('../build/', import.meta.url)).replace(/\/$/, '');
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith('/')) {
          response.writeHead(301, {Location: `${pathname}/`}).end();
          return;
        }
        file = resolve(file, 'index.html');
      }
      const body = await readFile(file);
      const type = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'}[extname(file)] || 'application/octet-stream';
      response.writeHead(200, {'Content-Type':type});
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
      response.end(request.method === 'HEAD' ? undefined : await readFile(resolve(root, '404.html')));
    }
  } catch {
    response.writeHead(400).end('Bad request');
  }
});
server.listen(Number(process.env.PORT || 0), '127.0.0.1', () => {
  console.log(`Local: http://127.0.0.1:${server.address().port}`);
});
