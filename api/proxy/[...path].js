function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getProxyPath(req) {
  const url = new URL(req.url || "/", "http://localhost");
  const path = url.pathname.replace(/^\/api\/proxy\/?/, "/");
  return `${path}${url.search}`;
}

function getProxyHeaders(req) {
  const headers = {};
  for (const [key, value] of Object.entries(req.headers || {})) {
    const lower = key.toLowerCase();
    if (["host", "connection", "content-length"].includes(lower)) continue;
    if (value === undefined) continue;
    headers[key] = Array.isArray(value) ? value.join(", ") : String(value);
  }
  return headers;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function getRequestBody(req) {
  if (["GET", "HEAD"].includes(String(req.method || "GET").toUpperCase())) return undefined;
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  const raw = await readRawBody(req);
  return raw.length ? raw : undefined;
}

export default async function handler(req, res) {
  const apiOrigin = normalizeBaseUrl(process.env.BOT_API_ORIGIN || process.env.WEB_API_ORIGIN);
  if (!apiOrigin) {
    return res.status(500).json({
      ok: false,
      code: "API_ORIGIN_NOT_CONFIGURED",
      message: "BOT_API_ORIGIN belum diisi di Environment Variables Vercel.",
    });
  }

  try {
    const targetUrl = `${apiOrigin}${getProxyPath(req)}`;
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: getProxyHeaders(req),
      body: await getRequestBody(req),
      redirect: "manual",
    });

    const passthroughHeaders = [
      "content-type",
      "cache-control",
      "content-disposition",
    ];
    for (const name of passthroughHeaders) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    res.setHeader("cache-control", upstream.headers.get("cache-control") || "no-store");

    const body = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(body);
  } catch (err) {
    return res.status(502).json({
      ok: false,
      code: "API_PROXY_ERROR",
      message: err?.message || "Gagal menghubungkan Vercel ke backend bot.",
    });
  }
}
