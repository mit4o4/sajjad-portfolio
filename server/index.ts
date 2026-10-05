import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist or dist/public in production
  const staticPath = (() => {
    if (process.env.NODE_ENV === "production") {
      const publicDir = path.resolve(__dirname, "public");
      return fs.existsSync(publicDir) ? publicDir : __dirname;
    }
    const devPublic = path.resolve(__dirname, "..", "dist", "public");
    const devDist = path.resolve(__dirname, "..", "dist");
    return fs.existsSync(devPublic) ? devPublic : devDist;
  })();

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
