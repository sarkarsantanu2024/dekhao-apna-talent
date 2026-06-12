import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { EVENT_NAME } from "@/constants";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#16111f]/90 p-8 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/5 backdrop-blur-2xl sm:p-10">
      {/* Brand + heading */}
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-gradient p-3 shadow-lg shadow-fuchsia-500/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mma-logo-white.png" alt={EVENT_NAME} className="size-full object-contain" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-white/60">
          Sign in to the {EVENT_NAME} portal
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-center text-xs text-white/45">
        Centre owners: use the User ID &amp; password shared by your admin.
      </p>
    </div>
  );
}
