import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Cache headers for assets
  app.use((req, res, next) => {
    // Cache static assets for 1 year
    if (req.path.match(/\.(js|css|webp|png|jpg|jpeg|gif|woff|woff2|ttf|eot|svg)$/)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    }
    // Cache index.html for short time
    else if (req.path === "/" || req.path.endsWith("index.html")) {
      res.set("Cache-Control", "public, max-age=3600, must-revalidate");
    }
    // Default cache for other files
    else {
      res.set("Cache-Control", "public, max-age=3600");
    }
    next();
  });

  app.use(express.static(distPath, {
    etag: false,
    lastModified: false,
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
