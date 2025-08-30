import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export type ProfilesConfig = {
  profiles: Record<string, any>;
};

export function loadProfiles(): ProfilesConfig {
  // on cherche le fichier à plusieurs emplacements possibles
  const candidates = [
    path.join(process.cwd(), 'config', 'profiles.yaml'),          // exécution TS/Dev
    path.join(__dirname, '..', '..', 'config', 'profiles.yaml'),  // build JS/Prod
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      const data = yaml.load(raw) as ProfilesConfig;
      if (!data || !('profiles' in data) || !data.profiles) {
        throw new Error(`profiles.yaml chargé depuis ${p} mais structure invalide (clé "profiles" absente).`);
      }
      return data;
    }
  }
  throw new Error(`profiles.yaml introuvable. Emplacements testés : ${candidates.join(' | ')}`);
}
