import { AnalysisResult } from '../types';

// In-memory store for analysis results
const analysisStore = new Map<string, AnalysisResult>();

/**
 * Saves an analysis result to the in-memory store
 * @param id The analysis ID
 * @param data The analysis data to store
 */
export function saveAnalysis(id: string, data: AnalysisResult): void {
  analysisStore.set(id, data);
  console.log(`Analysis ${id} saved to memory store`);
}

/**
 * Retrieves an analysis result from the in-memory store
 * @param id The analysis ID to retrieve
 * @returns The analysis data or undefined if not found
 */
export function getAnalysis(id: string): AnalysisResult | undefined {
  return analysisStore.get(id);
}

/**
 * Lists all analysis IDs in the store
 * @returns Array of analysis IDs
 */
export function listAnalyses(): string[] {
  return Array.from(analysisStore.keys());
}

/**
 * Deletes an analysis from the store
 * @param id The analysis ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteAnalysis(id: string): boolean {
  return analysisStore.delete(id);
}

/**
 * Clears all analyses from the store
 */
export function clearAllAnalyses(): void {
  analysisStore.clear();
  console.log('All analyses cleared from memory store');
}

type JobStatus = 'queued' | 'processing' | 'complete' | 'error';

export type Job = {
  status: JobStatus;
  input?: any;
  result?: any;
  error?: string;
};

const jobs = new Map<string, Job>();

export function upsertJob(id: string, data: Partial<Job>) {
  const existing = jobs.get(id) || { status: 'queued' } as Job;
  const merged = { ...existing, ...data } as Job;
  jobs.set(id, merged);
  return merged;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}