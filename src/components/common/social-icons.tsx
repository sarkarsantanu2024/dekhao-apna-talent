/** Inline brand SVGs (lucide v1 dropped brand logos). currentColor-aware. */
type P = { className?: string };

export function InstagramIcon({ className = "size-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className = "size-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.86.3-1.45 1.55-1.45H16.4V5.05C16.1 5.02 15.2 4.95 14.2 4.95c-2.1 0-3.6 1.3-3.6 3.66V11H8.1v3h2.5v7h2.9z" />
    </svg>
  );
}

export function YoutubeIcon({ className = "size-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23 12s0-3.2-.41-4.74a2.5 2.5 0 0 0-1.76-1.77C19.27 5 12 5 12 5s-7.27 0-8.83.49A2.5 2.5 0 0 0 1.41 7.26C1 8.8 1 12 1 12s0 3.2.41 4.74a2.5 2.5 0 0 0 1.76 1.77C4.73 19 12 19 12 19s7.27 0 8.83-.49a2.5 2.5 0 0 0 1.76-1.77C23 15.2 23 12 23 12zM9.75 15.02V8.98L15 12l-5.25 3.02z" />
    </svg>
  );
}

export function WhatsappIcon({ className = "size-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.13l-.29-.17-2.9.79.78-2.83-.19-.3A8 8 0 1 1 12 20zm4.4-5.6c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.7-.28-1.45-.62-2.06-1.42-.45-.55-.83-1.13-.93-1.32-.1-.18-.01-.28.1-.4l.37-.43c.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42l-.74-1.78c-.2-.46-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

export const SOCIALS = [
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
  { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
  { href: "https://youtube.com", label: "YouTube", Icon: YoutubeIcon },
  { href: "https://wa.me/919804243159", label: "WhatsApp", Icon: WhatsappIcon },
];
