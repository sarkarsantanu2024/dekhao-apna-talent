/**
 * Server-only cache for Sarvam TTS audio.
 *
 * TTS is deterministic: the SAME (text, language, speaker, model, sample-rate)
 * always yields the SAME audio, and Sarvam bills per character. So we synthesize
 * once and reuse the result — repeated questions (and repeated test runs) cost
 * nothing extra. This changes ONLY billing, never the audio: cached bytes are
 * identical to what the API returned, so voice quality is unaffected.
 *
 * Two tiers:
 *  - L1 in-memory Map (fast, cleared on restart)
 *  - L2 on disk in the OS temp dir (survives dev-server restarts; kept OUT of
 *    the project tree so Next.js's file watcher doesn't recompile on every write)
 */

import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const CACHE_DIR = join(tmpdir(), "dat-tts-cache");
const MEM_MAX = 200; // cap L1 so long sessions don't grow memory unbounded
const mem = new Map<string, string>();

let dirReady: Promise<void> | null = null;
function ensureDir(): Promise<void> {
  if (!dirReady) dirReady = mkdir(CACHE_DIR, { recursive: true }).then(() => undefined);
  return dirReady;
}

/** Stable key for a synthesis request — any field change misses the cache. */
export function ttsCacheKey(parts: {
  text: string;
  languageCode: string;
  speaker: string;
  model: string;
  sampleRate: number;
}): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

/** Return cached base64 audio for a key, or null on a miss. */
export async function getCachedAudio(key: string): Promise<string | null> {
  const hit = mem.get(key);
  if (hit) return hit;
  try {
    const audio = await readFile(join(CACHE_DIR, `${key}.b64`), "utf8");
    if (audio) {
      mem.set(key, audio); // promote disk hit into L1
      return audio;
    }
  } catch {
    /* miss */
  }
  return null;
}

/** Store base64 audio for a key. Best-effort: cache failures never break TTS. */
export async function putCachedAudio(key: string, audio: string): Promise<void> {
  if (mem.size >= MEM_MAX) mem.clear();
  mem.set(key, audio);
  try {
    await ensureDir();
    await writeFile(join(CACHE_DIR, `${key}.b64`), audio, "utf8");
  } catch {
    /* disk cache is optional */
  }
}
