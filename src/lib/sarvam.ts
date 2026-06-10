/**
 * Server-only Sarvam AI configuration + helpers.
 *
 * The subscription key lives in SARVAM_API_KEY and must never reach the client,
 * so all three voice routes (stt / chat / tts) proxy through the server and
 * import from here. Endpoints/contracts per https://docs.sarvam.ai.
 */

export const SARVAM = {
  key: process.env.SARVAM_API_KEY ?? "",
  chatModel: process.env.SARVAM_CHAT_MODEL ?? "sarvam-30b",
  ttsModel: process.env.SARVAM_TTS_MODEL ?? "bulbul:v2",
  ttsSpeaker: process.env.SARVAM_TTS_SPEAKER ?? "anushka",
  chatUrl: "https://api.sarvam.ai/v1/chat/completions",
  ttsUrl: "https://api.sarvam.ai/text-to-speech",
} as const;

export function isSarvamConfigured(): boolean {
  return SARVAM.key.trim().length > 0;
}

/** Standard 503 response when the key is missing, so the UI can show a hint. */
export function notConfigured() {
  return Response.json(
    { error: "not_configured", message: "Voice assistant is not configured yet." },
    { status: 503 }
  );
}
