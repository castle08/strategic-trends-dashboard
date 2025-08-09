import { v4 as uuidv4 } from 'uuid';
import { RawTrendItem } from './types.js';

export function generateContentHash(title: string, url: string): string {
  // Simple hash function that works in browser and Node.js
  const str = `${title}|${url}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export function deduplicateItems(items: RawTrendItem[]): RawTrendItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const hash = generateContentHash(item.title, item.url);
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}

export function generateColorFromCategory(category: string): string {
  // Simple hash for consistent colors
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash = hash & hash;
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash >> 8) % 30);
  const lightness = 45 + (Math.abs(hash >> 16) % 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function calculateVizProperties(scores: { total: number; velocity: number }) {
  // Create more dramatic size variation: map 0-100 scores to 2-12 size range
  // Use exponential scaling to emphasize higher scores
  const normalizedScore = Math.max(0, Math.min(100, scores.total)) / 100;
  const size = Math.round(2 + Math.pow(normalizedScore, 1.5) * 10);
  
  const intensity = 0.3 + (scores.velocity / 100) * 1.7;
  return { size: Math.max(2, size), intensity: Math.max(0.1, intensity) };
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

export function generateId(): string {
  return uuidv4();
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getWeekNumber(date: Date): string {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${year}-${week.toString().padStart(2, '0')}`;
}