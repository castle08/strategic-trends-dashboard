import { RawTrendItem, TrendItem, WeightsConfig } from '@trends/shared';
export declare class TrendMaker {
    private anthropic?;
    private openai?;
    private weights;
    constructor(weights: WeightsConfig);
    processItems(rawItems: RawTrendItem[]): Promise<TrendItem[]>;
    private processItem;
    private processWithAI;
    private buildPrompt;
    private parseAIResponse;
    private processWithFallback;
    private categorizeFromTitle;
    private extractTags;
    private validateItem;
    private rankAndFilter;
    private calculateWeightedScore;
}
