import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getJob, upsertJob } from '../store/memory';

// const profiles = (req.app.locals as any).profiles

// --- Sécurité API key (header obligatoire) ---
function ensureApiKey(req: Request, res: Response, next: () => void) {
  const apiKey = req.header('X-Api-Key');
  if (!apiKey || apiKey !== process.env.API_KEY_BUBBLE) {
    return res.status(401).json({ error: 'Unauthorized: invalid X-Api-Key' });
  }
  next();
}

// --- Validation d’entrée ---
const postSchema = z.object({
  analysis_id: z.string().min(1),
  file_url: z.string().url(),
  audience_profile: z.string().min(1),
  sector: z.string().min(1),
  region: z.union([
    z.object({
      macro: z.string().min(1),
      country_code: z.string().optional(),
      country_name: z.string().optional()
    }),
    // tolérance MVP si tu préfères des strings "plates"
    z.any()
  ]),
  model_version: z.string().min(1),
  callback_url: z.string().url().optional(),
  callback_secret: z.string().optional()
});

const router = Router();

// --- POST /v1/analyses ---
router.post('/', ensureApiKey, async (req: Request, res: Response) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Bad Request', details: parsed.error.flatten() });
  }
  const payload = parsed.data;

  // 1) on crée/enregistre le job en "queued"
  upsertJob(payload.analysis_id, { status: 'queued', input: payload });

  // 2) on simule un pipeline async (MVP)
  setTimeout(async () => {
    try {
      upsertJob(payload.analysis_id, { status: 'processing' });

      // TODO: ici tu brancheras extraction PDF + appel OpenAI + application des profils
      // Pour le MVP, on renvoie un résultat "fake" mais conforme au schema.
      const fakeResult = {
        overall: 62,
        pillars: {
          ProblemMarket: { score: 12, items: [{ name: 'Pain clarity', score: 3, why: 'slide 2' }] },
          ProductSolution: { score: 15, items: [] },
          People: { score: 17, items: [] },
          Performance: { score: 18, items: [] }
        },
        top_actions: [
          { rank: 1, text: 'Ajouter slide concurrence' },
          { rank: 2, text: 'Clarifier SAM/SOM avec sources' },
          { rank: 3, text: 'Définir milestones 90j' }
        ],
        plan_30_60_90: { d30: 'xxx', d60: 'yyy', d90: 'zzz' },
        red_flags: ['Finance slide absente'],
        deck_check: { required_missing: ['Competition'], form_score: 6 },
        audience_profile: payload.audience_profile,
        sector: payload.sector,
        region: payload.region
      };

      upsertJob(payload.analysis_id, { status: 'complete', result: fakeResult });

      // callback (optionnel)
      if (payload.callback_url && payload.callback_secret) {
        try {
          await fetch(payload.callback_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ analysis_id: payload.analysis_id, ...fakeResult, secret: payload.callback_secret })
          });
        } catch (e) {
          // On log juste, le job est quand même "complete"
          console.warn('[callback] failed:', (e as Error).message);
        }
      }
    } catch (e) {
      upsertJob(payload.analysis_id, { status: 'error', error: (e as Error).message });
    }
  }, 500); // 0,5s

  return res.json({ job_id: payload.analysis_id, status: 'queued' });
});

// --- GET /v1/analyses/:id ---
router.get('/:id', ensureApiKey, (req: Request, res: Response) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  return res.json(job);
});

export default router;