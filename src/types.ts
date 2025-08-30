/**
 * Represents the extracted data from a single page of a PDF
 */
export interface PageData {
  index: number;
  title: string | null;
  text: string;
  numbers: string[];
}

/**
 * Represents an analysis result stored in memory
 */
export interface AnalysisResult {
  analysis_id: string;
  status: 'pending' | 'completed' | 'error';
  created_at: string;
  [key: string]: any; // Additional fields from the analysis
}

/**
 * Represents a profile configuration for adjusting analysis results
 */
export interface Profile {
  name: string;
  boosts: Record<string, number>;
  caps: Record<string, number>;
  red_flags: string[];
}