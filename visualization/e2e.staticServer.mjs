import { readFile } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, join, normalize } from "node:path"
import { fileURLToPath } from "node:url"

// Minimal static file server for the e2e suite. The built app is served over HTTP rather than opened
// from a file:// URL so each parallel Playwright context gets isolated, persistent origin storage —
// see playwright.config.ts. Node-only (no extra dependency, unlike `python -m http.server`).

const root = fileURLToPath(new URL("./dist/bundler/browser/", import.meta.url))
const port = Number(process.argv[2] ?? 9009)

const MIME = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".map": "application/json",
    ".wasm": "application/wasm"
}

createServer(async (request, response) => {
    try {
        const { pathname } = new URL(request.url, "http://localhost")
        let relative = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "")
        if (relative.endsWith("/")) {
            relative += "index.html"
        }
        const filePath = join(root, relative)
        const data = await readFile(filePath)
        response.writeHead(200, { "content-type": MIME[extname(relative)] ?? "application/octet-stream" })
        response.end(data)
    } catch {
        response.writeHead(404, { "content-type": "text/plain" })
        response.end("Not found")
    }
}).listen(port)
