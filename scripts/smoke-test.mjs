import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function appServer() {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = normalize(join(root, requested));
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    try {
      const file = await readFile(filePath);
      response.writeHead(200, { "content-type": types[extname(filePath)] ?? "application/octet-stream" });
      response.end(file);
    } catch {
      const fallback = await readFile(join(root, "index.html"));
      response.writeHead(200, { "content-type": types[".html"] });
      response.end(fallback);
    }
  });
}

const server = appServer();
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  const html = await fetch(`${baseUrl}/`).then((response) => response.text());
  const jsPath = html.match(/src="([^"]+\.js)"/)?.[1];
  const cssPath = html.match(/href="([^"]+\.css)"/)?.[1];
  if (!jsPath || !cssPath) throw new Error("Built index did not reference JS and CSS assets.");

  const [jsResponse, cssResponse, dataResponse] = await Promise.all([
    fetch(new URL(jsPath, `${baseUrl}/`)),
    fetch(new URL(cssPath, `${baseUrl}/`)),
    fetch(`${baseUrl}/data/live-deals.json`),
  ]);
  if (!jsResponse.ok || !cssResponse.ok || !dataResponse.ok) throw new Error("Built assets or live data were not reachable.");

  const js = await jsResponse.text();
  const css = await cssResponse.text();
  const data = await dataResponse.json();
  const expected = ["Kiwi Supplement Watch", "NZ supplement price monitor", "Price movement"];
  const missing = expected.filter((text) => !js.includes(text));
  if (missing.length) throw new Error(`Missing expected app text in bundle: ${missing.join(", ")}`);
  if (!css.includes(".app-shell")) throw new Error("Expected app shell styles were not present.");
  if (!Array.isArray(data.deals) || data.deals.length < 1) throw new Error("Live data JSON did not include deal rows.");
  if (!JSON.stringify(data.sourceHealth ?? []).includes("Chemist Warehouse NZ")) {
    throw new Error("Live data JSON did not include expected source health records.");
  }

  console.log(`Smoke test passed at ${baseUrl}`);
  console.log(`Verified assets: ${jsPath}, ${cssPath}, /data/live-deals.json`);
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}
