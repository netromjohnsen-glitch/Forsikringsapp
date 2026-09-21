"use client";

import { useRef, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import type { MatchingPlan } from "@/lib/hybrid-matching";
import { annualPremiumLabel } from "@/lib/agreement-pricing";
import type { ManualPremiumSummary } from "@/lib/agreement-pricing";
import { emptyManualAgreement, emptyManualProduct } from "@/lib/manual-agreement";
import type { ManualAgreementInput, ManualProductInput } from "@/lib/manual-agreement";
import { availableAddOns, findCatalogProduct, findCatalogProductBySelection, productCatalog, productSuggestions } from "@/lib/product-catalog";
import { createDifferences, groupInsurances, groupTerms, groupValue } from "@/lib/comparison";
import { presentImportantDifferences, sortDetailedTerms } from "@/lib/comparison-presentation";
import type { PresentedDifference } from "@/lib/comparison-presentation";
import type { BaseFact, ComparedInsurance as Insurance, Difference, FactSource, InsuranceGroup } from "@/lib/comparison";

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

const pilotInsuranceTypes = ["Bil", "Innbo", "Hus", "Reise"];

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
  const [loading, setLoading] = useState(false);

  function addFiles(side: "existing" | "offer", newFiles: FileList | null) {
    if (!newFiles) return;

    const pdfFiles = Array.from(newFiles).filter(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );

    const update = side === "existing" ? setExistingFiles : setOfferFiles;
    update((current) => [
      ...current,
      ...pdfFiles.filter((file) => !current.some((saved) =>
        saved.name === file.name && saved.size === file.size && saved.lastModified === file.lastModified
      )),
    ]);
    setDocuments([]);
    setMatchingPlan(null);
    setError("");
  }

  function removeFile(side: "existing" | "offer", index: number) {
    const update = side === "existing" ? setExistingFiles : setOfferFiles;
    update((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setDocuments([]);
    setMatchingPlan(null);
  }

  function changeMode(side: "existing" | "offer", mode: "pdf" | "manual") {
    if (side === "existing") setExistingMode(mode);
    else setOfferMode(mode);
    setDocuments([]);
    setMatchingPlan(null);
    setError("");
  }

  function changeManual(side: "existing" | "offer", value: SetStateAction<ManualAgreementInput>) {
    if (side === "existing") setExistingManual(value);
    else setOfferManual(value);
    setDocuments([]);
    setMatchingPlan(null);
    setError("");
  }

  const existingReady = existingMode === "pdf" ? existingFiles.length > 0 : manualReady(existingManual);
  const offerReady = offerMode === "pdf" ? offerFiles.length > 0 : manualReady(offerManual);

  async function analyzeDocuments() {
    if (!existingReady || !offerReady) return;

    setLoading(true);
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
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Noe gikk galt.");
        return;
      }

      setDocuments(data.documents);
      setMatchingPlan(data.matchingPlan || null);
    } catch {
      setError("Kunne ikke analysere dokumentene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Rådgiververktøy</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Forsikringsassistent
        </h1>

        <p className="mt-3 text-lg text-slate-700">
          Sammenlign eksisterende forsikringer med et nytt tilbud.
        </p>
        <p className="mt-1 text-sm text-slate-600">Last opp forsikringsdokumenter eller registrer forsikringene manuelt.</p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950">Ny sammenligning</h2>
          <p className="mt-2 text-gray-600">
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
            className="mt-6 w-full rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 sm:w-auto"
          >
            {loading ? (existingMode === "pdf" || offerMode === "pdf" ? "Leser dokumenter og sammenligner …" : "Sammenligner forsikringene …") : "Sammenlign forsikringene"}
          </button>
          {(!existingReady || !offerReady) && (
            <p id="comparison-requirements" className="mt-2 text-sm text-slate-600">Legg til minst én PDF, eller fyll ut selskap, forsikringstype og produkt, på begge sider.</p>
          )}
          {loading && <p role="status" aria-live="polite" className="mt-3 text-sm text-blue-800">Dette kan ta litt tid når dokumenter skal leses.</p>}

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
          )}
        </div>

        {documents.length >= 2 && (
          <Comparison key={`${documents[0].filename}-${documents[1].filename}`} first={documents[0]} second={documents[1]} matchingPlan={matchingPlan} />
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
    <section className={`rounded-2xl border p-4 sm:p-5 ${side === "existing" ? "border-slate-300 bg-slate-50/70" : "border-blue-200 bg-blue-50/40"}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${side === "existing" ? "text-slate-600" : "text-blue-700"}`}>{eyebrow}</p>
      <h3 className="mt-1 font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 grid grid-cols-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200" role="group" aria-label={`Registreringsmåte for ${eyebrow.toLowerCase()}`}>
        {(["pdf", "manual"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => onModeChange(option)}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium ${mode === option ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"}`}
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
      <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs leading-5 text-slate-700">
        <span className="font-semibold text-slate-900">Pilot:</span> Dokumentene analyseres for å sammenligne forsikringene dine. PDF-en sendes til vår server for tekstuttrekk. Relevant, maskert tekst sendes til OpenAI; selve PDF-filen sendes ikke dit. Appen har ingen database som lagrer dokumentet eller resultatet. OpenAI kan beholde sikkerhetslogger etter API-avtalen. Ikke last opp mer informasjon enn nødvendig, og kontroller viktige opplysninger mot originaldokumentet.
      </p>
      <p className="mt-2 text-xs text-slate-500">Maks 5 PDF-er per side, 10 MiB per fil og 25 MiB samlet.</p>
      <div
        className="mt-3 rounded-xl border-2 border-dashed border-slate-300 bg-white text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40"
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
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
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
        }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
          <option value="">Ukjent</option><option>SpareBank 1</option><option>DNB</option><option>Eika</option>
        </select>
      </label>}
      <datalist id={`insurance-types-${side}`}>
        {pilotInsuranceTypes.map((type) => (
          <option key={type} value={type} />
        ))}
      </datalist>
      {value.products.map((product, index) => (
        <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
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
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
              />
              <datalist id={`products-${side}-${index}`}>
                {productSuggestions(productCatalog, value.company, product.type).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {value.company.trim() && product.type.trim() && (
                productSuggestions(productCatalog, value.company, product.type).length > 0
                  ? <span className="mt-1 block text-xs font-normal text-blue-700">Velg blant tilgjengelige katalogprodukter, eller skriv et annet produkt.</span>
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
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Årspris <span className="font-normal text-gray-500">(valgfritt)</span>
                <input
                  value={product.annualPremium}
                  onChange={(event) => changeProduct(index, { annualPremium: event.target.value })}
                  placeholder="F.eks. 5 000 kr"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
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
      }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">+ Legg til forsikring</button>
      <p className="text-xs text-gray-500">Katalogprodukter henter dokumenterte vilkår automatisk. For andre produkter sammenlignes bare opplysninger som er tilgjengelige.</p>
    </div>
  );
}

function Comparison({
  first,
  second,
  matchingPlan,
}: {
  first: DocumentResult;
  second: DocumentResult;
  matchingPlan: MatchingPlan | null;
}) {
  const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, matchingPlan);
  const differences = presentImportantDifferences(
    createDifferences(first, second, groups, matchingPlan), groups, matchingPlan,
  );
  const totalDifference = differences.find((difference) => difference.type === "price" && !difference.insuranceKey);
  const productPriceDifferences = differences.filter((difference) => difference.type === "price" && difference.insuranceKey);
  const highlightedDifferences = differences
    .filter((difference) => difference.insuranceKey && difference.type !== "price");
  const typeOrder = ["Bil", "Hus", "Innbo", "Reise"];
  const availableTypes = typeOrder.filter((type) => groups.some((group) => group.label === type));
  const [selectedType, setSelectedType] = useState("overview");
  const visibleGroups = selectedType === "overview"
    ? groups
    : groups.filter((group) => group.label === selectedType);
  const previewLimit = selectedType === "overview" ? 3 : 5;
  const visibleGroupsWithDifferences = visibleGroups.map((group) => ({
    group,
    differences: highlightedDifferences.filter((difference) => difference.insuranceKey === group.key).slice(0, previewLimit),
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
    <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="comparison-result-heading">
      <div className="px-4 pt-5 sm:px-7 sm:pt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Resultat</p>
        <h2 id="comparison-result-heading" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Sammenligning</h2>
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
                className={`relative shrink-0 px-3 py-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full ${active ? "text-slate-950 after:bg-blue-700" : "text-slate-500 after:bg-transparent hover:text-slate-900"}`}
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
              {totalDifference && <p className="text-sm font-medium text-blue-800">{totalDifference.text}</p>}
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-0">
              {[first, second].map((document, index) => (
                <div key={index} className={index === 0 ? "sm:pr-8" : "border-t border-slate-200 pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0"}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{index === 0 ? "Eksisterende" : "Nytt tilbud"}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{document.insuranceData.company || `Tilbud ${index + 1}`}</p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">Total årspris</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
                    {annualPremiumLabel(document.insuranceData)}
                    {document.insuranceData.totalAnnualPremium !== null && <span className="ml-1 text-sm font-normal text-slate-500">/ år</span>}
                  </p>
                </div>
              ))}
            </div>
            {productPriceDifferences.length > 0 && (
              <details className="group mt-5 border-t border-slate-100 pt-4 text-sm">
                <summary className="w-fit cursor-pointer list-none font-semibold text-blue-700 marker:hidden hover:text-blue-900 [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">Vis pris per forsikring</span>
                  <span className="hidden group-open:inline">Skjul pris per forsikring</span>
                </summary>
                <ul className="mt-3 space-y-1.5 text-slate-700">
                  {productPriceDifferences.map((difference) => (
                    <li key={difference.insuranceKey}><span className="font-medium text-slate-900">{groups.find((group) => group.key === difference.insuranceKey)?.label}:</span> {difference.text}</li>
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
          {visibleGroupsWithDifferences.length > 0 ? (
            <div className="mt-6 space-y-8">
              {visibleGroupsWithDifferences.map(({ group, differences: groupDifferences }) => (
                <section key={group.key} aria-labelledby={`difference-group-${group.key}`}>
                  <h4 id={`difference-group-${group.key}`} className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{group.label}</h4>
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
              {visibleGroups.some((group) => [...group.first, ...group.second].some((insurance) =>
                insurance.coverageSummary || insurance.deductible || insurance.importantTerms.length
              )) ? "Ingen sikre forskjeller funnet i oppgitte dekninger og vilkår." : "Ingen deknings- eller vilkårsopplysninger er oppgitt for sammenligning."}
            </p>
          )}
        </section>

        <details className="group mt-8 border-t border-slate-200 pt-1">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-semibold text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden">
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
                    <th className="border-b border-gray-200 bg-white p-3 text-left">
                      <p className="text-xs font-normal text-gray-500">Eksisterende</p>
                      <p className="font-semibold text-gray-900">{first.insuranceData.company || "Tilbud 1"}</p>
                      <p className="mt-0.5 text-xs font-normal text-gray-500">{first.filename}</p>
                    </th>
                    <th className="border-b border-gray-200 bg-white p-3 text-left">
                      <p className="text-xs font-normal text-gray-500">Nytt tilbud</p>
                      <p className="font-semibold text-gray-900">{second.insuranceData.company || "Tilbud 2"}</p>
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
                    <InsuranceRows key={group.key} group={group} matchingPlan={matchingPlan} />
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
  const items = difference.items || [difference];
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
          <span className="shrink-0 pt-0.5 text-sm font-semibold text-blue-700">
            <span className="group-open:hidden">Se detaljer</span>
            <span className="hidden group-open:inline">Skjul</span>
          </span>
        </div>
        <div className="mt-4 group-open:hidden">
          <DifferenceValues text={hero.item.text} compact pair={hero.pair} />
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
        <a href={difference.presentationSource.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900">
          {difference.presentationSource.label}
        </a>
      )}
      {difference.presentationSources?.map((source) => (
        <a
          key={`${source.side}-${source.providerId}-${source.url}`}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900"
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
}: {
  label: string;
  first: string | null;
  second: string | null;
  missingLabel?: string;
  firstMissingLabel?: string;
  secondMissingLabel?: string;
  firstSources?: FactSource[];
  secondSources?: FactSource[];
  firstBaseFacts?: BaseFact[];
  secondBaseFacts?: BaseFact[];
}) {
  const different = Boolean(first && second && first.trim().toLocaleLowerCase("nb-NO") !== second.trim().toLocaleLowerCase("nb-NO"));

  return (
    <tr className={different ? "bg-amber-50/60" : ""}>
      <td className={`sticky left-0 border-b border-gray-100 p-3 font-medium text-gray-700 ${different ? "bg-amber-50" : "bg-white"}`}>
        {label}
      </td>

      <td className="border-b border-gray-100 p-3 text-gray-900">
        {first || firstMissingLabel || missingLabel}
        {firstSources.map((source) => <SourceDetails key={`${source.documentId}-${source.section}-${source.page}`} source={source} />)}
        {firstBaseFacts.map((base) => <SourceDetails key={`${base.source.documentId}-${base.source.section}-${base.source.page}`} source={base.source} baseLabel={`Grunnverdi på eksisterende avtale: ${base.value}`} />)}
      </td>

      <td className="border-b border-gray-100 p-3 text-gray-900">
        {second || secondMissingLabel || missingLabel}
        {secondSources.map((source) => <SourceDetails key={`${source.documentId}-${source.section}-${source.page}`} source={source} />)}
        {secondBaseFacts.map((base) => <SourceDetails key={`${base.source.documentId}-${base.source.section}-${base.source.page}`} source={base.source} baseLabel={`Grunnverdi på nytt tilbud: ${base.value}`} />)}
      </td>
    </tr>
  );
}

function DifferenceValues({ text, compact = false, pair }: { text: string; compact?: boolean; pair?: DifferencePair }) {
  const values = pair || splitDifferenceValues(text);
  if (!values) return <p className={compact ? "line-clamp-2 text-base font-semibold leading-6 text-slate-900" : "mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700"}>{text}</p>;

  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-2 sm:gap-0" : "mt-2 grid gap-4 sm:grid-cols-2 sm:gap-0"}>
      <div className={compact ? "sm:pr-6" : "sm:pr-5"}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Eksisterende</p>
        <p className={`${compact ? "line-clamp-2 text-base font-semibold leading-6 text-slate-950" : "text-sm leading-6 text-slate-800"} mt-1 whitespace-pre-wrap break-words`}>{values.first}</p>
      </div>
      <div className={compact ? "border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0" : "border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0"}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nytt tilbud</p>
        <p className={`${compact ? "line-clamp-2 text-base font-semibold leading-6 text-slate-950" : "text-sm leading-6 text-slate-800"} mt-1 whitespace-pre-wrap break-words`}>{values.second}</p>
      </div>
    </div>
  );
}

function SourceDetails({ source, baseLabel }: { source: FactSource; baseLabel?: string }) {
  return (
    <details className="mt-2 text-xs text-slate-600">
      <summary className="w-fit cursor-pointer rounded font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900">Vis kilde</summary>
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 leading-5">
        {baseLabel && <p className="font-medium text-slate-700">{baseLabel}</p>}
        {source.note && <p>{source.note}</p>}
        <p>{[source.company, source.termsNumber !== "Ikke oppgitt" ? source.termsNumber : null, source.effectiveFrom, `side ${source.page}`, `punkt ${source.section}`].filter(Boolean).join(" · ")}</p>
        <p className="break-words text-slate-500">Dokument: {source.filename}</p>
        {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline">Åpne originalkilde</a>}
      </div>
    </details>
  );
}

function InsuranceRows({ group, matchingPlan }: { group: InsuranceGroup; matchingPlan: MatchingPlan | null }) {
  const catalogStatus = (insurances: Insurance[]) => insurances.length > 0 &&
    insurances.every((insurance) => insurance.catalogReference)
    ? "Koblet til vilkårskatalogen"
    : "Ikke koblet til vilkårskatalogen – sammenligningen bygger bare på registrerte opplysninger og kan være ufullstendig";
  const showCatalogStatus = [...group.first, ...group.second].some((insurance) => !insurance.catalogReference);
  return (
    <>
      <tr className="bg-slate-100">
        <th colSpan={3} className="border-y border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-700">{group.label}</th>
      </tr>
      <ComparisonRow label="Produktnavn" first={groupValue(group.first, "productName")} second={groupValue(group.second, "productName")} />
      {showCatalogStatus && <ComparisonRow label="Katalogstatus" first={catalogStatus(group.first)} second={catalogStatus(group.second)} />}
      <ComparisonRow
        label="Tilleggsdekninger"
        first={group.first.flatMap((insurance) => insurance.addOns?.map((addOn) => addOn.name) || []).join(" · ") || null}
        second={group.second.flatMap((insurance) => insurance.addOns?.map((addOn) => addOn.name) || []).join(" · ") || null}
        firstMissingLabel={group.first.length > 0 && group.first.every((insurance) => insurance.catalogReference) ? "Ingen tillegg valgt" : "Ikke dokumentert"}
        secondMissingLabel={group.second.length > 0 && group.second.every((insurance) => insurance.catalogReference) ? "Ingen tillegg valgt" : "Ikke dokumentert"}
      />
      <ComparisonRow label="Årspremie" first={groupValue(group.first, "annualPremium")} second={groupValue(group.second, "annualPremium")} missingLabel="Pris ikke oppgitt" />
      <ComparisonRow label="Egenandel" first={groupValue(group.first, "deductible")} second={groupValue(group.second, "deductible")} />
      <ComparisonRow label="Dekningssammendrag" first={groupValue(group.first, "coverageSummary")} second={groupValue(group.second, "coverageSummary")} />
      {sortDetailedTerms(groupTerms(group, matchingPlan)).map((term) => (
        <ComparisonRow
          key={term.key}
          label={term.label}
          first={term.first}
          second={term.second}
          firstMissingLabel={term.firstMissingLabel}
          secondMissingLabel={term.secondMissingLabel}
          firstSources={term.firstSources}
          secondSources={term.secondSources}
          firstBaseFacts={term.firstBaseFacts}
          secondBaseFacts={term.secondBaseFacts}
        />
      ))}
    </>
  );
}
