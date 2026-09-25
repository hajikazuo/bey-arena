import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-muted/40 p-6">
      <div aria-hidden="true" className="auth-grid absolute inset-0" />
      <div aria-hidden="true" className="auth-glow auth-glow-top absolute -left-32 -top-32 size-96 rounded-full" />
      <div aria-hidden="true" className="auth-glow auth-glow-bottom absolute -bottom-48 -right-32 size-[30rem] rounded-full" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
