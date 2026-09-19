// Equivalente ao `app.use(cors())` do servidor Express original (origem `*`, configuração padrão).
const METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE";

export function withCors(res: Response): Response {
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}

export function preflight(req: Request): Response {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": METHODS,
  });
  const requested = req.headers.get("access-control-request-headers");
  if (requested) {
    headers.set("Access-Control-Allow-Headers", requested);
    headers.set("Vary", "Access-Control-Request-Headers");
  }
  headers.set("Content-Length", "0");
  return new Response(null, { status: 204, headers });
}

export function json(body: unknown, status = 200): Response {
  return withCors(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }),
  );
}

export function empty(status: number): Response {
  return withCors(new Response(null, { status }));
}
