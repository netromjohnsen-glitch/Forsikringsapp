"use client";

import { useState, type FormEvent } from "react";

export default function PilotAccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/pilot-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        cache: "no-store",
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        setError(data.error || "Kunne ikke bekrefte pilotkoden.");
        return;
      }
      window.location.replace("/");
    } catch {
      setError("Kunne ikke kontakte serveren.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-page min-h-screen">
      <header className="brand-header h-32 sm:h-40" aria-hidden="true" />
      <section className="surface-card mx-auto -mt-12 w-[calc(100%_-_2rem)] max-w-md rounded-2xl border p-6 sm:-mt-16 sm:p-8">
        <p className="brand-eyebrow text-sm font-semibold uppercase tracking-[0.16em]">Lukket pilot</p>
        <h1 className="brand-title mt-2 text-2xl font-bold tracking-tight">Forsikringsassistent</h1>
        <p className="body-copy mt-3 text-sm leading-6">Skriv inn pilotkoden du har fått for å åpne verktøyet.</p>
        <form className="mt-6" onSubmit={submit}>
          <label htmlFor="pilot-code" className="section-title text-sm font-semibold">Pilotkode</label>
          <input
            id="pilot-code"
            type="password"
            autoComplete="current-password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            maxLength={256}
            className="form-control mt-2 w-full rounded-lg border px-3 py-2.5 shadow-sm outline-none"
          />
          {error && <p role="alert" className="error-panel mt-3 rounded-lg border px-3 py-2.5 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code}
            className="primary-button mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed"
          >
            {loading ? "Kontrollerer …" : "Åpne piloten"}
          </button>
        </form>
      </section>
    </main>
  );
}
