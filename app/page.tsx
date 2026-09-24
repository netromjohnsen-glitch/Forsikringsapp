"use client";
import { objectDisplayLabel, objectWarning, type ObjectComparisonContext } from "../lib/object-matching.ts";

import { vehicleObjectTypes } from "../lib/vehicle-object-registry.ts";
import { useEffect, useMemo, useRef, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import { readAnalysisResponse, validateUploadSelection } from "@/lib/analysis-client";
import { applyProgress, createAnalysisGeneration, emptyProgress, type ProgressState } from "@/lib/analysis-progress";
import { isMotorVehicleType } from "@/lib/insurance-normalization";
import { VehiclePriceList } from "./components/vehicle-price";
import { PortfolioPriceList } from "./components/portfolio-price";
import { portfolioPrice, portfolioPriceDifference, type PortfolioPriceInput } from "@/lib/portfolio-price-presentation";
import { providerDisplayName, agreementProviderDisplayName } from "@/lib/provider-presentation";
import { AnalysisProgress } from "./components/analysis-progress";
import { vehiclePrices, vehiclePriceFields, isVehiclePriceKey, differentVehiclePriceBasis, vehiclePriceDifferences } from "@/lib/vehicle-price-presentation";
import type { MatchingPlan } from "@/lib/hybrid-matching";
import { measureComparisonWork } from "@/lib/comparison-performance";
import { annualPremiumLabel } from "@/lib/agreement-pricing";
import type { ManualPremiumSummary } from "@/lib/agreement-pricing";
import { emptyManualAgreement, emptyManualProduct } from "@/lib/manual-agreement";
import type { ManualAgreementInput, ManualProductInput } from "@/lib/manual-agreement";
import { availableAddOns, catalogConnectionStatus, findCatalogProduct, findCatalogProductBySelection, productCatalog, productSuggestions } from "@/lib/product-catalog";
import { createDifferences, groupAddOnNames, groupInsurances, groupTerms, groupValue } from "@/lib/comparison";
import { presentImportantDifferences, sortDetailedTerms } from "@/lib/comparison-presentation";
import type { PresentedDifference } from "@/lib/comparison-presentation";
import type { BaseFact, ComparedInsurance as Insurance, Difference, FactSource, InsuranceGroup, TermGroup } from "@/lib/comparison";
import { coverageStatusLabel, type CanonicalCoverage } from "@/lib/coverage-status";
import { clientTraceEvents, type ClientTraceContext } from "@/lib/production-trace";

type InsuranceData = {
  company: string | null;
  totalAnnualPremium: string | null;
  priceSummary?: ManualPremiumSummary;
  insurances: Insurance[];
};

type DocumentResult = {
  source: "pdf" | "manual";
  filename: string;
  insuranceData: InsuranceData;
};

const pilotInsuranceTypes = ["Bil", "Innbo", "Hus", "Reise", ...vehicleObjectTypes.map(({ label }) => label)];

export default function Home() {
  const [existingFiles, setExistingFiles] = useState<File[]>([]);
  const [offerFiles, setOfferFiles] = useState<File[]>([]);
  const [existingMode, setExistingMode] = useState<"pdf" | "manual">("pdf");
  const [offerMode, setOfferMode] = useState<"pdf" | "manual">("pdf");
  const [existingManual, setExistingManual] = useState<ManualAgreementInput>(emptyManualAgreement);
  const [offerManual, setOfferManual] = useState<ManualAgreementInput>(emptyManualAgreement);
  const [documents, setDocuments] = useState<DocumentResult[]>([]);
  const [matchingPlan, setMatchingPlan] = useState<MatchingPlan | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<ProgressState>(emptyProgress);
  const loading = progress.status === "uploading" || progress.status === "analyzing";
  const [partial, setPartial] = useState<{ failedDocuments: number; successfulDocuments: number; partialSuccess: boolean; failures?: { side: "existing" | "offer" }[]; conservativeObjectSeparation?: boolean; trace?: ClientTraceContext; traceGeneration?: number; traceSignal?: AbortSignal } | null>(null);
  const generation = useRef(createAnalysisGeneration());
  const activeRequest = useRef<AbortController | null>(null);
  const traceRequest = useRef<AbortController | null>(null);
  useEffect(() => () => { activeRequest.current?.abort(); traceRequest.current?.abort(); }, []);
  function cancelAnalysis() {
    generation.current.next(); activeRequest.current?.abort(); activeRequest.current = null;
    traceRequest.current?.abort(); traceRequest.current = null;
    setProgress(emptyProgress()); setPartial(null);
  }

  function addFiles(side: "existing" | "offer", newFiles: FileList | null) {
    if (!newFiles) return;

    const pdfFiles = Array.from(newFiles).filter(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );

    const current = side === "existing" ? existingFiles : offerFiles;
    const selected = [...current, ...pdfFiles.filter((file) => !current.some((saved) => saved.name === file.name && saved.size === file.size && saved.lastModified === file.lastModified))];
    try { validateUploadSelection(side === "existing" ? selected : existingFiles, side === "offer" ? selected : offerFiles); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Ugyldig opplasting."); return; }
    cancelAnalysis();
    const update = side === "existing" ? setExistingFiles : setOfferFiles;
    update(selected);
    setDocuments([]);
    setMatchingPlan(null);
    setError("");
  }

  function removeFile(side: "existing" | "offer", index: number) {
    cancelAnalysis();
    const update = side === "existing" ? setExistingFiles : setOfferFiles;
    update((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setDocuments([]);
    setMatchingPlan(null);
  }

  function changeMode(side: "existing" | "offer", mode: "pdf" | "manual") {
    cancelAnalysis();
    if (side === "existing") setExistingMode(mode);
    else setOfferMode(mode);
    setDocuments([]);
    setMatchingPlan(null);
    setError("");
  }

  function changeManual(side: "existing" | "offer", value: SetStateAction<ManualAgreementInput>) {
    cancelAnalysis();
    if (side === "existing") setExistingManual(value);
    else setOfferManual(value);
    setDocuments([]);
    setMatchingPlan(null);
    setError("");
  }

  const existingReady = existingMode === "pdf" ? existingFiles.length > 0 : manualReady(existingManual);
  const offerReady = offerMode === "pdf" ? offerFiles.length > 0 : manualReady(offerManual);

  async function analyzeDocuments() {
    if (!existingReady || !offerReady || activeRequest.current) return;
    try { validateUploadSelection(existingMode === "pdf" ? existingFiles : [], offerMode === "pdf" ? offerFiles : []); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Ugyldig opplasting."); return; }
    const requestGeneration = generation.current.next();
    traceRequest.current?.abort(); traceRequest.current = null;
    const controller = new AbortController(); activeRequest.current = controller;
    setProgress({ ...emptyProgress(), status: "uploading" }); setPartial(null);
    setDocuments([]);
    setMatchingPlan(null);
    setError("");

    const formData = new FormData();

    formData.set("existingMode", existingMode);
    formData.set("offerMode", offerMode);
    if (existingMode === "pdf") existingFiles.forEach((file) => formData.append("existingFiles", file));
    else formData.set("existingManual", JSON.stringify(existingManual));
    if (offerMode === "pdf") offerFiles.forEach((file) => formData.append("offerFiles", file));
    else formData.set("offerManual", JSON.stringify(offerManual));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        cache: "no-store",
        headers: { Accept: "application/x-ndjson" },
        signal: controller.signal,
      });

      const data = await readAnalysisResponse(response, (event) => {
        if (generation.current.current(requestGeneration)) setProgress((state) => applyProgress(state, event));
      }) as { documents: DocumentResult[]; matchingPlan?: MatchingPlan; analysis?: { partialSuccess: boolean; failedDocuments: number; successfulDocuments: number; failures?: { side: "existing" | "offer" }[]; conservativeObjectSeparation?: boolean; trace?: ClientTraceContext } };
      if (!generation.current.current(requestGeneration)) return;
      setDocuments(data.documents);
      setMatchingPlan(data.matchingPlan || null);
      traceRequest.current = data.analysis?.trace ? controller : null;
      setPartial(data.analysis ? { ...data.analysis, traceGeneration: requestGeneration, traceSignal: controller.signal } : null);
      setProgress((state) => ({ ...state, status: data.analysis?.partialSuccess ? "partial" : "completed" }));
    } catch (caught) {
      if (!generation.current.current(requestGeneration)) return;
      setError(caught instanceof Error ? caught.message : "Kunne ikke analysere dokumentene.");
      setProgress((state) => ({ ...state, status: "failed" }));
    } finally {
      if (generation.current.current(requestGeneration)) activeRequest.current = null;
    }
  }

  return (
    <main className="app-page min-h-screen">
      <header className="brand-header">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="brand-eyebrow text-sm font-semibold uppercase tracking-[0.16em]">Rådgiververktøy</p>
          <h1 className="brand-title mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Forsikringsassistent
          </h1>
          <p className="body-copy mt-3 text-lg">
            Sammenlign eksisterende forsikringer med et nytt tilbud.
          </p>
          <p className="body-copy mt-1 text-sm">Last opp forsikringsdokumenter eller registrer forsikringene manuelt.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="surface-card rounded-2xl border p-5 sm:p-8">
          <h2 className="section-title text-xl font-semibold">Ny sammenligning</h2>
          <p className="body-copy mt-2">
            Legg inn dagens forsikringer til venstre og tilbudet du vil vurdere til høyre.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <AgreementInput
              eyebrow="Eksisterende forsikringer"
              title="Dagens avtale"
              side="existing"
              mode={existingMode}
              onModeChange={(mode) => changeMode("existing", mode)}
              files={existingFiles}
              onAdd={(newFiles) => addFiles("existing", newFiles)}
              onRemove={(index) => removeFile("existing", index)}
              manual={existingManual}
              onManualChange={(value) => changeManual("existing", value)}
            />
            <AgreementInput
              eyebrow="Nytt tilbud"
              title="Tilbudet som skal vurderes"
              side="offer"
              mode={offerMode}
              onModeChange={(mode) => changeMode("offer", mode)}
              files={offerFiles}
              onAdd={(newFiles) => addFiles("offer", newFiles)}
              onRemove={(index) => removeFile("offer", index)}
              manual={offerManual}
              onManualChange={(value) => changeManual("offer", value)}
            />
          </div>

          <button
            onClick={analyzeDocuments}
            disabled={loading || !existingReady || !offerReady}
            aria-describedby={!existingReady || !offerReady ? "comparison-requirements" : undefined}
            className="primary-button mt-6 w-full rounded-xl px-6 py-3 font-semibold shadow-sm disabled:cursor-not-allowed sm:w-auto"
          >
            {loading ? (existingMode === "pdf" || offerMode === "pdf" ? "Leser dokumenter og sammenligner …" : "Sammenligner forsikringene …") : "Sammenlign forsikringene"}
          </button>
          {(!existingReady || !offerReady) && (
            <p id="comparison-requirements" className="mt-2 text-sm text-slate-600">Legg til minst én PDF, eller fyll ut selskap, forsikringstype og produkt, på begge sider.</p>
          )}
          {loading && <button type="button" className="ml-3 underline" onClick={cancelAnalysis}>Avbryt analyse</button>}
          {progress.status !== "idle" && <AnalysisProgress state={progress} />}
          {partial?.conservativeObjectSeparation && <p className="mt-3 text-sm">Dokumentene ble analysert i flere grupper. Objekter uten sikker felles identitet holdes adskilt; kontroller mulig overlapp før du bruker resultatet.</p>}

          {error && (
            <div role="alert" className="error-panel mt-6 rounded-xl border p-4">{error}</div>
          )}
        </div>

        {documents.length >= 2 && (
          <Comparison key={`${documents[0].filename}-${documents[1].filename}`} first={documents[0]} second={documents[1]} matchingPlan={matchingPlan} objectContext={{ failedExisting: partial?.failures?.filter(f => f.side === "existing").length, failedOffer: partial?.failures?.filter(f => f.side === "offer").length }} traceContext={partial?.trace} traceGeneration={partial?.traceGeneration} isTraceCurrent={(candidate) => generation.current.current(candidate)} traceSignal={partial?.traceSignal} />
        )}
      </div>
    </main>
  );
}

function manualReady(manual: ManualAgreementInput): boolean {
  return Boolean(
    manual.company.trim() &&
    manual.products.length > 0 &&
    manual.products.every((product) => product.type.trim() && product.productName.trim())
  );
}

function AgreementInput({
  eyebrow, title, side, mode, onModeChange, files, onAdd, onRemove, manual, onManualChange,
}: {
  eyebrow: string;
  title: string;
  side: "existing" | "offer";
  mode: "pdf" | "manual";
  onModeChange: (mode: "pdf" | "manual") => void;
  files: File[];
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  manual: ManualAgreementInput;
  onManualChange: Dispatch<SetStateAction<ManualAgreementInput>>;
}) {
  return (
    <section className={`rounded-2xl border p-4 sm:p-5 ${side === "existing" ? "comparison-side-existing" : "comparison-side-offer"}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${side === "existing" ? "existing-label" : "offer-label"}`}>{eyebrow}</p>
      <h3 className="section-title mt-1 font-semibold">{title}</h3>
      <div className="mode-switch mt-4 grid grid-cols-2 rounded-xl p-1 ring-1" role="group" aria-label={`Registreringsmåte for ${eyebrow.toLowerCase()}`}>
        {(["pdf", "manual"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => onModeChange(option)}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium ${mode === option ? "mode-button-active" : "mode-button"}`}
          >
            {option === "pdf" ? "Last opp dokument" : "Registrer manuelt"}
          </button>
        ))}
      </div>
      {mode === "pdf" ? (
        <PdfFiles files={files} onAdd={onAdd} onRemove={onRemove} />
      ) : (
        <ManualEditor side={side} value={manual} onChange={onManualChange} />
      )}
    </section>
  );
}

function PdfFiles({ files, onAdd, onRemove }: {
  files: File[];
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <h4 className="mt-5 text-sm font-semibold text-slate-900">Last opp forsikringsdokument</h4>
      <p className="mt-1 text-sm text-slate-600">PDF med forsikringsbevis eller tilbud. Du kan legge til flere filer fra samme avtale.</p>
      <p className="info-panel mt-2 rounded-lg px-3 py-2.5 text-xs leading-5">
        <span className="font-semibold text-slate-900">Pilot:</span> Dokumentene analyseres for å sammenligne forsikringene dine. PDF-en sendes til vår server for tekstuttrekk. Relevant, maskert tekst sendes til OpenAI; selve PDF-filen sendes ikke dit. Appen har ingen database som lagrer dokumentet eller resultatet. OpenAI kan beholde sikkerhetslogger etter API-avtalen. Ikke last opp mer informasjon enn nødvendig, og kontroller viktige opplysninger mot originaldokumentet.
      </p>
      <p className="mt-2 text-xs text-slate-500">{files.length}/10 PDF-er. Maks 10 PDF-er per side, 10 MiB per fil og 25 MiB samlet.</p>
      <div
        className="drop-zone mt-3 rounded-xl border-2 border-dashed text-center transition-colors"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); onAdd(event.dataTransfer.files); }}
      >
        <label className="block cursor-pointer p-6 text-sm font-semibold text-slate-800">
          Dra PDF-er hit eller velg filer
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="sr-only"
            onChange={(event) => {
              onAdd(event.target.files);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
        </label>
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">{files.length} PDF{files.length === 1 ? "" : "-er"} lagt til</p>
          <ul className="mt-2 space-y-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-gray-100 px-3 py-2 text-sm">
                <span className="min-w-0 truncate text-gray-800" title={file.name}>{file.name}<span className="ml-2 text-xs text-gray-500">{formatFileSize(file.size)}</span></span>
                <button type="button" onClick={() => onRemove(index)} aria-label={`Fjern ${file.name}`} className="shrink-0 rounded-md px-2 py-1 font-medium text-gray-600 hover:bg-white hover:text-black">Fjern</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} MB`;
}

function ManualEditor({ side, value, onChange }: {
  side: "existing" | "offer";
  value: ManualAgreementInput;
  onChange: Dispatch<SetStateAction<ManualAgreementInput>>;
}) {
  function changeProduct(index: number, patch: Partial<ManualProductInput>) {
    onChange((currentAgreement) => ({
      ...currentAgreement,
      products: currentAgreement.products.map((product, current) =>
        current === index ? { ...product, ...patch } : product
      ),
    }));
  }
  function changeProductFromCurrent(
    index: number,
    update: (product: ManualProductInput) => Partial<ManualProductInput>,
  ) {
    onChange((currentAgreement) => ({
      ...currentAgreement,
      products: currentAgreement.products.map((product, current) =>
        current === index ? { ...product, ...update(product) } : product
      ),
    }));
  }
  function selectionReference(company: string, type: string, name: string) {
    const selected = findCatalogProductBySelection(company, type, name);
    return selected
      ? { providerId: selected.providerId, productId: selected.productId, version: selected.version }
      : null;
  }
  function selectionPatch(product: ManualProductInput, company: string, type: string, name: string) {
    const catalogReference = selectionReference(company, type, name);
    const sameProduct = Boolean(catalogReference && product.catalogReference &&
      catalogReference.providerId === product.catalogReference.providerId &&
      catalogReference.productId === product.catalogReference.productId &&
      catalogReference.version === product.catalogReference.version);
    return { catalogReference, addOnIds: sameProduct ? product.addOnIds ?? [] : [] };
  }

  return (
    <div className="mt-4 space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Selskap
        <input
          list={`companies-${side}`}
          value={value.company}
          onChange={(event) => {
            const company = event.target.value;
            onChange((currentAgreement) => ({
              ...currentAgreement,
              company,
              products: currentAgreement.products.map((product) => {
                if (!company) {
                  return { ...product, type: "", productName: "", catalogReference: null, addOnIds: [] };
                }
                const suggestions = productSuggestions(productCatalog, company, product.type);
                const productName = product.productName || (suggestions.length === 1 ? suggestions[0] : "");
                return { ...product, productName, ...selectionPatch(product, company, product.type, productName) };
              }),
            }));
          }}
          placeholder="Velg eller skriv selskap"
          className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none"
        />
      </label>
      <datalist id={`companies-${side}`}>
        {productCatalog.companies.map((company) => <option key={company} value={company} />)}
      </datalist>
      {value.company === "Fremtind" && <label className="block text-sm font-medium text-gray-700">
        Distribusjonskanal <span className="font-normal text-gray-500">(valgfritt)</span>
        <select value={value.distributionChannel ?? ""} onChange={(event) => onChange((current) => ({
          ...current, distributionChannel: event.target.value,
          products: current.products.map((product) => ({ ...product, addOnIds: [] })),
        }))} className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none">
          <option value="">Ukjent</option><option>SpareBank 1</option><option>DNB</option><option>Eika</option>
        </select>
      </label>}
      <datalist id={`insurance-types-${side}`}>
        {pilotInsuranceTypes.map((type) => (
          <option key={type} value={type} />
        ))}
      </datalist>
      {value.products.map((product, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{product.type && product.productName ? `${product.type} · ${product.productName}` : `Forsikring ${index + 1}`}</h4>
              <p className="mt-0.5 text-xs text-gray-500">{value.company || "Velg forsikringsselskap"}{product.annualPremium ? ` · ${product.annualPremium} per år` : " · pris er valgfri"}</p>
            </div>
            {value.products.length > 1 && (
              <button type="button" onClick={() => onChange((currentAgreement) => ({
                ...currentAgreement,
                products: currentAgreement.products.filter((_, current) => current !== index),
              }))} className="text-xs font-medium text-gray-500 hover:text-black">Fjern</button>
            )}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Forsikringstype
              <input
                list={`insurance-types-${side}`}
                value={product.type}
                disabled={!value.company.trim()}
                onChange={(event) => {
                  const type = event.target.value;
                  const suggestions = productSuggestions(productCatalog, value.company, type);
                  const productName = suggestions.length === 1 ? suggestions[0] : product.productName;
                  changeProduct(index, { type, productName, ...selectionPatch(product, value.company, type, productName) });
                }}
                placeholder="Velg eller skriv type"
                className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none disabled:cursor-not-allowed"
              />
              {!value.company.trim() && <span className="mt-1 block text-xs font-normal text-gray-500">Velg selskap først.</span>}
            </label>
            <label className="text-sm font-medium text-gray-700">
              Produkt/variant
              <input
                list={`products-${side}-${index}`}
                value={product.productName}
                disabled={!value.company.trim() || !product.type.trim()}
                onChange={(event) => {
                  const name = event.target.value;
                  changeProduct(index, {
                    productName: name,
                    ...selectionPatch(product, value.company, product.type, name),
                  });
                }}
                placeholder="Velg eller skriv produkt"
                className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none disabled:cursor-not-allowed"
              />
              <datalist id={`products-${side}-${index}`}>
                {productSuggestions(productCatalog, value.company, product.type).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {value.company.trim() && product.type.trim() && (
                productSuggestions(productCatalog, value.company, product.type).length > 0
                  ? <span className="status-text mt-1 block text-xs font-normal">Velg blant tilgjengelige katalogprodukter, eller skriv et annet produkt.</span>
                  : <span className="mt-1 block text-xs font-normal text-gray-500">Skriv produktnavnet fra avtalen.</span>
              )}
              {product.productName.trim() && !product.catalogReference && (
                <span role="status" className="mt-2 block rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-normal leading-5 text-amber-900">
                  Produktet er ikke koblet til vilkårskatalogen. Dekningssammenligningen kan derfor være ufullstendig.
                </span>
              )}
            </label>
            {product.productName.trim() && <>
              <label className="text-sm font-medium text-gray-700">
                Egenandel <span className="font-normal text-gray-500">(valgfritt)</span>
                <input
                  value={product.deductible}
                  onChange={(event) => changeProduct(index, { deductible: event.target.value })}
                  placeholder="F.eks. 4 000 kr"
                  className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Årspris <span className="font-normal text-gray-500">(valgfritt)</span>
                <input
                  value={product.annualPremium}
                  onChange={(event) => changeProduct(index, { annualPremium: event.target.value })}
                  placeholder="F.eks. 5 000 kr"
                  className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none"
                />
              </label>
            </>}
          </div>
          {product.catalogReference && (() => {
            const selected = findCatalogProduct(
              product.catalogReference.providerId,
              product.catalogReference.productId,
              product.catalogReference.version,
            );
            if (!selected) return null;
            return (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <p className="text-sm font-medium text-gray-700">Tilleggsdekninger</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {availableAddOns(selected, new Date(), value.distributionChannel || null).map((addOn) => {
                    const checked = (product.addOnIds ?? []).includes(addOn.id);
                    return (
                      <label key={addOn.id} className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => changeProductFromCurrent(index, (currentProduct) => ({
                            addOnIds: event.target.checked
                              ? [...(currentProduct.addOnIds ?? []).filter((id) =>
                                !addOn.exclusiveGroup || availableAddOns(selected, new Date(), value.distributionChannel || null).find((option) => option.id === id)?.exclusiveGroup !== addOn.exclusiveGroup
                              ), addOn.id]
                              : (currentProduct.addOnIds ?? []).filter((id) => id !== addOn.id),
                          }))}
                          className="mt-1"
                        />
                        <span>{addOn.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">Velg alle tillegg som står i avtalen. Vilkår hentes fra katalogen; kundens faktiske dekning må kontrolleres i forsikringsbeviset.</p>
              </div>
            );
          })()}
        </div>
      ))}
      <button type="button" onClick={() => onChange((currentAgreement) => ({
        ...currentAgreement,
        products: [...currentAgreement.products, emptyManualProduct()],
      }))} className="secondary-button rounded-lg border px-3 py-2 text-sm font-semibold">+ Legg til forsikring</button>
      <p className="text-xs text-gray-500">Katalogprodukter henter dokumenterte vilkår automatisk. For andre produkter sammenlignes bare opplysninger som er tilgjengelige.</p>
    </div>
  );
}

function Comparison({
  first,
  second,
  matchingPlan,
  objectContext,
  traceContext,
  traceGeneration,
  isTraceCurrent,
  traceSignal,
}: {
  first: DocumentResult;
  second: DocumentResult;
  matchingPlan: MatchingPlan | null;
  objectContext?: ObjectComparisonContext;
  traceContext?: ClientTraceContext;
  traceGeneration?: number;
  isTraceCurrent?: (candidate: number) => boolean;
  traceSignal?: AbortSignal;
}) {
  const { groups, differences, rawDifferences } = useMemo(() => {
    const { groups, rawDifferences } = measureComparisonWork("comparison", () => {
      const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, matchingPlan, objectContext);
      return { groups, rawDifferences: createDifferences(first, second, groups, matchingPlan) };
    });
    const differences = measureComparisonWork("presentation", () =>
      presentImportantDifferences(rawDifferences, groups, matchingPlan));
    return { groups, differences, rawDifferences };
  }, [first, second, matchingPlan, objectContext]);
  const { portfolioPrices, priceInputs } = useMemo(() => {
    const priceInputs: { objectIndex: number; input: PortfolioPriceInput }[][] = [[], []];
    const portfolioPrices = [first, second].map((document, side) => portfolioPrice(document,
      side === 0 ? objectContext?.failedExisting : objectContext?.failedOffer,
      traceContext ? (objectIndex, input) => { priceInputs[side].push({ objectIndex, input }); } : undefined));
    return { portfolioPrices, priceInputs };
  }, [first, second, objectContext, traceContext]);
  const priceBranches = useMemo(() => [first, second].map((document, index) =>
    portfolioPrices[index].compatible && (document.insuranceData.insurances.length > 1 || portfolioPrices[index].conflict || portfolioPrices[index].failedDocuments > 0)
      ? "portfolio" as const
      : document.insuranceData.insurances.length === 1 && vehiclePrices(document.insuranceData.insurances[0])?.some((field) => field.value)
        ? "vehicle" as const : "legacy" as const), [first, second, portfolioPrices]);
  const [selectedType, setSelectedType] = useState("overview");
  const visibleGroups = useMemo(() => selectedType === "overview" ? groups : groups.filter((group) => group.label === selectedType), [groups, selectedType]);
  const detailRows = useMemo(() => visibleGroups.map(group => ({
    group,
    terms: group.objectMatch && group.objectMatch.status !== "matched" ? [] :
      sortDetailedTerms(groupTerms(group, matchingPlan)).filter((term) => !(isMotorVehicleType(group.key) && isVehiclePriceKey(term.key))),
  })), [visibleGroups, matchingPlan]);
  const tracedResponse = useRef<string | null>(null);
  useEffect(() => {
    if (!traceContext || traceGeneration === undefined || !isTraceCurrent?.(traceGeneration) || traceSignal?.aborted || tracedResponse.current === traceContext.traceId) return;
    tracedResponse.current = traceContext.traceId;
    try {
      // Project only structural diagnostics from the actual rendered pipeline. No raw result is sent.
      const events = clientTraceEvents({ documents: [first, second], groups, differences: rawDifferences, presentedDifferences: differences, details: detailRows, portfolioPrices, priceInputs, priceBranches, context: traceContext });
      if (!events.length || !isTraceCurrent(traceGeneration) || traceSignal?.aborted) return;
      const controller = new AbortController();
      const abort = () => controller.abort();
      traceSignal?.addEventListener("abort", abort, { once: true });
      const timeout = setTimeout(abort, 5_000);
      void fetch("/api/analysis-trace", {
        method: "POST", cache: "no-store", credentials: "same-origin", signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traceId: traceContext.traceId, ticket: traceContext.ticket, events }),
      }).catch(() => undefined).finally(() => {
        clearTimeout(timeout);
        traceSignal?.removeEventListener("abort", abort);
      });
    } catch { /* Diagnostics must never change or block the result view. */ }
  }, [first, second, groups, rawDifferences, differences, detailRows, portfolioPrices, priceInputs, priceBranches, traceContext, traceGeneration, isTraceCurrent, traceSignal]);
  const safeObjectSet = groups.length > 0 && groups.every(group => group.objectMatch?.status === "matched") && !objectContext?.failedExisting && !objectContext?.failedOffer;
  const totalDifference = portfolioPrices.every(price => price.compatible)
    ? portfolioPriceDifference(portfolioPrices[0], portfolioPrices[1], groups)
    : safeObjectSet ? differences.find((difference) => difference.type === "price" && !difference.insuranceKey)?.text : null;
  const productPriceDifferences = differences.filter((difference) => difference.type === "price" && difference.insuranceKey);
  const highlightedDifferences = differences
    .filter((difference) => difference.insuranceKey && difference.type !== "price");
  const typeOrder = ["Bil", "Hus", "Innbo", "Reise"];
  const availableTypes = [...new Set([...typeOrder.filter((type) => groups.some((group) => group.label === type)), ...groups.map((group) => group.label)])];
  const previewLimit = selectedType === "overview" ? 3 : 5;
  const visibleGroupsWithDifferences = visibleGroups.map((group) => ({
    group,
    differences: highlightedDifferences.filter((difference) => difference.kind !== "object" && difference.insuranceKey === group.key && difference.objectScope === group.scopeId).slice(0, previewLimit),
  })).filter(({ differences }) => differences.length > 0);
  const tabs = ["overview", ...availableTypes];

  function moveTabFocus(event: KeyboardEvent<HTMLButtonElement>, tab: string) {
    const currentIndex = tabs.indexOf(tab);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setSelectedType(nextTab);
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>(`[data-result-tab="${nextTab}"]`)
      ?.focus();
  }

  return (
    <section className="surface-card mt-10 overflow-hidden rounded-2xl border" aria-labelledby="comparison-result-heading">
      <div className="px-4 pt-5 sm:px-7 sm:pt-7">
        <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.14em]">Resultat</p>
        <h2 id="comparison-result-heading" className="section-title mt-1 text-2xl font-semibold tracking-tight">Sammenligning</h2>
      </div>

      <nav aria-label="Resultat per forsikringstype" className="mt-5 border-b border-slate-200 px-2 sm:px-5">
        <div role="tablist" aria-label="Velg resultatvisning" className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = selectedType === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`result-tab-${tab}`}
                data-result-tab={tab}
                aria-controls="result-tabpanel"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelectedType(tab)}
                onKeyDown={(event) => moveTabFocus(event, tab)}
                className={`result-tab relative shrink-0 px-3 py-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full ${active ? "result-tab-active" : "after:bg-transparent"}`}
              >
                {tab === "overview" ? "Oversikt" : tab}
              </button>
            );
          })}
        </div>
      </nav>

      <div
        id="result-tabpanel"
        role="tabpanel"
        aria-labelledby={`result-tab-${selectedType}`}
        className="px-4 py-6 sm:px-7 sm:py-8"
      >
        {selectedType === "overview" && (
          <section aria-labelledby="overview-heading" className="border-b border-slate-200 pb-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Sammenligning</p>
                <h3 id="overview-heading" className="mt-1 text-xl font-semibold text-slate-950">Avtalene side ved side</h3>
              </div>
              {totalDifference && <p className="status-text text-sm font-medium">{totalDifference}</p>}
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-0">
              {[first, second].map((document, index) => (
                <div key={index} className={`${index === 0 ? "overview-side-existing" : "overview-side-offer"} rounded-xl px-4 py-4 sm:px-5`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${index === 0 ? "existing-label" : "offer-label"}`}>{index === 0 ? "Eksisterende" : "Nytt tilbud"}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{agreementProviderDisplayName(document.insuranceData) || `Tilbud ${index + 1}`}</p>
                  {priceBranches[index] === "portfolio" ? <PortfolioPriceList price={portfolioPrices[index]} /> : priceBranches[index] === "vehicle" ? <VehiclePriceList insurance={document.insuranceData.insurances[0]} /> : <>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">Total årspris</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
                    {annualPremiumLabel(document.insuranceData)}
                    {document.insuranceData.totalAnnualPremium !== null && <span className="ml-1 text-sm font-normal text-slate-500">/ år</span>}
                  </p></>}
                </div>
              ))}
            </div>
            {(productPriceDifferences.length > 0 || groups.some(group => [...group.first, ...group.second].some(insurance => vehiclePrices(insurance)?.some(field => field.value)))) && (
              <details className="group mt-5 border-t border-slate-100 pt-4 text-sm">
                <summary className="text-link w-fit cursor-pointer list-none font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">Vis pris per forsikring</span>
                  <span className="hidden group-open:inline">Skjul pris per forsikring</span>
                </summary>
                <ul className="mt-3 space-y-1.5 text-slate-700">
                  {groups.some(group => [...group.first, ...group.second].some(insurance => vehiclePrices(insurance)?.some(field => field.value))) && groups.filter(group => [...group.first, ...group.second].some(insurance => vehiclePrices(insurance)?.some(field => field.value))).map(group => <li key={group.scopeId} className="py-3">
                    <p className="font-semibold">{group.objectLabel || group.label} – pris per år</p>
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">{(["first", "second"] as const).map(side => <div key={side} className="min-w-0">
                      <p>{side === "first" ? "Eksisterende" : "Nytt tilbud"}</p>
                      {group[side].map((insurance, index) => <VehiclePriceList key={index} insurance={insurance} />)}
                    </div>)}</div>
                    {group.first.length === 1 && group.second.length === 1 && differentVehiclePriceBasis(group.first[0], group.second[0]) && <p className="mt-3 text-sm text-slate-600">Kan ikke sammenlignes direkte – dokumentene oppgir ulikt eller uavklart prisgrunnlag.</p>}
                  </li>)}
                  {productPriceDifferences.map((difference) => (
                    <li key={`${difference.objectScope}:${difference.insuranceKey}:${difference.title}`}><span className="font-medium text-slate-900">{groups.find((group) => group.key === difference.insuranceKey && group.scopeId === difference.objectScope)?.objectLabel} · {difference.title}:</span> {difference.text}</li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        )}

        <section aria-labelledby="important-differences-heading" className={selectedType === "overview" ? "pt-7" : ""}>
          {selectedType !== "overview" && (
            <div className="mb-7 border-b border-slate-200 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Forsikringstype</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{selectedType}</h3>
            </div>
          )}
          <div className="max-w-3xl">
            <h3 id="important-differences-heading" className="text-xl font-semibold tracking-tight text-slate-950">Viktigste forskjeller</h3>
            <p className="mt-1 text-sm text-slate-600">
              Åpne en forskjell for å se alle valgte underpunkter. Kilder finnes i detaljert sammenligning.
              {selectedType === "overview" && " Velg en typefane for flere forskjeller."}
            </p>
          </div>
          {visibleGroups.map(group => highlightedDifferences.filter(difference => difference.kind === "object" && difference.objectScope === group.scopeId).map(difference =>
            <section key={`warning:${group.scopeId}`} className="mt-4 border-y border-slate-200" aria-label={group.objectLabel || group.label}>
              <ConceptFamilyCard difference={difference} />
            </section>
          ))}
          {visibleGroups.filter((group) => group.objectMatch?.status === "matched" && group.first.length === 1 && group.second.length === 1 && vehiclePriceDifferences(group.first[0], group.second[0]).length > 0).map((group) => <section key={`prices:${group.scopeId || group.key}`} className="mt-5 rounded-xl border border-slate-200 p-4" aria-label={`${group.label} – prisgrunnlag`}>
            <h4 className="font-semibold text-slate-900">{group.objectLabel || group.label} – pris per år</h4>
            <div className="mt-3 grid gap-5 sm:grid-cols-2">{[group.first, group.second].map((insurances, side) => <div key={side}><p className="text-sm font-semibold">{side === 0 ? "Eksisterende" : "Nytt tilbud"}</p>{insurances.map((insurance, index) => <div key={index}>{insurances.length > 1 && <p className="mt-3 text-sm">{insurance.productName || group.label} · objekt {index + 1}</p>}<VehiclePriceList insurance={insurance} /></div>)}</div>)}</div>
            {group.first.length === 1 && group.second.length === 1 && differentVehiclePriceBasis(group.first[0], group.second[0]) && <p className="mt-3 text-sm text-slate-600">Kan ikke sammenlignes direkte – dokumentene oppgir ulikt eller uavklart prisgrunnlag.</p>}
            {productPriceDifferences.filter((difference) => difference.insuranceKey === group.key && difference.objectScope === group.scopeId).map((difference) => <p className="mt-2 text-sm text-slate-700" key={difference.title}><strong>{difference.title}:</strong> {difference.text}</p>)}
          </section>)}
          {visibleGroupsWithDifferences.length > 0 ? (
            <div className="mt-6 space-y-8">
              {visibleGroupsWithDifferences.map(({ group, differences: groupDifferences }) => (
                <section key={group.scopeId || group.key} aria-labelledby={`difference-group-${group.scopeId || group.key}`}>
                  <h4 id={`difference-group-${group.scopeId || group.key}`} className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{group.objectLabel || group.label}</h4>
                  <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
                    {groupDifferences.map((difference) => (
                      <ConceptFamilyCard key={difference.conceptId || difference.title} difference={difference} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              {visibleGroups.every(group => group.objectMatch && group.objectMatch.status !== "matched") ? "Åpne detaljvisningen for opplysninger om hvert objekt uten sikkert sammenligningspar." : visibleGroups.some((group) => [...group.first, ...group.second].some((insurance) =>
                insurance.coverageSummary || insurance.deductible || insurance.importantTerms.length
              )) ? "Ingen sikre forskjeller funnet i oppgitte dekninger og vilkår." : "Ingen deknings- eller vilkårsopplysninger er oppgitt for sammenligning."}
            </p>
          )}
        </section>

        <details className="group mt-8 border-t border-slate-200 pt-1">
          <summary className="text-link flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Vis detaljert sammenligning</span>
            <span className="hidden group-open:inline">Skjul detaljert sammenligning</span>
            <span aria-hidden="true" className="text-lg leading-none text-slate-400 group-open:rotate-180">⌄</span>
          </summary>
          <div className="border-t border-slate-100 pb-1">
            <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="sticky left-0 z-10 border-b border-gray-200 bg-white p-3 text-left text-gray-500">Dekning</th>
                    <th className="overview-side-existing border-b border-gray-200 p-3 text-left">
                      <p className="text-xs font-normal text-gray-500">Eksisterende</p>
                      <p className="font-semibold text-gray-900">{agreementProviderDisplayName(first.insuranceData) || "Tilbud 1"}</p>
                      <p className="mt-0.5 text-xs font-normal text-gray-500">{first.filename}</p>
                    </th>
                    <th className="overview-side-offer border-b border-gray-200 p-3 text-left">
                      <p className="text-xs font-normal text-gray-500">Nytt tilbud</p>
                      <p className="font-semibold text-gray-900">{agreementProviderDisplayName(second.insuranceData) || "Tilbud 2"}</p>
                      <p className="mt-0.5 text-xs font-normal text-gray-500">{second.filename}</p>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow
                    label="Total årspremie"
                    first={annualPremiumLabel(first.insuranceData)}
                    second={annualPremiumLabel(second.insuranceData)}
                    missingLabel="Pris ikke oppgitt"
                  />
                  {visibleGroups.map((group) => (
                    <InsuranceRows key={group.scopeId || group.key} group={group} terms={detailRows.find(entry => entry.group === group)!.terms} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}

const heroFactOrder: Partial<Record<string, readonly RegExp[]>> = {
  "bil.maskinskade": [/\.alder$/u, /\.km$/u, /(?:^|\.)egenandel(?:\.|$)/u, /\.(?:dekning|drivverk|el|fossil|komfort|ekstra)$/u, /\.(?:begrensning|unntak)$/u],
  "bil.totalskade": [/\.alder$/u, /\.km$/u, /\.skadegrad$/u, /\.(?:oppgjor|tyveri|dekning)$/u, /\.(?:begrensning|unntak)$/u],
  "bil.mobilitet": [/^leiebil\.dager$/u, /^leiebil\.(?:bilklasse|kontant|dagsgrense)$/u, /^leiebil\.(?:dekning|kostnader|verksted)$/u, /^veihjelp\.dekning$/u, /^veihjelp\./u],
  "bil.egen-bil": [/\.(?:dekning|garanti|oppgjor)$/u, /(?:^|\.)(?:grense|sum)(?:\.|$)/u, /(?:^|\.)egenandel(?:\.|$)/u, /\.(?:begrensning|unntak)$/u],
  "innbo.uhell": [/^uhell\.dekning$/u, /^uhell\.geografi$/u, /^uhell\.(?:grense|hjem\.grense)$/u, /^uhell\.egenandel$/u, /^uhell\.(?:begrensning|unntak)$/u],
  "innbo.forsikringssum": [/^innbo\.forsikringssum$/u, /(?:^|\.)(?:grense|sum)(?:\.|$)/u],
  "innbo.sykkel-verdi": [/(?:^|\.)(?:grense|sum)(?:\.|$)/u, /\.geografi$/u, /(?:^|\.)egenandel(?:\.|$)/u, /\.dekning$/u],
  "hus.vann-fukt": [/^hus\.vann\.utstromming$/u, /^hus\.ror\.(?:brudd|tining)$/u, /^hus\.vann(?:overflate)?\.(?:terreng|dekning)$/u, /^hus\.takvegg\.folgeskade$/u, /egenandel/u, /aldersfradrag/u],
  "hus.vatrom": [/^hus\.vatrom\.folgeskade$/u, /^hus\.vatrom\.selverommet$/u, /^hus\.vatrom\./u, /aldersfradrag/u],
  "hus.handverker": [/^hus\.handverker\.(?:folgeskade|dekning)$/u, /^hus\.handverker\./u],
  "hus.gjenoppforing": [/^hus\.gjenoppforing/u, /^hus\.(?:forsikringsform|forsikringssum)/u, /^hus\.(?:pabud|rydding|brukstap)/u],
  "reise.rammer": [/^reise\.varighet\.maks$/u, /^reise\.varighet\./u, /^reise\.omrade\./u, /^reise\.overnatting/u, /^reise\.(?:tjenestereise|personer)/u],
  "reise.avbestilling": [/^reise\.avbestilling\.dekning$/u, /^reise\.avbestilling\.(?:sum|grense)$/u, /^reise\.avbestilling\./u],
  "reise.bagasje": [/^reise\.bagasje\.total$/u, /^reise\.bagasje\.per_gjenstand$/u, /^reise\.bagasje\.(?:verdisaker|grense|sum)$/u, /^reise\.bagasje\.dekning$/u, /^reise\.bagasje\./u],
  "reise.sykdom-hjemtransport": [/^reise\.medisinsk\.(?:behandling|dekning)$/u, /^reise\.hjemtransport/u, /^reise\.(?:sykeledsagelse|hjemkallelse)/u, /^reise\.medisinsk\./u],
};

type DifferencePair = { first: string; second: string };
type CollapsedHero = { item: Difference; pair?: DifferencePair };

function differenceIdentity(item: Difference) {
  return (item.termKey || item.title).toLocaleLowerCase("nb-NO");
}

function orderedFamilyItems(conceptId: string | undefined, items: Difference[]) {
  const order = conceptId ? heroFactOrder[conceptId] : undefined;
  if (!order) return items;
  return items.map((item, index) => ({ item, index, identity: differenceIdentity(item) }))
    .sort((first, second) => {
      const firstOrder = order.findIndex((pattern) => pattern.test(first.identity));
      const secondOrder = order.findIndex((pattern) => pattern.test(second.identity));
      const firstPosition = firstOrder === -1 ? order.length : firstOrder;
      const secondPosition = secondOrder === -1 ? order.length : secondOrder;
      return firstPosition - secondPosition || first.index - second.index;
    })
    .map(({ item }) => item);
}

function splitDifferenceValues(text: string): DifferencePair | null {
  const marker = /(?:^|\.\s+|\s+mot\s+)(Nytt tilbud(?:\s+[^:]+)?):\s*/u.exec(text);
  if (!marker) {
    const existing = /^Eksisterende(?:\s+[^:]+)?:\s*(.+?)\.\s+(Tilsvarende dekning er ikke funnet.+)$/u.exec(text);
    return existing ? { first: existing[1], second: existing[2] || "Ikke dokumentert" } : null;
  }

  const first = text.slice(0, marker.index)
    .replace(/^Eksisterende(?:\s+[^:]+)?:\s*/u, "")
    .replace(/\.\s*$/u, "") || "Ikke dokumentert";
  return { first, second: text.slice(marker.index + marker[0].length) };
}

function compactPair(first: Difference, second: Difference): DifferencePair | undefined {
  const firstValues = splitDifferenceValues(first.text);
  const secondValues = splitDifferenceValues(second.text);
  if (!firstValues || !secondValues) return undefined;
  const values = [firstValues.first, firstValues.second, secondValues.first, secondValues.second];
  if (values.some((value) => value.includes("\n") || value.length > 90)) return undefined;
  const trimPeriod = (value: string) => value.replace(/\.\s*$/u, "");
  return {
    first: `${trimPeriod(firstValues.first)} / ${trimPeriod(secondValues.first)}`,
    second: `${trimPeriod(firstValues.second)} / ${trimPeriod(secondValues.second)}`,
  };
}

function collapsedHero(conceptId: string | undefined, items: Difference[]): CollapsedHero {
  const ordered = orderedFamilyItems(conceptId, items);
  const fallback = ordered[0] || items[0];
  if ((conceptId === "bil.maskinskade" || conceptId === "bil.totalskade") && items.length > 1) {
    const age = items.find((item) => item.termKey?.endsWith(".alder"));
    const distance = items.find((item) => item.termKey?.endsWith(".km"));
    if (age && distance) {
      const pair = compactPair(age, distance);
      if (pair) return { item: age, pair };
    }
  }
  return { item: fallback };
}

function humanDetailLabel(conceptId: string | undefined, item: Difference): string {
  const key = item.termKey || "";
  if (/\.alder$/u.test(key)) return "alder";
  if (/\.km$/u.test(key)) return "kilometer";
  if (/(?:^|\.)egenandel(?:\.|$)/u.test(key) || key.includes("_egenandel")) return "egenandel";

  if (conceptId === "bil.maskinskade" && /\.(?:dekning|drivverk|el|fossil|komfort|ekstra)$/u.test(key)) return "komponenter";
  if (conceptId === "bil.totalskade" && key.endsWith(".skadegrad")) return "skadegrad";
  if (conceptId === "bil.mobilitet") {
    if (key === "leiebil.dager") return "leiebildager";
    if (key === "leiebil.bilklasse") return "bilklasse";
    if (key === "leiebil.kontant") return "kontantkompensasjon";
    if (key.startsWith("veihjelp.")) return "veihjelp";
  }
  if (conceptId === "hus.vann-fukt") {
    if (/^hus\.(?:ror\.|vann\.utstromming)/u.test(key)) return "rør";
    if (/^hus\.vann(?:overflate)?\.terreng/u.test(key)) return "terreng/grunn";
    if (/^hus\.takvegg\./u.test(key)) return "tak og yttervegg";
    if (/aldersfradrag/u.test(key)) return "aldersfradrag";
  }
  if (conceptId === "hus.vatrom") {
    if (key === "hus.vatrom.folgeskade") return "følgeskade";
    if (key === "hus.vatrom.selverommet") return "selve våtrommet";
  }
  if (conceptId === "hus.handverker") {
    if (/\.folgeskade$/u.test(key)) return "følgeskade";
    if (/\.(?:feil|dekning)$/u.test(key)) return "selve feilen";
  }
  if (conceptId === "reise.rammer") {
    if (key.startsWith("reise.varighet.")) return "reisevarighet";
    if (key.startsWith("reise.omrade.")) return "geografi";
    if (key.startsWith("reise.overnatting")) return "overnatting";
  }
  if (conceptId === "reise.bagasje") {
    if (key === "reise.bagasje.total") return "forsikringssum";
    if (key === "reise.bagasje.per_gjenstand") return "enkeltgjenstand";
    if (key.includes("verdisaker")) return "verdisaker";
  }
  if (/\.geografi$/u.test(key) || key.includes(".omrade.")) return "geografi";
  if (/(?:^|\.)(?:grense|sum)(?:\.|$)/u.test(key)) return "beløpsgrense";
  if (/\.(?:begrensning|unntak)$/u.test(key)) return "begrensninger";
  if (/\.(?:dekning|folgeskade|selverommet|brudd|utstromming)$/u.test(key)) return "dekning";

  const titleParts = item.title.split(/\s+[–-]\s+/u);
  return (titleParts.length > 1 ? titleParts.at(-1) : item.title)?.trim().toLocaleLowerCase("nb-NO") || "forskjell";
}

function sentenceCase(value: string) {
  return value ? value[0].toLocaleUpperCase("nb-NO") + value.slice(1) : value;
}

function ConceptFamilyCard({ difference }: { difference: PresentedDifference }) {
  if (difference.kind === "object") return <div className="py-5 sm:px-1" role="note">
    <h5 className="font-semibold text-slate-950">{difference.title}</h5>
    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{difference.text}</p>
  </div>;
  if (difference.details) {
    const model = difference.details;
    const pairKeys = ["nyverdi.alder", "nyverdi.km"];
    const rows = model.compact.filter(row => !difference.limitPair || !pairKeys.includes(row.key));
    // The composed age/km value has two fact identities, each with its own evidence.
    const components = difference.limitPair ? model.compact.filter(row => pairKeys.includes(row.key)) : [];
    const detailRows = [...components, ...model.additional];
    const renderRow = (row: typeof model.compact[number]) => <div key={row.key} className="min-w-0 py-3">
      <p className="text-sm font-semibold text-slate-800">{row.label}</p>
      <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-2">
        {(["first", "second"] as const).map(side => <div key={side} className={`${side === "first" ? "difference-side-existing" : "difference-side-offer"} min-w-0 rounded-lg px-4 py-3`}>
          <p className={`${side === "first" ? "existing-label" : "offer-label"} text-xs font-semibold uppercase tracking-wide`}>{side === "first" ? "Eksisterende" : "Nytt tilbud"}</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{row[side]}</p>
          {row[`${side}Description`] && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{row[`${side}Description`]}</p>}
          {model.sources.filter(item => item.side === side && item.key === row.key.replace(/:status$/u, "")).map(item =>
            <SourceDetails key={JSON.stringify([item.source.documentId, item.source.filename, item.source.page, item.source.section, item.source.documentRole])}
              source={item.source} origin={item.origin} baseLabel={`${side === "first" ? "Eksisterende" : "Nytt tilbud"} – ${item.label}: ${item.value}`} />)}
        </div>)}
      </div>
    </div>;
    return <div className="min-w-0 py-5 sm:px-1">
      <h5 className="text-base font-semibold text-slate-950">{difference.title}</h5>
      {difference.limitPair && <DifferenceValues text="" pair={difference.limitPair} compact unclamped />}
      {rows.map(renderRow)}
      {detailRows.length > 0 && <details className="group mt-2">
        <summary aria-label={`Se detaljer: ${difference.title}`} className="text-link w-fit cursor-pointer rounded text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">
          <span className="group-open:hidden">Se detaljer</span><span className="hidden group-open:inline">Skjul</span>
        </summary>
        <div className="mt-3 divide-y divide-slate-100 border-t border-slate-100">{detailRows.map(renderRow)}</div>
      </details>}
      <PresentationSources difference={difference} />
    </div>;
  }

  const items = difference.items || [difference];
  if (items.length === 1) return <div className="min-w-0 py-5 sm:px-1">
    <h5 className="text-base font-semibold text-slate-950">{difference.title}</h5>
    <PresentationTypeLabel type={difference.presentationType} />
    <DifferenceValues text={items[0].text} pair={difference.limitPair} />
    <PresentationSources difference={difference} />
  </div>;
  const orderedItems = orderedFamilyItems(difference.conceptId, items);
  const hero = collapsedHero(difference.conceptId, items);
  const itemLabels = [...new Set(orderedItems
    .filter((item) => item.termKey || item.title !== difference.title)
    .map((item) => humanDetailLabel(difference.conceptId, item)))];
  const detailLabel = itemLabels.length
    ? sentenceCase(`${itemLabels.slice(0, 4).join(" · ")}${itemLabels.length > 4 ? ` + ${itemLabels.length - 4}` : ""}`)
    : `${items.length} dokumentert ${items.length === 1 ? "forskjell" : "forskjeller"}`;

  return (
    <details className="group">
      <summary className="cursor-pointer list-none py-5 marker:hidden sm:px-1 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h5 className="text-base font-semibold text-slate-950">{difference.title}</h5>
              <PresentationTypeLabel type={difference.presentationType} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{detailLabel}</p>
          </div>
          <span className="text-link shrink-0 pt-0.5 text-sm font-semibold">
            <span className="group-open:hidden">Se detaljer</span>
            <span className="hidden group-open:inline">Skjul</span>
          </span>
        </div>
        <div className="mt-4 group-open:hidden">
          <DifferenceValues text={hero.item.text} compact unclamped={Boolean(difference.limitPair)} pair={difference.limitPair ?? hero.pair} />
        </div>
      </summary>
      <div className="border-t border-slate-100 pb-6 pt-1 sm:px-1">
        <div className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <div key={`${item.termKey || item.title}-${index}`} className="py-4">
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <DifferenceValues text={item.text} />
            </div>
          ))}
        </div>
        <PresentationSources difference={difference} />
      </div>
    </details>
  );
}

function PresentationTypeLabel({ type }: { type: PresentedDifference["presentationType"] }) {
  if (type !== "service" && type !== "conditional-benefit") return null;
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
      {type === "service" ? "Tjeneste" : "Betinget fordel"}
    </span>
  );
}

function PresentationSources({ difference }: { difference: PresentedDifference }) {
  if (!difference.presentationSource && !(difference.presentationSources?.length)) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4">
      {difference.presentationSource && (
        <a href={difference.presentationSource.url} target="_blank" rel="noreferrer" className="text-link text-xs font-semibold underline underline-offset-2">
          {difference.presentationSource.label}
        </a>
      )}
      {difference.presentationSources?.map((source) => (
        <a
          key={`${source.side}-${source.providerId}-${source.url}`}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="text-link text-xs font-semibold underline underline-offset-2"
          title={`Kontrollert ${source.checkedAt}`}
        >
          {source.label}
        </a>
      ))}
    </div>
  );
}

function ComparisonRow({
  label,
  first,
  second,
  missingLabel = "Ikke oppgitt",
  firstMissingLabel,
  secondMissingLabel,
  firstSources = [],
  secondSources = [],
  firstBaseFacts = [],
  secondBaseFacts = [],
  firstSourceOrigins = [],
  secondSourceOrigins = [],
  firstCoverage = null,
  secondCoverage = null,
}: {
  label: string;
  first: string | null;
  second: string | null;
  missingLabel?: string;
  firstMissingLabel?: string;
  secondMissingLabel?: string;
  firstSources?: FactSource[];
  secondSources?: FactSource[];
  firstSourceOrigins?: { source: FactSource; origin: "document" | "catalog" }[];
  secondSourceOrigins?: { source: FactSource; origin: "document" | "catalog" }[];
  firstBaseFacts?: BaseFact[];
  secondBaseFacts?: BaseFact[];
  firstCoverage?: CanonicalCoverage | null;
  secondCoverage?: CanonicalCoverage | null;
}) {
  const sourceOrigin = (source: FactSource, origins: typeof firstSourceOrigins, coverage: CanonicalCoverage | null) => {
    const identity = (item: FactSource) => JSON.stringify([item.documentId, item.filename, item.page, item.section, item.documentRole]);
    const matches = [...origins, ...(coverage?.evidence.flatMap(item => item.sources.map(source => ({ source, origin: item.origin }))) ?? [])]
      .filter(item => identity(item.source) === identity(source));
    const unique = [...new Set(matches.map(item => item.origin))];
    return unique.length === 1 ? unique[0] : undefined;
  };
  const firstDisplay = firstCoverage
    ? coverageStatusLabel(firstCoverage.status, firstCoverage.summary)
    : first || firstMissingLabel || missingLabel;
  const secondDisplay = secondCoverage
    ? coverageStatusLabel(secondCoverage.status, secondCoverage.summary)
    : second || secondMissingLabel || missingLabel;
  const different = firstDisplay.trim().toLocaleLowerCase("nb-NO") !== secondDisplay.trim().toLocaleLowerCase("nb-NO");

  return (
    <tr className={different ? "bg-amber-50/60" : ""}>
      <td className={`sticky left-0 border-b border-gray-100 p-3 font-medium text-gray-700 ${different ? "bg-amber-50" : "bg-white"}`}>
        {label}
      </td>

      <td className="overview-side-existing border-b border-gray-100 p-3 text-gray-900">
        {firstDisplay}
        {firstSources.map((source) => <SourceDetails key={`${source.documentId}-${source.section}-${source.page}`} source={source} origin={sourceOrigin(source, firstSourceOrigins, firstCoverage)} />)}
        {firstBaseFacts.map((base) => <SourceDetails key={`${base.source.documentId}-${base.source.section}-${base.source.page}`} source={base.source} baseLabel={`Grunnverdi på eksisterende avtale: ${base.value}`} />)}
      </td>

      <td className="overview-side-offer border-b border-gray-100 p-3 text-gray-900">
        {secondDisplay}
        {secondSources.map((source) => <SourceDetails key={`${source.documentId}-${source.section}-${source.page}`} source={source} origin={sourceOrigin(source, secondSourceOrigins, secondCoverage)} />)}
        {secondBaseFacts.map((base) => <SourceDetails key={`${base.source.documentId}-${base.source.section}-${base.source.page}`} source={base.source} baseLabel={`Grunnverdi på nytt tilbud: ${base.value}`} />)}
      </td>
    </tr>
  );
}

function DifferenceValues({ text, compact = false, unclamped = false, pair }: { text: string; compact?: boolean; unclamped?: boolean; pair?: DifferencePair }) {
  const values = pair || splitDifferenceValues(text);
  if (!values) return <p className={compact ? "line-clamp-2 text-base font-semibold leading-6 text-slate-900" : "mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700"}>{text}</p>;

  return (
    <div className={compact ? "grid gap-2 sm:grid-cols-2" : "mt-2 grid gap-2 sm:grid-cols-2"}>
      <div className={`difference-side-existing rounded-lg ${compact ? "px-4 py-3" : "px-4 py-4"}`}>
        <p className="existing-label text-xs font-semibold uppercase tracking-wide">Eksisterende</p>
        <p className={`${compact ? `${unclamped ? "" : "line-clamp-2 "}text-base font-semibold leading-6 text-slate-950` : "text-sm leading-6 text-slate-800"} mt-1 whitespace-pre-wrap break-words`}>{values.first}</p>
      </div>
      <div className={`difference-side-offer rounded-lg ${compact ? "px-4 py-3" : "px-4 py-4"}`}>
        <p className="offer-label text-xs font-semibold uppercase tracking-wide">Nytt tilbud</p>
        <p className={`${compact ? `${unclamped ? "" : "line-clamp-2 "}text-base font-semibold leading-6 text-slate-950` : "text-sm leading-6 text-slate-800"} mt-1 whitespace-pre-wrap break-words`}>{values.second}</p>
      </div>
    </div>
  );
}

function SourceDetails({ source, baseLabel, origin }: { source: FactSource; baseLabel?: string; origin?: "document" | "catalog" }) {
  return (
    <details className="mt-2 text-xs text-slate-600">
      <summary aria-label={baseLabel ? `Vis kilde: ${baseLabel}` : undefined} className="text-link w-fit cursor-pointer rounded font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4">Vis kilde{origin && <span className="font-normal"> · {origin === "document" ? "kundedokument" : "offentlig vilkår"}</span>}</summary>
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 leading-5">
        {baseLabel && <p className="font-medium text-slate-700">{baseLabel}</p>}
        {source.note && <p>{source.note}</p>}
        <p>{[source.company, source.termsNumber !== "Ikke oppgitt" ? source.termsNumber : null, source.effectiveFrom, source.page > 0 ? `side ${source.page}` : null, `punkt ${source.section}`].filter(Boolean).join(" · ")}</p>
        <p className="break-words text-slate-500">Dokument: {source.filename}</p>
        {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-link font-medium underline">Åpne originalkilde</a>}
      </div>
    </details>
  );
}

function InsuranceRows({ group, terms }: { group: InsuranceGroup; terms: TermGroup[] }) {
  if (group.objectMatch && group.objectMatch.status !== "matched") return <tr><td colSpan={3} className="border-y border-slate-200 p-4">
    <h4 className="font-semibold">{group.objectLabel || group.label}</h4>
    <p className="mt-2 text-sm">{objectWarning(group.objectMatch, group.objectContext)}</p>
    {[group.first, group.second].map((items, side) => items.length > 0 && <div key={side} className="mt-4">
      <p className="text-sm font-semibold">{side === 0 ? "Eksisterende" : "Nytt tilbud"} · objekter uten sammenligningspar</p>
      {items.map((insurance, index) => <details key={index} className="mt-2 rounded border border-slate-200 p-3">
        <summary>{objectDisplayLabel(insurance, `${group.label} · objekt ${index + 1}`)} · {insurance.productName || "Produkt ikke dokumentert"}</summary>
        <p className="mt-2">{providerDisplayName(insurance.company, insurance.catalogReference) || "Selskap ikke oppgitt"}</p>
        <p>{catalogConnectionStatus([insurance])}</p>
        <p>Årspremie: {insurance.annualPremium || "Pris ikke oppgitt"}</p>
        <p>Egenandel: {insurance.deductible || "Ikke dokumentert"}</p>
        <p>Tilleggsdekninger: {groupAddOnNames([insurance], group.key) || "Ikke dokumentert"}</p>
        <p>{insurance.coverageSummary}</p>
        {insurance.recordEvidence?.map((record, r) => <details key={`record:${r}`} className="mt-2 text-sm">
          <summary className="cursor-pointer underline">Vis dokumentgrunnlag · {r + 1}</summary>
          <p>{record.company} · {record.productName || "Produkt ikke dokumentert"}</p>
          <p>Dokumentrolle: {record.documentRole === "individual_agreement" ? "Individuell avtale" : record.documentRole === "general_terms" ? "Generelle vilkår" : "Ikke dokumentert"}</p>
          <p>Avtaleperiode: {record.agreementPeriod?.from || "Ikke dokumentert"} – {record.agreementPeriod?.to || "Ikke dokumentert"}</p>
          <p>Årspremie: {record.annualPremium || "Ikke dokumentert"} · Egenandel: {record.deductible || "Ikke dokumentert"}</p>
          {record.sources.map((source, i) => <SourceDetails key={i} source={source} />)}
          {record.importantTerms.map((term, i) => <p key={i}>{term.name}: {term.value}</p>)}
        </details>)}
        {(insurance.objectIdentifiers ?? []).flatMap(id => id.sources ?? []).map((source, i) => <SourceDetails key={`id:${i}`} source={source} />)}
        {insurance.importantTerms.map((term, i) => <div key={i} className="mt-2 text-sm"><strong>{term.name}:</strong> {term.value}
          {[...(term.source ? [term.source] : []), ...(term.sources ?? [])].map((source, j) => <SourceDetails key={j} source={source} />)}
          {term.overriddenBase?.map((base, j) => <SourceDetails key={`base:${j}`} source={base.source} baseLabel={`Grunnverdi på dette objektet: ${base.value}`} />)}
        </div>)}
      </details>)}
    </div>)}
  </td></tr>;
  return (
    <>
      <tr className="bg-slate-100">
        <th colSpan={3} className="border-y border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-700">{group.objectLabel || group.label}</th>
      </tr>
      {group.objectMatch?.status === "matched" && <tr><td colSpan={3} className="px-3 py-2 text-sm text-slate-600">
        {group.objectMatch.reason === "EXACT_OBJECT_ID" ? "Eksakt objektmatch" : "Entydig typepar – objektidentitet er ikke dokumentert"}
      </td></tr>}
      {group.objectMatch?.reason === "EXACT_OBJECT_ID" && <ComparisonRow label="Objektidentitet"
        first={group.first[0].objectIdentifiers?.map(id => id.value).join(" · ") || null}
        second={group.second[0].objectIdentifiers?.map(id => id.value).join(" · ") || null}
        firstSources={group.first[0].objectIdentifiers?.flatMap(id => id.sources ?? [])}
        secondSources={group.second[0].objectIdentifiers?.flatMap(id => id.sources ?? [])} />}
      {[...group.first, ...group.second].some(insurance => insurance.company) && <ComparisonRow label="Selskap" first={providerDisplayName(group.first[0]?.company, group.first[0]?.catalogReference)} second={providerDisplayName(group.second[0]?.company, group.second[0]?.catalogReference)} />}
      {[...group.first, ...group.second].some(insurance => insurance.consolidation?.status === "consolidated") && <tr className="align-top border-b border-slate-200">
        <th className="px-3 py-2 text-left text-sm font-medium">Dokumentgrunnlag</th>
        {[group.first, group.second].map((items, side) => <td key={side} className="px-3 py-2">{items.map((insurance, index) => <div key={index}>{insurance.recordEvidence?.map((record, r) => <details key={`record:${r}`} className="mt-2 text-sm">
          <summary className="cursor-pointer underline">Vis dokumentgrunnlag · {r + 1}</summary>
          <p>{record.company} · {record.productName || "Produkt ikke dokumentert"}</p>
          <p>Dokumentrolle: {record.documentRole === "individual_agreement" ? "Individuell avtale" : record.documentRole === "general_terms" ? "Generelle vilkår" : "Ikke dokumentert"}</p>
          <p>Avtaleperiode: {record.agreementPeriod?.from || "Ikke dokumentert"} – {record.agreementPeriod?.to || "Ikke dokumentert"}</p>
          <p>Årspremie: {record.annualPremium || "Ikke dokumentert"} · Egenandel: {record.deductible || "Ikke dokumentert"}</p>
          {record.sources.map((source, i) => <SourceDetails key={i} source={source} />)}
          {record.importantTerms.map((term, i) => <p key={i}>{term.name}: {term.value}</p>)}
        </details>)}</div>)}</td>)}
      </tr>}
      <ComparisonRow label="Produktnavn" first={groupValue(group.first, "productName")} second={groupValue(group.second, "productName")} />
      <ComparisonRow label="Katalogstatus" first={catalogConnectionStatus(group.first)} second={catalogConnectionStatus(group.second)} />
      <ComparisonRow
        label="Tilleggsdekninger"
        first={groupAddOnNames(group.first, group.key)}
        second={groupAddOnNames(group.second, group.key)}
        firstMissingLabel={group.first.length > 0 && group.first.every((insurance) => insurance.catalogReference) ? "Ingen tillegg valgt" : "Ikke dokumentert"}
        secondMissingLabel={group.second.length > 0 && group.second.every((insurance) => insurance.catalogReference) ? "Ingen tillegg valgt" : "Ikke dokumentert"}
      />
      {isMotorVehicleType(group.key) && [...group.first, ...group.second].some((insurance) => vehiclePrices(insurance)?.some((field) => field.value)) ? vehiclePriceFields.map((field) => {
        const left = group.first.flatMap((insurance) => vehiclePrices(insurance)?.filter((price) => price.key === field.key) ?? []);
        const right = group.second.flatMap((insurance) => vehiclePrices(insurance)?.filter((price) => price.key === field.key) ?? []);
        return <ComparisonRow key={field.key} label={field.label} first={left.map((price) => price.value || "Ikke dokumentert").join(" · ") || null} second={right.map((price) => price.value || "Ikke dokumentert").join(" · ") || null} firstSources={left.flatMap((price) => price.sources)} secondSources={right.flatMap((price) => price.sources)} missingLabel="Ikke dokumentert" />;
      }) : <ComparisonRow label="Årspremie" first={groupValue(group.first, "annualPremium")} second={groupValue(group.second, "annualPremium")} missingLabel="Pris ikke oppgitt" />}
      <ComparisonRow label="Egenandel" first={groupValue(group.first, "deductible")} second={groupValue(group.second, "deductible")} />
      <ComparisonRow label="Dekningssammendrag" first={groupValue(group.first, "coverageSummary")} second={groupValue(group.second, "coverageSummary")} />
      {terms.map((term) => (
        <ComparisonRow
          key={term.key}
          label={term.label}
          first={term.first}
          second={term.second}
          firstMissingLabel={term.firstMissingLabel}
          secondMissingLabel={term.secondMissingLabel}
          firstSources={term.firstSources}
          secondSources={term.secondSources}
          firstSourceOrigins={term.firstSourceOrigins}
          secondSourceOrigins={term.secondSourceOrigins}
          firstBaseFacts={term.firstBaseFacts}
          secondBaseFacts={term.secondBaseFacts}
          firstCoverage={term.firstCoverage}
          secondCoverage={term.secondCoverage}
        />
      ))}
    </>
  );
}
