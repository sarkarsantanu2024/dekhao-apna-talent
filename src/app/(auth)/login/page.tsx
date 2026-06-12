import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { EVENT_NAME } from "@/constants";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/6 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
      {/* Brand + heading */}
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-white/10 p-2 ring-1 ring-white/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mma-logo-white.png" alt={EVENT_NAME} className="size-full object-contain" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-white/55">
          Sign in to the {EVENT_NAME} portal
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-center text-xs text-white/40">
        Centre owners: use the User ID &amp; password shared by your admin.
      </p>
    </div>
  );
}
