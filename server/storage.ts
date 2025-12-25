// This storage interface is kept minimal as the application is client-side focused.
// We use MemStorage to satisfy the architecture without needing a persistent DB.

export interface IStorage {
  // Add methods here if needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage
  }
}

export const storage = new MemStorage();
