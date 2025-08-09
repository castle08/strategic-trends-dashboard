import { z } from 'zod';

export const TrendItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  url: z.string().url().optional(),
  source: z.string().min(1).optional(),
  publishedAt: z.string().datetime().optional(),
  summary: z.string().min(1).max(500),
  category: z.string().min(1).max(50),
  tags: z.array(z.string()).max(10),
  scores: z.object({
    novelty: z.number().min(0).max(100),
    velocity: z.number().min(0).max(100),
    relevance: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    total: z.number().min(0).max(100),
  }),
  whyItMatters: z.string().min(1).max(300),
  brandAngles: z.array(z.string()).max(5),
  exampleUseCases: z.array(z.string()).max(5),
  creative: z.object({
    shortCardCopy: z.string().min(1).max(140),
    imagePrompt: z.string().min(1).max(200),
    altText: z.string().min(1).max(100),
    podcastSnippet: z.string().min(1).max(500),
  }),
  viz: z.object({
    size: z.number().min(1).max(20),
    intensity: z.number().min(0.1).max(3),
    colorHint: z.string().regex(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/),
  }),
});

export const TrendsDataSchema = z.object({
  generatedAt: z.string().datetime(),
  sourceSummary: z.object({
    totalFetched: z.number().int().min(0),
    afterDedupe: z.number().int().min(0),
    sources: z.array(z.string()),
  }),
  trends: z.array(TrendItemSchema),
});

export const RawTrendItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  source: z.string().min(1),
  publishedAt: z.string().datetime(),
  summary: z.string().min(1),
});

export const SourceConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['rss', 'api']),
  url: z.string().url(),
  enabled: z.boolean(),
  requiresAuth: z.boolean(),
  authKey: z.string().optional(),
});

export const WeightsConfigSchema = z.object({
  categories: z.record(z.string(), z.number()),
  sources: z.record(z.string(), z.number()),
  recencyBoost: z.number().min(0).max(2),
  confidenceThreshold: z.number().min(0).max(100),
});

// Note: Types are defined in types.ts to avoid circular imports