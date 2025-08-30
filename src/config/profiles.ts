import { loadProfiles, ProfilesConfig } from '../services/loadProfiles';

let cached: ProfilesConfig | null = null;

export function getProfiles(): ProfilesConfig {
  if (!cached) {
    cached = loadProfiles();
    const count = Object.keys(cached.profiles || {}).length;
    console.log(`[profiles] Loaded ${count} investor profile(s)`);
  }
  return cached;
}
