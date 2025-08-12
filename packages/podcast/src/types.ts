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

export interface PodcastEpisode {
  title: string;
  description: string;
  url: string;
  duration: number;
  generatedAt: string;
  trends: string[];
}

export interface PodcastFeed {
  title: string;
  description: string;
  episodes: PodcastEpisode[];
  lastUpdated: string;
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
