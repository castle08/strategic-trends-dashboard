export interface TrendItem {
  id: string;
  title: string;
  url?: string;
  source?: string;
  publishedAt?: string;
  summary: string;
  category: string;
  tags: string[];
  scores: {
    novelty: number;
    velocity: number;
    relevance: number;
    confidence: number;
    total: number;
  };
  whyItMatters: string;
  brandAngles: string[];
  exampleUseCases: string[];
  creative: {
    shortCardCopy: string;
    imagePrompt: string;
    altText: string;
    podcastSnippet: string;
  };
  viz: {
    size: number;
    intensity: number;
    colorHint: string;
  };
}

export interface TrendsData {
  generatedAt: string;
  sourceSummary: {
    totalFetched: number;
    afterDedupe: number;
    sources: string[];
  };
  trends: TrendItem[];
}

export interface RawTrendItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
}

export interface WeightsConfig {
  categories: Record<string, number>;
  sources: Record<string, number>;
  recencyBoost: number;
  confidenceThreshold: number;
}
