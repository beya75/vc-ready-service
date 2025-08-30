import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { PageData } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisParams {
  pdfData: PageData[];
  audience_profile: string;
  sector: string;
  region: string;
  model_version: string;
}

/**
 * Generates an analysis of the PDF using OpenAI
 * @param params Analysis parameters including PDF data and context
 * @returns The raw analysis result from the LLM
 */
export async function generateAnalysis(params: AnalysisParams): Promise<any> {
  try {
    const { pdfData, audience_profile, sector, region, model_version } = params;

    // Load system prompt
    const systemPromptPath = path.join(process.cwd(), 'prompts', 'system.txt');
    const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

    // Load user template
    const userTemplatePath = path.join(process.cwd(), 'prompts', 'user_template.json');
    const userTemplate = JSON.parse(fs.readFileSync(userTemplatePath, 'utf-8'));

    // Prepare slide data
    const slides = pdfData.map(page => ({
      index: page.index,
      title: page.title || `Slide ${page.index}`,
      content: page.text,
      numbers: page.numbers
    }));

    // Fill in the user template
    const userPrompt = JSON.stringify({
      ...userTemplate,
      slides,
      audience_profile,
      sector,
      region
    });

    // Select model based on model_version
    const model = selectModel(model_version);

    // Call OpenAI API
    console.log(`Generating analysis using ${model}...`);
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    // Parse and return the response
    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', error.status, error.message);
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Selects the appropriate OpenAI model based on the requested version
 * @param version The model version requested
 * @returns The OpenAI model identifier
 */
function selectModel(version: string): string {
  // Map version strings to actual OpenAI model names
  const modelMap: Record<string, string> = {
    'gpt-4': 'gpt-4-turbo-preview',
    'gpt-4-turbo': 'gpt-4-turbo-preview',
    'gpt-3.5': 'gpt-3.5-turbo',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    // Add more mappings as needed
  };

  // Return the mapped model or default to gpt-4-turbo if not found
  return modelMap[version] || 'gpt-4-turbo-preview';
}

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
  throw new Error('OPENAI_API_KEY manquante. Ajoute-la dans .env ou passe-la à OpenAI({ apiKey }).');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});