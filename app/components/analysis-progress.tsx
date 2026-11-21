import type { FailureCode, ProgressState } from "../../lib/analysis-progress.ts";
import { canonicalInsuranceTypeLabel, isKnownInsuranceType } from "../../lib/insurance-normalization.ts";

const labels = { queued: "Venter", validating: "Valideres", extracting: "Leses", ready: "Lest – venter på analyse", analyzing: "Analyseres", completed: "Ferdig", failed: "Kunne ikke analyseres", identified: "Identifisert" };
const documentFailureLabels: Partial<Record<FailureCode, string>> = {
  encrypted_pdf: "Passordbeskyttet",
  no_insurance_data: "Fant ingen forsikringsopplysninger",
};
function StatusIcon({ status }: { status: string }) {
  return <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">{status === "completed" || status === "ready" ? "✓" : status === "failed" ? "!" : status === "queued" ? "○" : "…"}</span>;
}
type AnalysisSummary = { successfulDocuments: number; failedDocuments: number };

export function AnalysisProgress({ state, summary }: { state: ProgressState; summary?: AnalysisSummary | null }) {
  const terminal = ["completed", "partial", "failed"].includes(state.status);
  const counts = terminal ? summary : null;
  const completed = counts?.successfulDocuments ?? state.documents.filter((d) => d.status === "completed").length;
  const failed = counts?.failedDocuments ?? state.documents.filter((d) => d.status === "failed").length;
  const total = counts ? completed + failed : state.documents.length;
  const processed = completed + failed;
  const productCount = state.products.filter((p) => p.status === "completed").length;
  const terminalText = total > 0
    ? `${completed} av ${total} dokumenter analysert` + (state.products.length > 0 ? ` · ${productCount} ${productCount === 1 ? "forsikringsprodukt" : "forsikringsprodukter"}` : "")
    : state.status === "completed" ? "Registrerte opplysninger er sammenlignet."
      : state.status === "failed" ? "Kontroller feilmeldingen og prøv igjen." : null;
  const partial = state.status === "partial" || (state.status === "completed" && failed > 0);
  const title = partial ? "Analysen er ferdig med merknader" : state.status === "completed" ? "Analysen er ferdig" : state.status === "failed" ? "Analysen kunne ikke fullføres" : state.status === "uploading" ? "Laster opp dokumenter" : "Analyserer forsikringene";
  const determinate = !terminal && state.status !== "uploading" && total > 0 && processed < total;
  const percentage = total ? Math.round(processed / total * 100) : 0;
  const sides = <div className="mt-4 grid gap-4 sm:grid-cols-2">{(["existing", "offer"] as const).map((side) => <div key={side} className={`${side === "existing" ? "overview-side-existing" : "overview-side-offer"} rounded-xl border border-slate-200 p-4`}>
    <h4 className="text-sm font-semibold text-slate-900">{side === "existing" ? "Eksisterende" : "Nytt tilbud"}</h4>
    <ul className="mt-3 space-y-2 text-sm text-slate-600">{state.documents.filter((d) => d.side === side).map((d) => <li key={d.documentIndex} className="flex items-center gap-2"><StatusIcon status={d.status} /><span>Dokument {d.documentIndex + 1}<span className="block text-xs">{(d.error && documentFailureLabels[d.error]) ?? labels[d.status]}</span></span></li>)}</ul>
    {state.products.some((p) => p.side === side) && <div className="mt-4 border-t border-slate-200 pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Identifiserte produkter</p><ul className="mt-2 space-y-2 text-sm text-slate-700">{state.products.filter((p) => p.side === side).map((p) => <li key={`${p.batchIndex}:${p.productIndex}`} className="flex items-center gap-2"><StatusIcon status={p.status} /><span>{isKnownInsuranceType(p.insuranceType) ? canonicalInsuranceTypeLabel(p.insuranceType) : "Ukjent forsikringstype"}: {labels[p.status]}</span></li>)}</ul></div>}
  </div>)}</div>;
  return <section aria-label="Analyseframdrift" className={`mt-5 rounded-2xl border p-5 sm:p-6 ${partial || state.status === "failed" ? "border-amber-300 bg-amber-50" : "border-slate-300 bg-white shadow-sm"}`}>
    <div aria-live="polite" role="status" className="flex items-start gap-3">
      <StatusIcon status={partial ? "failed" : state.status} />
      <div><h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
        {terminal ? terminalText && <p className="mt-1 text-sm text-slate-600">{terminalText}</p> : <p className="mt-1 text-sm text-slate-600">{state.status === "uploading" ? "Venter på bekreftelse fra serveren." : total > 0 ? `${processed} av ${total} dokumenter behandlet` : "Forbereder sammenligningen."}</p>}
      </div>
    </div>
    {partial && <p role="alert" className="mt-3 text-sm text-amber-950">
      {failed > 0 && `${failed} ${failed === 1 ? "dokument kunne" : "dokumenter kunne"} ikke analyseres. `}
      Sammenligningen kan være ufullstendig.
    </p>}
    {!terminal && <div className="mt-4">
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-600"><span>{determinate ? "Dokumentbehandling" : total > 0 && processed === total ? "Forbereder sammenligningen" : "Analyse pågår"}</span>{determinate && <span>{percentage} %</span>}</div>
      <progress aria-label={determinate ? "Behandlede dokumenter" : "Analyse pågår"} aria-valuetext={determinate ? `${processed} av ${total} dokumenter behandlet` : "Arbeider – gjenstående tid er ukjent"} {...(determinate ? {value: processed, max: total} : {})} className="block h-2.5 w-full accent-slate-700" />
    </div>}
    {terminal ? (state.documents.length > 0 || state.products.length > 0) &&
      <details className="mt-3 text-sm"><summary className="text-link cursor-pointer font-medium">Vis analysestatus per dokument</summary>{sides}</details> : sides}
  </section>;
}
