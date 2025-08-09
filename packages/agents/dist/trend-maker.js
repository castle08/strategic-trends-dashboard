import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { TrendItemSchema, generateId, generateColorFromCategory, calculateVizProperties } from '@trends/shared';
export class TrendMaker {
    anthropic;
    openai;
    weights;
    constructor(weights) {
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
    async processItems(rawItems) {
        const processedItems = [];
        for (const rawItem of rawItems) {
            try {
                const processedItem = await this.processItem(rawItem);
                if (processedItem && this.validateItem(processedItem)) {
                    processedItems.push(processedItem);
                }
            }
            catch (error) {
                console.warn(`Failed to process item: ${rawItem.title}`, error);
            }
        }
        return this.rankAndFilter(processedItems);
    }
    async processItem(rawItem) {
        if (this.anthropic || this.openai) {
            return await this.processWithAI(rawItem);
        }
        else {
            return this.processWithFallback(rawItem);
        }
    }
    async processWithAI(rawItem) {
        const prompt = this.buildPrompt(rawItem);
        try {
            let response;
            if (this.anthropic) {
                const message = await this.anthropic.messages.create({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: prompt }],
                });
                response = message.content[0].type === 'text' ? message.content[0].text : '';
            }
            else if (this.openai) {
                const completion = await this.openai.chat.completions.create({
                    model: 'gpt-4',
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: prompt }],
                });
                response = completion.choices[0]?.message?.content || '';
            }
            else {
                throw new Error('No AI provider available');
            }
            return this.parseAIResponse(response, rawItem);
        }
        catch (error) {
            console.error('AI processing failed, falling back:', error);
            return this.processWithFallback(rawItem);
        }
    }
    buildPrompt(rawItem) {
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
    parseAIResponse(response, rawItem) {
        try {
            const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanResponse);
            const scores = parsed.scores;
            scores.total = (scores.novelty + scores.velocity + scores.relevance + scores.confidence) / 4;
            const vizProps = calculateVizProperties(scores);
            const trendItem = {
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
        }
        catch (error) {
            console.error('Failed to parse AI response:', error);
            return null;
        }
    }
    processWithFallback(rawItem) {
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
    categorizeFromTitle(title) {
        const keywords = {
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
    extractTags(title) {
        const words = title.toLowerCase().split(/\s+/);
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        const tags = words
            .filter(word => word.length > 3 && !stopWords.has(word))
            .slice(0, 5);
        return tags;
    }
    validateItem(item) {
        try {
            TrendItemSchema.parse(item);
            return item.scores.confidence >= this.weights.confidenceThreshold;
        }
        catch {
            return false;
        }
    }
    rankAndFilter(items) {
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
    calculateWeightedScore(item) {
        const categoryWeight = this.weights.categories[item.category] || 1.0;
        const sourceWeight = this.weights.sources[item.source] || 1.0;
        const hoursOld = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
        const recencyMultiplier = hoursOld < 24 ? this.weights.recencyBoost : 1.0;
        return item.scores.total * categoryWeight * sourceWeight * recencyMultiplier;
    }
}
