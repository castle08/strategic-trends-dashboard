export interface TrendItem {
  id: string;
  title: string;
  url?: string; // Optional - strategic trends may not have source URLs
  source?: string; // Optional - strategic trends focus on insights, not sources
  publishedAt?: string; // Optional ISO8601 - strategic trends are timeless insights
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
  generatedAt: string; // ISO8601
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

export interface SourceConfig {
  name: string;
  type: 'rss' | 'api';
  url: string;
  enabled: boolean;
  requiresAuth: boolean;
  authKey?: string;
}

export interface WeightsConfig {
  categories: Record<string, number>;
  sources: Record<string, number>;
  recencyBoost: number;
  confidenceThreshold: number;
}

export interface PodcastEpisode {
  title: string;
  description: string;
  url: string;
  duration: number;
  generatedAt: string;
  trends: string[]; // trend IDs
}

export interface PodcastFeed {
  title: string;
  description: string;
  episodes: PodcastEpisode[];
  lastUpdated: string;
}