import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Profile } from '../types';

// Load profiles at startup
let profiles: Profile[] = [];

try {
  const profilesPath = path.join(process.cwd(), 'config', 'profiles.yaml');
  const profilesContent = fs.readFileSync(profilesPath, 'utf-8');
  profiles = yaml.load(profilesContent) as Profile[];
  console.log(`Loaded ${profiles.length} investor profiles`);
} catch (error) {
  console.error('Failed to load profiles:', error);
  // Continue with empty profiles array
}

/**
 * Applies investor profile adjustments to the raw analysis
 * @param analysis The raw analysis from the LLM
 * @param profileName The name of the profile to apply
 * @returns The adjusted analysis
 */
export async function applyProfiles(analysis: any, profileName: string): Promise<any> {
  // Find the requested profile
  const profile = profiles.find(p => p.name === profileName);
  
  if (!profile) {
    console.warn(`Profile '${profileName}' not found, returning raw analysis`);
    return analysis;
  }

  // Create a deep copy of the analysis to avoid modifying the original
  const result = JSON.parse(JSON.stringify(analysis));

  // Apply boosts to scores
  if (profile.boosts && result.scores) {
    for (const [category, boost] of Object.entries(profile.boosts)) {
      if (result.scores[category] !== undefined) {
        // Apply boost as a multiplier
        result.scores[category] = Math.min(
          10, // Maximum score
          result.scores[category] * boost
        );
      }
    }
  }

  // Apply caps to scores
  if (profile.caps && result.scores) {
    for (const [category, cap] of Object.entries(profile.caps)) {
      if (result.scores[category] !== undefined) {
        // Apply cap as a maximum value
        result.scores[category] = Math.min(
          result.scores[category],
          cap
        );
      }
    }
  }

  // Apply red flags
  if (profile.red_flags && result.red_flags) {
    // Add profile-specific red flags to the existing ones
    result.red_flags = [
      ...new Set([...result.red_flags, ...profile.red_flags])
    ];
  }

  // Add metadata about the applied profile
  result.profile_applied = profileName;

  return result;
}