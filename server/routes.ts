import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // No server-side routes needed for this client-side application.
  // The frontend handles all image processing logic.

  return httpServer;
}
