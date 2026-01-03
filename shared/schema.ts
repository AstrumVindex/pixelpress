import { z } from "zod";

// We don't need a database table for a client-side only app, 
// but we'll use Zod schemas to define our application state and configuration types.

export const compressionFormatSchema = z.enum(["image/jpeg", "image/png", "image/webp"]);

export const compressionSettingsSchema = z.object({
  quality: z.number().min(0).max(100).default(80),
  format: compressionFormatSchema.default("image/jpeg"),
  width: z.number().optional(),
  height: z.number().optional(),
  maintainAspectRatio: z.boolean().default(true),
  stripMetadata: z.boolean().default(true),
});

export const imageFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  originalSize: z.number(),
  compressedSize: z.number().optional(),
  originalUrl: z.string(),
  compressedUrl: z.string().optional(),
  status: z.enum(["pending", "processing", "completed", "error"]).default("pending"),
  error: z.string().optional(),
});

export type CompressionFormat = z.infer<typeof compressionFormatSchema>;
export type CompressionSettings = z.infer<typeof compressionSettingsSchema>;
export type ImageFile = z.infer<typeof imageFileSchema>;

export const PRESETS = [
  { 
    id: "safe", 
    name: "Safe (Recommended)", 
    settings: { quality: 70, format: "image/jpeg", maintainAspectRatio: true, stripMetadata: true } 
  },
  { 
    id: "balanced", 
    name: "Balanced", 
    settings: { quality: 55, format: "image/webp", maintainAspectRatio: true, stripMetadata: true } 
  },
  { 
    id: "aggressive", 
    name: "Aggressive", 
    settings: { quality: 40, format: "image/webp", width: 1600, maintainAspectRatio: true, stripMetadata: true } 
  },
  { 
    id: "maximum", 
    name: "Maximum", 
    settings: { quality: 30, format: "image/webp", width: 1200, maintainAspectRatio: true, stripMetadata: true } 
  }
] as const;
