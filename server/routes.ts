import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve sitemap.xml and robots.txt from public folder
  const publicPath = path.resolve(import.meta.dirname, "..", "public");
  
  app.get("/sitemap.xml", (_req, res) => {
    const filePath = path.join(publicPath, "sitemap.xml");
    if (fs.existsSync(filePath)) {
      res.set("Content-Type", "application/xml");
      res.sendFile(filePath);
    } else {
      res.status(404).send("Sitemap not found");
    }
  });

  app.get("/robots.txt", (_req, res) => {
    const filePath = path.join(publicPath, "robots.txt");
    if (fs.existsSync(filePath)) {
      res.set("Content-Type", "text/plain");
      res.sendFile(filePath);
    } else {
      res.status(404).send("Robots.txt not found");
    }
  });

  app.get("/manifest.json", (_req, res) => {
    const filePath = path.join(publicPath, "manifest.json");
    if (fs.existsSync(filePath)) {
      res.set("Content-Type", "application/json");
      res.sendFile(filePath);
    } else {
      res.status(404).send("Manifest not found");
    }
  });

  return httpServer;
}
