"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
      <Toaster />
    </SessionProvider>
  );
}
