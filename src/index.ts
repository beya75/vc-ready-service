// src/index.ts
import path from "path";
import dotenv from "dotenv";

// Charge .env en local (Render injecte déjà les vars d'env)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import { getProfiles } from "./config/profiles";

// 1) Bootstrap
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 2) Charger les profils (log une fois pour contrôle)
const profilesConfig = getProfiles();
console.log(
  profilesConfig?.profiles
    ? `[profiles] Loaded ${Object.keys(profilesConfig.profiles).length} investor profile(s)`
    : "[profiles] FAILED to load profiles"
);

// 3) Routes de santé
app.get("/ping", (_req, res) => res.send("pong"));
app.get("/", (_req, res) => res.json({ ok: true }));

// 4) Middleware d’auth pour toutes les routes /v1/*
app.use("/v1", (req, res, next) => {
  const bearer = (req.headers["authorization"] || "")
    .toString()
    .replace(/^Bearer\s+/i, "")
    .trim();
  const xkey = (req.headers["x-api-key"] || "").toString().trim();
  const key = xkey || bearer;

  const expected = (process.env.SERVICE_API_KEY || "").trim();

  // Log non sensible (longueurs uniquement)
  console.log(
    "[auth] xkey len:", xkey.length,
    "bearer len:", bearer.length,
    "expected len:", expected.length
  );

  if (!expected) return res.status(500).send("Server misconfigured");
  if (key !== expected) return res.status(401).json({ error: "Unauthorized: invalid API key" });
  next();
});

// 5) Monte la route analyses
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const analysesRouter =
    require("./routes/analyses").default || require("./routes/analyses");
  app.use("/v1/analyses", analysesRouter);
} catch (e) {
  console.warn(
    "[warn] routes/analyses non monté (fichier introuvable ou erreur). Le /ping reste disponible."
  );
}

// 6) Listen
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
