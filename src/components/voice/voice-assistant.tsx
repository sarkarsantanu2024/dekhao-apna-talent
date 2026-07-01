"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/common/icon";
import {
  VOICE_LANGUAGES,
  SUGGESTED_QUESTIONS,
  type VoiceLang,
} from "@/constants/voice-assistant";

type Msg = { role: "user" | "assistant"; content: string };
type Status = "idle" | "thinking" | "speaking";

const WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "";

export function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<VoiceLang | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Bumped whenever playback should be abandoned (new question, close, etc.)
  // so any in-flight chunked-speech loop knows to stop.
  const playTokenRef = useRef(0);

  // Auto-scroll the transcript as it grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const stopAudio = useCallback(() => {
    playTokenRef.current++;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  // Fetch speech audio (base64 WAV) for one short piece of text.
  const fetchTTS = useCallback(async (chunk: string, l: VoiceLang): Promise<string | null> => {
    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chunk, language: l }),
      });
      if (res.ok) return (await res.json()).audio ?? null;
    } catch {
      /* best-effort */
    }
    return null;
  }, []);

  // Play one base64 WAV and resolve when it finishes (or is stopped).
  const playClip = useCallback((base64: string | null) => {
    return new Promise<void>((resolve) => {
      if (!base64) return resolve();
      const audio = new Audio(`data:audio/wav;base64,${base64}`);
      audioRef.current = audio;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      audio.onended = finish;
      audio.onerror = finish;
      audio.onpause = finish; // stopAudio() pauses -> unblock the loop
      audio.play().catch(finish);
    });
  }, []);

  // Speak text by streaming it sentence-by-sentence: the first chunk is
  // synthesized and played quickly while later chunks render in the background,
  // so long answers start speaking in ~1.5s instead of waiting for the whole
  // audio (which can take 7s+ for a long reply).
  const speakText = useCallback(
    async (toSpeak: string, l: VoiceLang) => {
      const chunks = splitForSpeech(toSpeak);
      if (chunks.length === 0) {
        setStatus("idle");
        return;
      }
      const token = ++playTokenRef.current;
      setStatus("speaking");
      let nextAudio = fetchTTS(chunks[0], l); // start first synthesis now
      for (let i = 0; i < chunks.length; i++) {
        const clip = await nextAudio;
        if (playTokenRef.current !== token) return; // superseded / stopped
        if (i + 1 < chunks.length) nextAudio = fetchTTS(chunks[i + 1], l); // prefetch
        await playClip(clip);
        if (playTokenRef.current !== token) return;
      }
      if (playTokenRef.current === token) setStatus("idle");
    },
    [fetchTTS, playClip]
  );

  // Pick a language, show the greeting, and speak it aloud. Triggered by a user
  // click, so browser autoplay rules allow the audio to play.
  const chooseLanguage = useCallback(
    (l: VoiceLang) => {
      setLang(l);
      setError(null);
      setMessages([{ role: "assistant", content: VOICE_LANGUAGES[l].greeting }]);
      setStatus("speaking");
      speakText(VOICE_LANGUAGES[l].greeting, l);
    },
    [speakText]
  );

  // Core flow: send the user's turn to the LLM, then speak the reply.
  const ask = useCallback(
    async (userText: string) => {
      if (!lang) return;
      const trimmed = userText.trim();
      if (!trimmed) return;

      stopAudio();
      const next: Msg[] = [...messages, { role: "user", content: trimmed }];
      setMessages(next);
      setStatus("thinking");
      setError(null);

      try {
        const res = await fetch("/api/voice/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next, language: lang }),
        });
        if (res.status === 503) {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: notConfiguredMessage(lang) },
          ]);
          setStatus("idle");
          return;
        }
        if (!res.ok) throw new Error("chat failed");
        const data = await res.json();
        const reply: string = data.reply || fallbackMessage(lang);
        const speech: string = data.speech || reply;
        setMessages((m) => [...m, { role: "assistant", content: reply }]);

        // Show the formatted reply, but speak the plain version (best-effort).
        await speakText(speech, lang);
      } catch {
        setError(errorMessage(lang));
        setStatus("idle");
      }
    },
    [lang, messages, speakText, stopAudio]
  );

  function closePanel() {
    stopAudio();
    setOpen(false);
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat with us"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#A855F7] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 active:scale-95"
        >
          <Icon name="support_agent" size={20} aria-label="Chat with us" />
          Ask us
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(34rem,calc(100dvh-2.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0F] text-white shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0F0F14] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#A855F7]">
                <Icon name="support_agent" size={18} className="text-white" aria-label="Assistant" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold">Talent Assistant</p>
                <p className="text-[11px] text-white/50">{statusLabel(status, lang)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {lang && (
                <button
                  onClick={() => setLang(null)}
                  title="Change language"
                  className="rounded-md px-2 py-1 text-[11px] font-semibold uppercase text-white/60 hover:bg-white/10 hover:text-white"
                >
                  {VOICE_LANGUAGES[lang].label}
                </button>
              )}
              <button
                onClick={closePanel}
                aria-label="Close"
                className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <Icon name="close" size={20} aria-label="Close" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!lang ? (
            <LanguagePicker onChoose={chooseLanguage} />
          ) : (
            <>
              <div
                ref={scrollRef}
                data-lenis-prevent
                className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
              >
                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role} text={m.content} />
                ))}
                {status === "thinking" && <Bubble role="assistant" text="…" muted />}

                {/* Suggested questions — shown whenever idle so they reappear
                    after every answer, not just at the start. */}
                {status === "idle" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTED_QUESTIONS[lang].map((q) => (
                      <button
                        key={q}
                        onClick={() => ask(q)}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[#A855F7]/50 hover:text-white"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="px-4 pb-1 text-xs text-[#A855F7]">{error}</p>
              )}

              {/* Human fallback. Free-text input removed to cap cost: visitors
                  ask via the cacheable suggested questions above, so we never
                  pay to synthesize unbounded one-off queries. */}
              {WHATSAPP && (
                <div className="border-t border-white/10 px-3 py-3">
                  <div className="flex items-center justify-center gap-4 text-[11px] text-white/40">
                    <a
                      href={`https://wa.me/${WHATSAPP}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-white/80"
                    >
                      <Icon name="chat" size={14} /> Talk to a human
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

function LanguagePicker({ onChoose }: { onChoose: (l: VoiceLang) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <Icon name="translate" size={36} className="text-[#A855F7]" aria-label="Choose language" />
      <p className="text-sm text-white/70">
        Choose a language · भाषा चुनें · ভাষা বেছে নিন
      </p>
      <div className="flex w-full flex-col gap-2">
        {(Object.keys(VOICE_LANGUAGES) as VoiceLang[]).map((l) => (
          <button
            key={l}
            onClick={() => onChoose(l)}
            className="rounded-xl border border-white/15 py-3 text-base font-bold transition-colors hover:border-[#A855F7] hover:bg-[#A855F7]/10"
          >
            {VOICE_LANGUAGES[l].label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ role, text, muted }: { role: "user" | "assistant"; text: string; muted?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-[#A855F7] text-white"
            : "border border-white/10 bg-white/5 text-white/90"
        } ${muted ? "animate-pulse text-white/50" : ""}`}
      >
        {text}
      </div>
    </div>
  );
}

// Split the spoken text into clips. Each LINE (one bullet / one sentence)
// becomes its own clip, so playback pauses naturally after every bullet and
// the first clip can be synthesized and played quickly. Very long lines are
// split further on sentence boundaries ("." "?" "!" and Bengali danda "।").
function splitForSpeech(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  for (const line of lines) {
    if (line.length <= 200) {
      chunks.push(line);
      continue;
    }
    const sentences = line
      .split(/(?<=[।.?!])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    let cur = "";
    for (const seg of sentences) {
      if (cur && (cur + " " + seg).length > 200) {
        chunks.push(cur);
        cur = seg;
      } else {
        cur = cur ? `${cur} ${seg}` : seg;
      }
    }
    if (cur) chunks.push(cur);
  }
  return chunks;
}

// --- Localized UI strings -------------------------------------------------

function statusLabel(status: Status, lang: VoiceLang | null): string {
  const l = lang ?? "en";
  const map: Record<Status, Record<VoiceLang, string>> = {
    idle: { en: "Ask me anything", hi: "Kuch bhi poochhein", bn: "যা খুশি জিজ্ঞাসা করুন" },
    thinking: { en: "Thinking…", hi: "Soch raha hoon…", bn: "ভাবছি…" },
    speaking: { en: "Speaking…", hi: "Bol raha hoon…", bn: "বলছি…" },
  };
  return map[status][l];
}

function errorMessage(lang: VoiceLang | null): string {
  return {
    en: "Something went wrong. Please try again.",
    hi: "Kuch galat ho gaya. Kripya phir se koshish karein.",
    bn: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",
  }[lang ?? "en"];
}

function notConfiguredMessage(lang: VoiceLang | null): string {
  return {
    en: "The assistant isn't switched on yet. Please use the WhatsApp or email option below for help.",
    hi: "Assistant abhi chalu nahi hai. Madad ke liye neeche WhatsApp ya email ka istemal karein.",
    bn: "Assistant এখনো চালু হয়নি। সাহায্যের জন্য নিচের WhatsApp বা email ব্যবহার করুন।",
  }[lang ?? "en"];
}

function fallbackMessage(lang: VoiceLang | null): string {
  return {
    en: "Let me connect you to a human helper using the options below.",
    hi: "Main aapko human helper se jodta hoon, neeche diye options ka istemal karein.",
    bn: "নিচের অপশন ব্যবহার করে আপনাকে একজন মানুষের সাথে যুক্ত করছি।",
  }[lang ?? "en"];
}
