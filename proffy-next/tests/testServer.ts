import http from 'http';
import type { AddressInfo } from 'net';
import { NextRequest } from 'next/server';

type RouteModule = {
  GET?: (request: NextRequest) => Promise<Response>;
  POST?: (request: NextRequest) => Promise<Response>;
};

const routes: Record<string, RouteModule> = {};

export function registerRoute(pathname: string, handlers: RouteModule) {
  routes[pathname] = handlers;
}

export async function createTestServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const route = routes[url.pathname];

    const handler = route?.[req.method as 'GET' | 'POST'];

    if (!handler) {
      res.writeHead(404).end();
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const body = Buffer.concat(chunks);

    const request = new NextRequest(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: body.length > 0 ? body : undefined,
    });

    const response = await handler(request);
    const responseBody = await response.text();

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(responseBody.length > 0 ? responseBody : undefined);
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;

  return {
    server,
    url: `http://localhost:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
