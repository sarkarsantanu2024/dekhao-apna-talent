import { Suspense } from "react";
import { Globe, Phone } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { FacebookIcon, WhatsappIcon } from "@/components/common/social-icons";
import { BRAND_ICON, DEVELOPER, EVENT_NAME, PRESENTED_BY } from "@/constants";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#16111f]/90 p-8 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/5 backdrop-blur-2xl sm:p-11">
      {/* Brand + heading */}
      <div className="mb-8 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BRAND_ICON}
          alt={EVENT_NAME}
          width={301}
          height={301}
          className="size-16 rounded-2xl object-contain drop-shadow-[0_6px_20px_rgba(168,85,247,0.35)] sm:size-20"
        />
        <h1 className="mt-5 text-[1.65rem] font-bold leading-tight tracking-tight text-white">
          Welcome to the Admin Panel
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Sign in to manage {EVENT_NAME}
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-amber-300/70">
          Organized by {PRESENTED_BY}
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-7 text-center text-xs leading-relaxed text-white/45">
        Centre owners: use the User ID &amp; password shared by your admin.
      </p>

      {/* Developer / support credit */}
      <div className="mt-6 border-t border-white/10 pt-5 text-center">
        <p className="text-[11px] text-white/40">
          Designed &amp; developed by{" "}
          <a
            href={DEVELOPER.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white/70 underline-offset-2 hover:text-white hover:underline"
          >
            {DEVELOPER.name}
          </a>
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          {[
            { href: DEVELOPER.website, label: `${DEVELOPER.name} website`, Icon: Globe },
            {
              href: `https://wa.me/${DEVELOPER.whatsapp}?text=${encodeURIComponent(DEVELOPER.whatsappMessage)}`,
              label: `WhatsApp ${DEVELOPER.phone}`,
              Icon: WhatsappIcon,
            },
            { href: `tel:${DEVELOPER.tel}`, label: `Call ${DEVELOPER.phone}`, Icon: Phone },
            { href: DEVELOPER.facebook, label: `${DEVELOPER.name} on Facebook`, Icon: FacebookIcon },
          ].map(({ href, label, Icon: LinkIcon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("tel:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              title={label}
              aria-label={label}
              className="inline-flex size-8 items-center justify-center rounded-full border border-white/15 text-white/55 transition-colors hover:border-white/40 hover:text-white"
            >
              <LinkIcon className="size-3.5" />
            </a>
          ))}
        </div>
        <a
          href={`tel:${DEVELOPER.tel}`}
          className="mt-2.5 inline-block text-[11px] tabular-nums text-white/40 hover:text-white/70"
        >
          Support: {DEVELOPER.phone}
        </a>
      </div>
    </div>
  );
}
