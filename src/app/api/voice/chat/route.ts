import { SARVAM, isSarvamConfigured, notConfigured } from "@/lib/sarvam";
import { buildSystemPrompt, VOICE_LANGUAGES, type VoiceLang } from "@/constants/voice-assistant";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Chat proxy. Takes the conversation history + chosen language and asks
// Sarvam-M to answer strictly from the event knowledge base.
export async function POST(req: Request) {
  if (!isSarvamConfigured()) return notConfigured();

  const body = (await req.json().catch(() => null)) as {
    messages?: ChatMessage[];
    language?: VoiceLang;
  } | null;

  const language: VoiceLang =
    body?.language && body.language in VOICE_LANGUAGES ? body.language : "en";

  const history = Array.isArray(body?.messages) ? body.messages : [];
  // Keep only valid turns and cap history to keep the prompt small + cheap.
  const turns = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  // Sarvam requires the first message after the system prompt to be from the
  // user. The widget shows a canned assistant greeting as its first bubble, so
  // drop any leading assistant turn(s) before sending.
  while (turns.length > 0 && turns[0].role === "assistant") turns.shift();

  if (turns.length === 0) {
    return Response.json({ error: "No message provided" }, { status: 400 });
  }

  const res = await fetch(SARVAM.chatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SARVAM.key}`,
    },
    body: JSON.stringify({
      model: SARVAM.chatModel,
      temperature: 0.3,
      reasoning_effort: "low",
      messages: [{ role: "system", content: buildSystemPrompt(language) }, ...turns],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return Response.json({ error: "Chat failed", detail }, { status: res.status });
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "";

  // Clean the raw model output in stages:
  // 1. drop sarvam-m's <think>…</think> chain-of-thought
  // 2. force Western digits (no Bengali/Devanagari numerals)
  // 3. turn rank ordinals (1st / 1ম …) into spoken words (first, second …)
  // 4. drop any email/WhatsApp/contact line (the page already has help buttons)
  let content = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  content = toWesternDigits(content);
  content = ordinalsToWords(content);
  content = normalizeVocab(content);
  content = normalizeCurrency(content, language);
  content = stripContact(content);

  // `reply` is what we SHOW (neat bullets); `speech` is what we SPEAK (no
  // symbols, with sentence/line breaks kept so the voice pauses naturally).
  const reply = toDisplay(content);
  const speech = toSpeech(content);
  return Response.json({ reply, speech });
}

// Convert Bengali (০-৯) and Devanagari (०-९) numerals to Western 0-9 so ages,
// fees, prizes and the year are always spoken/shown as "6", "400", "2026".
function toWesternDigits(s: string): string {
  return s.replace(/[০-৯०-९]/g, (ch) => {
    const code = ch.charCodeAt(0);
    const base = code >= 0x0966 && code <= 0x096f ? 0x0966 : 0x09e6;
    return String(code - base);
  });
}

const ORDINAL_WORDS = [
  "zeroth", "first", "second", "third", "fourth", "fifth", "sixth",
  "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth",
];

// Bengali ordinal suffixes attached to a Western digit — listed by explicit
// codepoints to cover both precomposed (য় "য়") and decomposed
// (য়) forms plus conjuncts (র্থ, ষ্ঠ): ম, য়, র্থ, ষ্ঠ, শ, থ.
const BN_ORDINAL_SUFFIX =
  /(\d{1,2})(?:ম|য়|য়|র্থ|ষ্ঠ|শ|থ)/g;
// Hindi/Devanagari ordinal suffixes: ला, रा, था, वाँ, वां.
const HI_ORDINAL_SUFFIX =
  /(\d{1,2})(?:ला|रा|था|वाँ|वां)/g;

// Turn rank ordinals into words so they are read "first, second, third"
// instead of "one-st" or a native suffix. Runs after digit normalization, so
// inputs look like "1st", "4th", "1ম", "2য়", "4র্থ" or "2रा".
function ordinalsToWords(s: string): string {
  const toWord = (_m: string, n: string) => ORDINAL_WORDS[Number(n)] ?? _m;
  // Encoding-proof passes (codepoints) in addition to the literal regexes
  // above, so precomposed/decomposed Bengali forms are always caught.
  const bn = new RegExp(
    "(\\d{1,2})(?:\\u09AF\\u09BC|\\u09B0\\u09CD\\u09A5|\\u09B7\\u09CD\\u09A0|\\u09AE|\\u09DF|\\u09B6|\\u09A5)",
    "g"
  );
  const hi = new RegExp(
    "(\\d{1,2})(?:\\u0935\\u093E\\u0901|\\u0935\\u093E\\u0902|\\u0932\\u093E|\\u0930\\u093E|\\u0925\\u093E)",
    "g"
  );
  return s
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, toWord)
    .replace(BN_ORDINAL_SUFFIX, toWord)
    .replace(HI_ORDINAL_SUFFIX, toWord)
    .replace(bn, toWord)
    .replace(hi, toWord);
}

// Force preferred wording regardless of how the model phrased it. Codepoints
// are used so the source encoding can't cause a miss.
// "free": ফ্রি, মুফ্ত (Bengali); फ्री, मुफ्त, मुफ़्त (Hindi) -> "free".
function normalizeVocab(s: string): string {
  return s
    .replace(new RegExp("\\u09AB\\u09CD\\u09B0\\u09BF", "g"), "free") // ফ্রি
    .replace(new RegExp("\\u09AE\\u09C1\\u09AB\\u09CD\\u09A4", "g"), "free") // মুফ্ত
    .replace(new RegExp("\\u092B\\u094D\\u0930\\u0940", "g"), "free") // फ्री
    .replace(new RegExp("\\u092E\\u0941\\u092B\\u093C?\\u094D\\u0924", "g"), "free"); // मुफ़्त / मुफ्त
}

// Force ONE consistent currency word per language regardless of what the model
// wrote (rupees / টাকা / रुपये / Rs / ₹ all collapse to the chosen word):
// Bengali -> রুপি, Hindi -> rupaye, English -> rupees.
function normalizeCurrency(s: string, lang: VoiceLang): string {
  const target = lang === "bn" ? "রুপি" : lang === "hi" ? "rupaye" : "rupees";
  return s
    .replace(/₹\s*([\d,]+)/g, `$1 ${target}`) // "₹400" -> "400 <word>"
    .replace(/₹/g, target)
    .replace(/\brupees?\b/gi, target) // rupee / rupees
    .replace(/\bRs\.?\b/gi, target) // Rs / Rs.
    .replace(new RegExp("\\u099F\\u09BE\\u0995\\u09BE", "g"), target) // টাকা
    .replace(/रुप(?:ये|ए|यों)/g, target); // रुपये / रुपए / रुपयों
}

// Remove the email address / WhatsApp / contact-us closing the model sometimes
// adds — the widget already shows "Talk to a human" and "Email us" buttons.
function stripContact(s: string): string {
  return s
    .split("\n")
    .filter(
      (line) =>
        !/info@dekhaoapnatalent\.com/i.test(line) &&
        !/whats\s?app/i.test(line) &&
        !/হোয়াটস|ব্?হোয়াটস|व्हाट्सएप|वाट्सएप/i.test(line)
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Display version: keep line structure, normalize markdown bullets to "• ",
// drop bold/heading markers and stray asterisks.
function toDisplay(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/(^|\n)\s*#{1,6}\s+/g, "$1")
    .replace(/(^|\n)\s*[-*]\s+/g, "$1• ")
    .replace(/\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Spoken version: strip markdown/bullet symbols but KEEP one line break per
// item, so the player can speak each bullet as its own clip with a pause after
// it. Colons become commas (a gentle pause, and the voice won't say "colon"),
// and number ranges like "6-14" become "6 to 14".
function toSpeech(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/(^|\n)\s*#{1,6}\s+/g, "$1")
    .replace(/(^|\n)\s*[-*•]\s+/g, "$1")   // drop bullet symbol, keep the line
    .replace(/\*/g, "")
    .replace(/(\d)\s*[-–—]\s*(\d)/g, "$1 to $2") // "6-14" -> "6 to 14"
    .replace(/\s*:\s*/g, ", ")             // colon -> comma pause
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")              // one line break per item
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim();
}
