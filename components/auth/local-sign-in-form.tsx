"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

const inputClass =
  "w-full rounded-sm border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "block text-sm font-medium text-foreground mb-1";

export function LocalSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("That email and password don't match a record on file.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p
          className="border border-destructive/50 bg-stamp-tint px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm border border-primary bg-primary hover:bg-primary/85 disabled:opacity-60 text-primary-foreground text-sm font-medium py-2.5 transition-colors"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-foreground underline decoration-ledger font-medium"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
