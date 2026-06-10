import { SARVAM, isSarvamConfigured, notConfigured } from "@/lib/sarvam";
import { VOICE_LANGUAGES, type VoiceLang } from "@/constants/voice-assistant";

// Text-to-Speech proxy. Converts the assistant's reply into natural speech and
// returns base64 WAV audio for the browser to play.
export async function POST(req: Request) {
  if (!isSarvamConfigured()) return notConfigured();

  const body = (await req.json().catch(() => null)) as {
    text?: string;
    language?: VoiceLang;
  } | null;

  const text = body?.text?.trim();
  if (!text) return Response.json({ error: "No text provided" }, { status: 400 });

  const language: VoiceLang =
    body?.language && body.language in VOICE_LANGUAGES ? body.language : "en";
  const targetLanguageCode = VOICE_LANGUAGES[language].sarvamCode;

  // Voice per language. A single speaker can sound off-accent in another
  // language (e.g. a Hindi-leaning voice reading Bengali), so each language
  // gets its own speaker, overridable via SARVAM_TTS_SPEAKER_{BN,HI,EN}.
  const speaker =
    process.env[`SARVAM_TTS_SPEAKER_${language.toUpperCase()}`] || SARVAM.ttsSpeaker;

  const res = await fetch(SARVAM.ttsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": SARVAM.key,
    },
    body: JSON.stringify({
      // bulbul:v2 caps at 1500 chars; trim defensively so long answers still speak.
      text: text.slice(0, 1500),
      target_language_code: targetLanguageCode,
      speaker,
      model: SARVAM.ttsModel,
      output_audio_codec: "wav",
      speech_sample_rate: 22050,
      // Normalizes numbers, currency, and English words mixed into Indic text
      // so they are spoken correctly instead of letter-by-letter / garbled.
      enable_preprocessing: true,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return Response.json({ error: "Speech synthesis failed", detail }, { status: res.status });
  }

  const data = await res.json();
  const audio = Array.isArray(data?.audios) ? data.audios[0] : null;
  return Response.json({ audio }); // base64-encoded WAV (no data: prefix)
}
