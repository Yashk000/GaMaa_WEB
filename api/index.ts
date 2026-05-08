import { Readable } from 'node:stream';
import app from '../dist/server/index.js';

function buildRequest(req: Request): Request {
  return req;
}

function readBody(req: import('http').IncomingMessage): ReadableStream | undefined {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  return Readable.toWeb(req) as ReadableStream;
}

export default async function handler(
  req: import('http').IncomingMessage,
  res: import('http').ServerResponse,
) {
  const protocol = req.headers['x-forwarded-proto'] ?? 'https';
  const host = req.headers.host ?? 'localhost';
  const url = new URL(req.url ?? '/', `${protocol}://${host}`);
  const body = readBody(req);

  const request = new Request(buildRequest(url.toString()), {
    method: req.method,
    headers: req.headers as HeadersInit,
    body,
    // Required when using a stream body in Node.
    duplex: body ? 'half' : undefined,
  });

  const response = await app.fetch(request);

  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const responseBody = Buffer.from(await response.arrayBuffer());
  res.end(responseBody);
}
