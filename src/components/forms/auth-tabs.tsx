"use client";

import { useState } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { RegisterForm } from "@/components/forms/register-form";

type Tab = "login" | "register";

/**
 * One panel that shows BOTH the sign-in and register forms via a tab switch,
 * so a single "Login / Register" entry point covers both.
 */
export function AuthTabs({ defaultTab = "login" }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/40 p-1">
        {(["login", "register"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "bg-brand-gradient text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      {tab === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
