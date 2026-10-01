import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json" };
const port = Number(process.argv[2] || 4173);
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    let file = normalize(join(root, pathname === "/" ? "index.html" : pathname));
    if (!file.startsWith(root)) throw new Error("invalid path");
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404); response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}`));
