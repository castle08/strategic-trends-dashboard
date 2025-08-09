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

export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}