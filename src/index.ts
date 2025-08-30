import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getProfiles } from './config/profiles';


// 1) Bootstrap
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 2) Charger les profils (loggé une seule fois)
const profilesConfig = getProfiles();
// app.locals.profiles = profilesConfig;
// if (!profilesConfig || !profilesConfig.profiles) {
//  console.error('[profiles] FAILED to load profiles');
// } else {
//  console.log(`[profiles] Loaded ${Object.keys(profilesConfig.profiles).length} investor profile(s)`);
// }

// 3) Routes de santé (pour tester)
app.get('/ping', (_req, res) => res.send('pong'));
app.get('/', (_req, res) => res.json({ ok: true }));

// 4) Monte la route analyses (si elle existe)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const analysesRouter = require('./routes/analyses').default || require('./routes/analyses');
  app.use('/v1/analyses', analysesRouter);
} catch (e) {
  console.warn('[warn] routes/analyses non monté (fichier introuvable ou erreur). Le /ping reste disponible.');
}

// 5) Listen
//const port = Number(process.env.PORT) || 8080;
//app.listen(port, () => {
//  console.log(`Server running on port ${port}`);
//});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
app.get("/ping", (_req, res) => res.send("pong"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));