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
  whyItMatters?: string; // Optional - some trends may not have this field
  brandAngles: string[];
  exampleUseCases: string[];
  creative: {
    shortCardCopy: string;
    imagePrompt: string;
    altText: string;
    podcastSnippet: string;
    imageUrl?: string; // Generated 3D image URL from OpenAI
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

// T&P Group 10-color palette - 6 primary + 4 secondary for maximum distinction
const COLOR_PALETTE = [
  // PRIMARY COLORS (most distinct - assigned first)
  {
    gradient: 'linear-gradient(27deg, #e97e5f, #f2a365 50%, #d49c6a)', // warm coral
    color: '#f2a365',
    name: 'Warm Coral',
    tier: 'primary'
  },
  {
    gradient: 'linear-gradient(27deg, #1e40af, #3b82f6 50%, #2563b8)', // sapphire blue
    color: '#3b82f6',
    name: 'Sapphire Blue',
    tier: 'primary'
  },
  {
    gradient: 'linear-gradient(27deg, #059669, #10b981 50%, #0d7a5f)', // emerald green
    color: '#10b981',
    name: 'Emerald Green',
    tier: 'primary'
  },
  {
    gradient: 'linear-gradient(27deg, #803bff, #ab81fa 50%, #8b5fb8)', // lavender purple
    color: '#ab81fa',
    name: 'Lavender Purple',
    tier: 'primary'
  },
  {
    gradient: 'linear-gradient(27deg, #f59e0b, #fbbf24 50%, #e6930b)', // amber yellow
    color: '#fbbf24',
    name: 'Amber Yellow',
    tier: 'primary'
  },
  {
    gradient: 'linear-gradient(207deg, #d46a97, #c2548c 50%, #b83a6b)', // rose pink
    color: '#d46a97',
    name: 'Rose Pink',
    tier: 'primary'
  },
  // SECONDARY COLORS (backup colors for additional categories)
  {
    gradient: 'linear-gradient(27deg, #7c2d12, #ea580c 50%, #c2410c)', // burnt orange
    color: '#ea580c',
    name: 'Burnt Orange',
    tier: 'secondary'
  },
  {
    gradient: 'linear-gradient(27deg, #164e63, #0891b2 50%, #0e7490)', // cyan blue
    color: '#0891b2',
    name: 'Cyan Blue',
    tier: 'secondary'
  },
  {
    gradient: 'linear-gradient(27deg, #881337, #be185d 50%, #9f1239)', // ruby red
    color: '#be185d',
    name: 'Ruby Red',
    tier: 'secondary'
  },
  {
    gradient: 'linear-gradient(27deg, #78350f, #a16207 50%, #92400e)', // bronze brown
    color: '#a16207',
    name: 'Bronze Brown',
    tier: 'secondary'
  }
];

// Global registry to track category-to-color assignments and prevent collisions
let categoryColorMap: { [category: string]: number } = {};
let usedIndices: Set<number> = new Set();

// Priority order for assigning colors (primary colors first, then secondary)
const PRIORITY_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];


// Get unique color index for category, ensuring no collisions and maximum distinction
function getCategoryIndex(category: string): number {
  const normalizedCategory = category.toLowerCase();
  
  // Return existing assignment if we've seen this category before
  if (categoryColorMap[normalizedCategory] !== undefined) {
    return categoryColorMap[normalizedCategory];
  }
  
  // Find the next available color from priority order (most distinct first)
  let assignedIndex = -1;
  for (let i = 0; i < PRIORITY_ORDER.length; i++) {
    const index = PRIORITY_ORDER[i];
    if (!usedIndices.has(index)) {
      assignedIndex = index;
      break;
    }
  }
  
  // Fallback if all colors are used (shouldn't happen with 6 colors)
  if (assignedIndex === -1) {
    assignedIndex = 0; // Default to first color
  }
  
  // Assign and track this color
  categoryColorMap[normalizedCategory] = assignedIndex;
  usedIndices.add(assignedIndex);
  
  console.log(`🎨 Category: "${category}" -> Priority Index: ${assignedIndex} -> ${COLOR_PALETTE[assignedIndex].name} -> Color: ${COLOR_PALETTE[assignedIndex].color}`);
  
  return assignedIndex;
}

export function getCategoryGradient(category: string): string {
  const index = getCategoryIndex(category);
  return COLOR_PALETTE[index].gradient;
}

export function getCategoryColor(category: string): string {
  const index = getCategoryIndex(category);
  return COLOR_PALETTE[index].color;
}