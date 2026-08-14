"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

const inputClass =
  "w-full rounded-sm border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "block text-sm font-medium text-foreground mb-1";

export function LocalSignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await axios.post("/api/auth/register", {
        email,
        password,
        firstName,
        lastName,
      });

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(
          "Account created, but automatic sign-in failed. Try signing in manually.",
        );
        setSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create account");
      setSubmitting(false);
    }
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
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
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <p className="catalog-number mt-1">At least 8 characters</p>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm border border-primary bg-primary hover:bg-primary/85 disabled:opacity-60 text-primary-foreground text-sm font-medium py-2.5 transition-colors"
      >
        {submitting ? "Creating account…" : "Sign up"}
      </button>
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-foreground underline decoration-ledger font-medium"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
