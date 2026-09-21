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
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Lukket pilot</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Forsikringsassistent</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Skriv inn pilotkoden du har fått for å åpne verktøyet.</p>
        <form className="mt-6" onSubmit={submit}>
          <label htmlFor="pilot-code" className="text-sm font-semibold text-slate-900">Pilotkode</label>
          <input
            id="pilot-code"
            type="password"
            autoComplete="current-password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            maxLength={256}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code}
            className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Kontrollerer …" : "Åpne piloten"}
          </button>
        </form>
      </section>
    </main>
  );
}
