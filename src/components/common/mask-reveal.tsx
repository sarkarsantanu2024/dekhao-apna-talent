"use client";

import { useRef, type ReactNode } from "react";
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

      gsap.set(targets, { yPercent: 110 });
      gsap.to(targets, {
        yPercent: 0,
        duration: 0.95,
        ease: "power3.out",
        stagger,
        delay,
        ...(immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: root.current,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }),
      });
    },
    { scope: root, dependencies: [stagger, delay, immediate] },
  );

  const fragments = splitChildren(children, byChar);

  return (
    <Tag className={className} ref={root as React.Ref<HTMLDivElement>}>
      {fragments.map((frag, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span data-mask-frag className="inline-block will-change-transform">
            {frag === " " ? " " : frag}
          </span>
        </span>
      ))}
    </Tag>
  );
}

function splitChildren(children: ReactNode, byChar: boolean): string[] {
  const text = flatten(children);
  if (byChar) return Array.from(text);
  const out: string[] = [];
  text.split(/(\s+)/).forEach((w) => {
    if (w) out.push(w);
  });
  return out;
}

function flatten(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flatten).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return flatten(props?.children);
  }
  return "";
}
