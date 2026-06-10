"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";

/** Floating "scroll to top" button — appears after scrolling down. Sits
 *  bottom-left so it never collides with the Ask-Us widget (bottom-right). */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-5 left-5 z-50 inline-flex size-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-black/40 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.7)] ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <Icon name="arrow_upward" size={22} aria-label="Top" />
    </button>
  );
}
