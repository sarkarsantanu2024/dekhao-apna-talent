"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

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
      className={`fixed bottom-5 left-5 z-50 inline-flex size-12 items-center justify-center rounded-full bg-ink text-[#f3ead9] shadow-float transition-all duration-300 hover:bg-gold hover:text-ink ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" strokeWidth={2} />
    </button>
  );
}
