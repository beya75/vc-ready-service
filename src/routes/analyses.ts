// src/routes/analyses.ts
import { Router } from "express";
const router = Router();

// POST /v1/analyses
router.post("/", async (req, res, next) => {
  try {
    const { analysis_id, file_url } = req.body || {};
    if (!analysis_id || !file_url) {
      return res.status(400).json({ error: "Missing analysis_id or file_url" });
    }
    console.log("[analyses] in:", { id: analysis_id, hasUrl: !!file_url });

    // TODO: ici ta logique (enqueue / LLM / etc.)
    return res.json({ job_id: analysis_id, status: "queued" });
  } catch (err) {
    console.error("[analyses] error:", err);
    return next(err);
  }
});

// GET /v1/analyses/:id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  // Stub de statut pour test
  return res.json({ status: "complete", input: { analysis_id: id } });
});

export default router;
