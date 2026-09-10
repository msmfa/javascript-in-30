import './build.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { promisify } from 'node:util';
import { brotliCompress, gzip } from 'node:zlib';
import { securityHeaders } from './security.mjs';

const root = fileURLToPath(new URL('../build/', import.meta.url)).replace(/\/$/, '');
const compress = {br:promisify(brotliCompress), gzip:promisify(gzip)};
const server = createServer(async (request, response) => {
  try {
    const requestURL = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(requestURL.pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith('/')) {
          response.writeHead(301, {...securityHeaders, Location: `${requestURL.pathname}/${requestURL.search}`}).end();
          return;
        }
        file = resolve(file, 'index.html');
      }
      const body = await readFile(file);
      const type = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'}[extname(file)] || 'application/octet-stream';
      const accepted = (request.headers['accept-encoding'] || '').split(',').map(value => {
        const [name, ...parameters] = value.trim().split(';');
        const quality = parameters.find(value => value.trim().startsWith('q='));
        return {name, quality:quality ? Number(quality.trim().slice(2)) : 1};
      });
      const encoding = ['image/webp','font/woff2'].includes(type) ? undefined : accepted.filter(value => value.quality > 0 && Object.hasOwn(compress, value.name)).sort((a,b) => b.quality - a.quality)[0]?.name;
      const payload = encoding ? await compress[encoding](body) : body;
      response.writeHead(200, {
        'Content-Type':type,
        'Content-Length':payload.length,
        'Cache-Control':file.startsWith(resolve(root, 'assets') + sep) ? 'public, max-age=31536000, immutable' : 'no-cache',
        'Vary':'Accept-Encoding',
        ...securityHeaders,
        ...(encoding ? {'Content-Encoding':encoding} : {})
      });
      response.end(request.method === 'HEAD' ? undefined : payload);
    } catch {
      response.writeHead(404, {...securityHeaders, 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache'});
      response.end(request.method === 'HEAD' ? undefined : await readFile(resolve(root, '404.html')));
    }
  } catch {
    response.writeHead(400).end('Bad request');
  }
});
server.listen(Number(process.env.PORT || 0), '127.0.0.1', () => {
  console.log(`Local: http://127.0.0.1:${server.address().port}`);
});
