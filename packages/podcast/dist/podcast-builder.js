import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';
import { getWeekNumber } from '@trends/shared';
export class PodcastBuilder {
    elevenLabsKey;
    outputDir;
    constructor(outputDir = 'public/audio/weekly') {
        this.elevenLabsKey = process.env.ELEVENLABS_API_KEY || null;
        this.outputDir = outputDir;
    }
    async generateWeeklyPodcast(trends, maxTrends = 6) {
        console.log(`Generating weekly podcast from ${trends.length} trends...`);
        // Select diverse trends for podcast
        const selectedTrends = this.selectDiverseTrends(trends, maxTrends);
        console.log(`Selected ${selectedTrends.length} trends for podcast`);
        await mkdir(this.outputDir, { recursive: true });
        // Generate audio segments
        const audioSegments = [];
        // Intro
        const introText = this.generateIntroScript(selectedTrends.length);
        const introFile = await this.generateAudio(introText, 'intro');
        if (introFile)
            audioSegments.push(introFile);
        // Trend segments
        for (let i = 0; i < selectedTrends.length; i++) {
            const trend = selectedTrends[i];
            const segmentFile = await this.generateAudio(trend.creative.podcastSnippet, `trend_${i + 1}`);
            if (segmentFile)
                audioSegments.push(segmentFile);
        }
        // Outro
        const outroText = this.generateOutroScript();
        const outroFile = await this.generateAudio(outroText, 'outro');
        if (outroFile)
            audioSegments.push(outroFile);
        // Combine audio segments
        const weekNumber = getWeekNumber(new Date());
        const finalAudioPath = join(this.outputDir, `${weekNumber}.mp3`);
        await this.combineAudioSegments(audioSegments, finalAudioPath);
        // Create episode metadata
        const episode = {
            title: `Trend Intelligence Weekly - Week ${weekNumber}`,
            description: this.generateEpisodeDescription(selectedTrends),
            url: `/audio/weekly/${weekNumber}.mp3`,
            duration: await this.getAudioDuration(finalAudioPath),
            generatedAt: new Date().toISOString(),
            trends: selectedTrends.map(t => t.id),
        };
        // Update podcast feed
        await this.updatePodcastFeed(episode);
        // Cleanup temp files
        await this.cleanupTempFiles(audioSegments.filter(f => f !== finalAudioPath));
        console.log(`✅ Generated podcast: ${finalAudioPath}`);
        return episode;
    }
    selectDiverseTrends(trends, maxTrends) {
        // Sort by score and select diverse categories
        const sorted = [...trends].sort((a, b) => b.scores.total - a.scores.total);
        const categories = new Set();
        const selected = [];
        for (const trend of sorted) {
            if (selected.length >= maxTrends)
                break;
            // Prefer diverse categories
            if (categories.size < maxTrends && categories.has(trend.category)) {
                continue;
            }
            selected.push(trend);
            categories.add(trend.category);
        }
        // Fill remaining slots with highest scoring trends
        if (selected.length < maxTrends) {
            for (const trend of sorted) {
                if (selected.length >= maxTrends)
                    break;
                if (!selected.find(t => t.id === trend.id)) {
                    selected.push(trend);
                }
            }
        }
        return selected;
    }
    async generateAudio(text, filename) {
        const outputPath = join(this.outputDir, `temp_${filename}.mp3`);
        if (this.elevenLabsKey) {
            try {
                return await this.generateWithElevenLabs(text, outputPath);
            }
            catch (error) {
                console.warn('ElevenLabs failed, using fallback:', error);
            }
        }
        // Fallback: create silent audio file with text metadata
        return await this.generateSilentAudio(text, outputPath);
    }
    async generateWithElevenLabs(text, outputPath) {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': this.elevenLabsKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        await writeFile(outputPath, audioBuffer);
        return outputPath;
    }
    async generateSilentAudio(text, outputPath) {
        // Create 3 seconds of silence per 100 characters (rough estimate)
        const duration = Math.max(2, Math.ceil(text.length / 100) * 3);
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input('anullsrc')
                .inputOptions(['-f', 'lavfi', `-t`, duration.toString()])
                .audioCodec('mp3')
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .save(outputPath);
        });
    }
    async combineAudioSegments(segments, outputPath) {
        if (segments.length === 0) {
            throw new Error('No audio segments to combine');
        }
        if (segments.length === 1) {
            // Just copy the single file
            const buffer = await readFile(segments[0]);
            await writeFile(outputPath, buffer);
            return;
        }
        return new Promise((resolve, reject) => {
            let command = ffmpeg();
            segments.forEach(segment => {
                command = command.input(segment);
            });
            command
                .complexFilter(segments.map((_, i) => `[${i}:0]`).join('') + `concat=n=${segments.length}:v=0:a=1[out]`)
                .outputOptions(['-map', '[out]'])
                .audioCodec('mp3')
                .on('end', () => resolve())
                .on('error', reject)
                .save(outputPath);
        });
    }
    async getAudioDuration(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err)
                    reject(err);
                else
                    resolve(Math.round(metadata.format.duration || 0));
            });
        });
    }
    generateIntroScript(trendCount) {
        return `Welcome to Trend Intelligence Weekly, your source for the latest marketing and innovation insights. This week, we're covering ${trendCount} key trends that are shaping the industry. Let's dive in.`;
    }
    generateOutroScript() {
        return `That's all for this week's Trend Intelligence update. Stay ahead of the curve, and we'll see you next week with more insights that matter.`;
    }
    generateEpisodeDescription(trends) {
        const categories = [...new Set(trends.map(t => t.category))];
        return `This week's trends cover ${categories.join(', ')}, featuring insights on ${trends.map(t => t.title).join(', ').substring(0, 200)}...`;
    }
    async updatePodcastFeed(newEpisode) {
        const feedPath = join(this.outputDir, 'feed.json');
        let feed;
        try {
            const existing = await readFile(feedPath, 'utf-8');
            feed = JSON.parse(existing);
        }
        catch {
            feed = {
                title: 'Trend Intelligence Weekly',
                description: 'Weekly podcast covering the latest marketing and innovation trends',
                episodes: [],
                lastUpdated: new Date().toISOString(),
            };
        }
        // Add new episode at the beginning
        feed.episodes.unshift(newEpisode);
        // Keep only last 52 episodes (1 year)
        feed.episodes = feed.episodes.slice(0, 52);
        feed.lastUpdated = new Date().toISOString();
        await writeFile(feedPath, JSON.stringify(feed, null, 2));
    }
    async cleanupTempFiles(files) {
        for (const file of files) {
            try {
                await import('fs').then(fs => fs.promises.unlink(file));
            }
            catch {
                // Ignore errors
            }
        }
    }
}
