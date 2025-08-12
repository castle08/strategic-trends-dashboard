import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { TrendItem, RawTrendItem, WeightsConfig } from './types';
import { 
  generateId,
  generateColorFromCategory,
  calculateVizProperties
} from '@trends/shared';

export class TrendMaker {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private weights: WeightsConfig;

  constructor(weights: WeightsConfig) {
    this.weights = weights;
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (!this.anthropic && !this.openai) {
      console.warn('No AI provider configured. Items will be processed with fallback logic.');
    }
  }

  async processItems(rawItems: RawTrendItem[]): Promise<TrendItem[]> {
    const processedItems: TrendItem[] = [];
    
    for (const rawItem of rawItems) {
      try {
        const processedItem = await this.processItem(rawItem);
        if (processedItem && this.validateItem(processedItem)) {
          processedItems.push(processedItem);
        }
      } catch (error) {
        console.warn(`Failed to process item: ${rawItem.title}`, error);
      }
    }

    return this.rankAndFilter(processedItems);
  }

  private async processItem(rawItem: RawTrendItem): Promise<TrendItem | null> {
    if (this.anthropic || this.openai) {
      return await this.processWithAI(rawItem);
    } else {
      return this.processWithFallback(rawItem);
    }
  }

  private async processWithAI(rawItem: RawTrendItem): Promise<TrendItem | null> {
    const prompt = this.buildPrompt(rawItem);
    
    try {
      let response: string;
      
      if (this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        });
        response = message.content[0].type === 'text' ? message.content[0].text : '';
      } else if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        });
        response = completion.choices[0]?.message?.content || '';
      } else {
        throw new Error('No AI provider available');
      }

      return this.parseAIResponse(response, rawItem);
    } catch (error) {
      console.error('AI processing failed, falling back:', error);
      return this.processWithFallback(rawItem);
    }
  }

  private buildPrompt(rawItem: RawTrendItem): string {
    return `Analyze this trend item and return a JSON object with the following structure:

{
  "category": "string (AI/ML, Marketing, Design, Technology, Social Media, Advertising, Branding, Consumer Behavior, Innovation, Data/Analytics, Sustainability, E-commerce)",
  "tags": ["array", "of", "strings", "max", "5"],
  "scores": {
    "novelty": number_0_to_100,
    "velocity": number_0_to_100, 
    "relevance": number_0_to_100,
    "confidence": number_0_to_100,
    "total": number_0_to_100
  },
  "whyItMatters": "Brief explanation (max 300 chars) of significance for brands/marketers",
  "brandAngles": ["array", "of", "brand", "opportunity", "strings"],
  "exampleUseCases": ["practical", "applications", "for", "businesses"],
  "creative": {
    "shortCardCopy": "Punchy headline for display (max 100 chars)",
    "imagePrompt": "Detailed prompt for image generation",
    "altText": "Accessible description of the concept",
    "podcastSnippet": "Conversational explanation for audio (max 500 chars)"
  }
}

Input:
Title: ${rawItem.title}
URL: ${rawItem.url}
Source: ${rawItem.source}
Published: ${rawItem.publishedAt}
Summary: ${rawItem.summary}

Guidelines:
- Scores should reflect real impact potential
- Confidence < 60 means low-quality content
- Keep creative copy engaging but professional
- Focus on business/brand implications
- Ensure all fields are complete and within limits

Return only the JSON object, no additional text.`;
  }

  private parseAIResponse(response: string, rawItem: RawTrendItem): TrendItem | null {
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      const scores = parsed.scores;
      scores.total = (scores.novelty + scores.velocity + scores.relevance + scores.confidence) / 4;
      
      const vizProps = calculateVizProperties(scores);
      
      const trendItem: TrendItem = {
        id: generateId(),
        title: rawItem.title,
        url: rawItem.url,
        source: rawItem.source,
        publishedAt: rawItem.publishedAt,
        summary: rawItem.summary,
        category: parsed.category,
        tags: parsed.tags || [],
        scores: scores,
        whyItMatters: parsed.whyItMatters,
        brandAngles: parsed.brandAngles || [],
        exampleUseCases: parsed.exampleUseCases || [],
        creative: parsed.creative,
        viz: {
          size: vizProps.size,
          intensity: vizProps.intensity,
          colorHint: generateColorFromCategory(parsed.category),
        },
      };

      return trendItem;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return null;
    }
  }

  private processWithFallback(rawItem: RawTrendItem): TrendItem {
    const category = this.categorizeFromTitle(rawItem.title);
    const novelty = 50 + Math.random() * 30;
    const velocity = 40 + Math.random() * 40;
    const relevance = 60 + Math.random() * 25;
    const confidence = 70;
    const scores = {
      novelty,
      velocity,
      relevance,
      confidence,
      total: (novelty + velocity + relevance + confidence) / 4,
    };
    
    const vizProps = calculateVizProperties(scores);
    
    return {
      id: generateId(),
      title: rawItem.title,
      url: rawItem.url,
      source: rawItem.source,
      publishedAt: rawItem.publishedAt,
      summary: rawItem.summary,
      category,
      tags: this.extractTags(rawItem.title),
      scores,
      whyItMatters: `${rawItem.title} represents a significant development in ${category.toLowerCase()}.`,
      brandAngles: ['Brand awareness', 'Innovation positioning'],
      exampleUseCases: ['Marketing campaigns', 'Product development'],
      creative: {
        shortCardCopy: rawItem.title.substring(0, 80) + '...',
        imagePrompt: `Professional illustration of ${rawItem.title.toLowerCase()}`,
        altText: `Visual representation of ${rawItem.title}`,
        podcastSnippet: `Here's what you need to know about ${rawItem.title}: ${rawItem.summary.substring(0, 400)}`,
      },
      viz: {
        size: vizProps.size,
        intensity: vizProps.intensity,
        colorHint: generateColorFromCategory(category),
      },
    };
  }

  private categorizeFromTitle(title: string): string {
    const keywords: Record<string, string> = {
      'AI': 'AI/ML',
      'artificial intelligence': 'AI/ML',
      'machine learning': 'AI/ML',
      'marketing': 'Marketing',
      'advertising': 'Advertising',
      'brand': 'Branding',
      'design': 'Design',
      'tech': 'Technology',
      'social': 'Social Media',
      'data': 'Data/Analytics',
      'consumer': 'Consumer Behavior',
      'innovation': 'Innovation',
      'sustainable': 'Sustainability',
      'ecommerce': 'E-commerce',
    };

    const lowerTitle = title.toLowerCase();
    for (const [keyword, category] of Object.entries(keywords)) {
      if (lowerTitle.includes(keyword)) {
        return category;
      }
    }
    
    return 'Technology';
  }

  private extractTags(title: string): string[] {
    const words = title.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const tags = words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
    return tags;
  }

  private validateItem(item: TrendItem): boolean {
    try {
      // Assuming TrendItemSchema is defined elsewhere or removed if not needed
      // For now, we'll just check if scores and confidence are present
      if (!item.scores || !item.scores.confidence) {
        return false;
      }
      return item.scores.confidence >= this.weights.confidenceThreshold;
    } catch {
      return false;
    }
  }

  private rankAndFilter(items: TrendItem[]): TrendItem[] {
    return items
      .map(item => ({
        ...item,
        scores: {
          ...item.scores,
          total: this.calculateWeightedScore(item),
        },
      }))
      .sort((a, b) => b.scores.total - a.scores.total);
  }

  private calculateWeightedScore(item: TrendItem): number {
    const categoryWeight = this.weights.categories[item.category || 'default'] || 1.0;
    const sourceWeight = this.weights.sources[item.source || 'default'] || 1.0;
    
    const hoursOld = item.publishedAt 
      ? (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60)
      : 0;
    const recencyMultiplier = hoursOld < 24 ? this.weights.recencyBoost : 1.0;
    
    return item.scores.total * categoryWeight * sourceWeight * recencyMultiplier;
  }
}