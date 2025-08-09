import { TrendItem, PodcastEpisode } from '@trends/shared';
export declare class PodcastBuilder {
    private elevenLabsKey;
    private outputDir;
    constructor(outputDir?: string);
    generateWeeklyPodcast(trends: TrendItem[], maxTrends?: number): Promise<PodcastEpisode>;
    private selectDiverseTrends;
    private generateAudio;
    private generateWithElevenLabs;
    private generateSilentAudio;
    private combineAudioSegments;
    private getAudioDuration;
    private generateIntroScript;
    private generateOutroScript;
    private generateEpisodeDescription;
    private updatePodcastFeed;
    private cleanupTempFiles;
}
