"use client";

import { Children, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  children: ReactNode;
  byChar?: boolean;
  stagger?: number;
  delay?: number;
  immediate?: boolean;
  className?: string;
  as?: "span" | "div" | "h1" | "h2" | "h3" | "p";
};

export function MaskReveal({
  children,
  byChar = false,
  stagger = 0.08,
  delay = 0,
  immediate = false,
  className = "",
  as: Tag = "span",
}: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      const targets = root.current.querySelectorAll<HTMLElement>("[data-mask-frag]");
      if (!targets.length) return;

      // `from` (not set+to) guarantees the text ends visible: even if the
      // ScrollTrigger fires while the element is already in view, it reveals
      // once and never gets stuck hidden.
      gsap.from(targets, {
        yPercent: 110,
        duration: 0.95,
        ease: "power3.out",
        stagger,
        delay,
        ...(immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: root.current,
                start: "top 95%",
                once: true,
              },
            }),
      });
    },
    { scope: root, dependencies: [stagger, delay, immediate] },
  );

  const fragments = splitChildren(children, byChar);

  return (
    <Tag className={className} ref={root as React.Ref<HTMLDivElement>}>
      {fragments.map((frag, i) =>
        typeof frag === "string" && frag.trim() === "" ? (
          // Real space — explicit width so it isn't collapsed between the
          // inline-block word wrappers (otherwise words run together).
          <span key={i} className="inline-block w-[0.28em]" aria-hidden />
        ) : (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span data-mask-frag className="inline-block will-change-transform">
              {frag}
            </span>
          </span>
        )
      )}
    </Tag>
  );
}

/**
 * Split children into reveal fragments. Plain text is split into words (or
 * characters). React elements — e.g. a `<span className="text-gradient">word</span>`
 * highlight — are kept WHOLE so their gradient/styling survives (flattening to a
 * string would drop it, and `background-clip:text` only paints on a leaf).
 */
function splitChildren(children: ReactNode, byChar: boolean): ReactNode[] {
  const out: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      const text = String(child);
      const parts = byChar ? Array.from(text) : text.split(/(\s+)/);
      parts.forEach((p) => {
        if (p) out.push(p);
      });
    } else if (child != null && typeof child !== "boolean") {
      out.push(child);
    }
  });
  return out;
}
