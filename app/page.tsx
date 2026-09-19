"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { MatchingPlan } from "@/lib/hybrid-matching";
import { annualPremiumLabel } from "@/lib/agreement-pricing";
import type { ManualPremiumSummary } from "@/lib/agreement-pricing";
import { emptyManualAgreement, emptyManualProduct } from "@/lib/manual-agreement";
import type { ManualAgreementInput, ManualProductInput } from "@/lib/manual-agreement";
import { availableAddOns, findCatalogProduct, findCatalogProductBySelection, productCatalog, productSuggestions } from "@/lib/product-catalog";
import { createDifferences, groupInsurances, groupTerms, groupValue } from "@/lib/comparison";
import { presentImportantDifferences } from "@/lib/comparison-presentation";
import type { BaseFact, ComparedInsurance as Insurance, FactSource, InsuranceGroup } from "@/lib/comparison";

type InsuranceData = {
  customer: string | null;
  customerType: string | null;
  offerNumber: string | null;
  company: string | null;
  totalAnnualPremium: string | null;
  priceSummary?: ManualPremiumSummary;
  insurances: Insurance[];
};

type DocumentResult = {
  source: "pdf" | "manual";
  filename: string;
  text: string;
  insuranceData: InsuranceData;
};

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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-900">
          Forsikringsassistent
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Sammenlign forsikringstilbud raskere og enklere.
        </p>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900">Ny sammenligning</h2>
          <p className="mt-2 text-gray-600">
            Last opp PDF-er eller registrer forsikringsprodukter manuelt på hver side.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <AgreementInput
              title="1. Kundens eksisterende forsikring"
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
              title="2. Nytt tilbud"
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
            className="mt-6 rounded-xl bg-black px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Analyserer..." : "Sammenlign forsikringene"}
          </button>
          {(!existingReady || !offerReady) && (
            <p className="mt-2 text-sm text-gray-500">Legg til PDF-er eller fyll ut selskap, forsikringstype og produkt på begge sider.</p>
          )}

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
          )}
        </div>

        {documents.length >= 2 && (
          <Comparison first={documents[0]} second={documents[1]} matchingPlan={matchingPlan} />
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
  title, side, mode, onModeChange, files, onAdd, onRemove, manual, onManualChange,
}: {
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
    <section className="rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <div className="mt-4 flex gap-2" role="group" aria-label={title}>
        {(["pdf", "manual"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => onModeChange(option)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${mode === option ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            {option === "pdf" ? "Last opp PDF" : "Registrer manuelt"}
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
      <p className="mt-3 text-sm text-gray-600">Én eller flere PDF-er som tilhører samme avtale.</p>
      <div
        className="mt-3 rounded-xl border-2 border-dashed border-gray-300 text-center hover:bg-gray-50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); onAdd(event.dataTransfer.files); }}
      >
        <label className="block cursor-pointer p-6 text-sm font-medium text-gray-800">
          Dra PDF-er hit eller klikk for å velge
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
                <span className="min-w-0 truncate text-gray-800" title={file.name}>{file.name}</span>
                <button type="button" onClick={() => onRemove(index)} className="shrink-0 font-medium text-gray-500 hover:text-black">Fjern</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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
              products: currentAgreement.products.map((product) => ({
                ...product, ...selectionPatch(product, company, product.type, product.productName),
              })),
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
        {productCatalog.insuranceTypes.map((type) => (
          <option key={type} value={type} />
        ))}
      </datalist>
      {value.products.map((product, index) => (
        <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900">Forsikring {index + 1}</h4>
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
                onChange={(event) => {
                  const type = event.target.value;
                  changeProduct(index, { type, ...selectionPatch(product, value.company, type, product.productName) });
                }}
                placeholder="Velg eller skriv type"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Produkt/variant
              <input
                list={`products-${side}-${index}`}
                value={product.productName}
                onChange={(event) => {
                  const name = event.target.value;
                  changeProduct(index, {
                    productName: name,
                    ...selectionPatch(product, value.company, product.type, name),
                  });
                }}
                placeholder="Velg eller skriv produkt"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
              />
              <datalist id={`products-${side}-${index}`}>
                {productSuggestions(productCatalog, value.company, product.type).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
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
              Årspremie <span className="font-normal text-gray-500">(valgfritt)</span>
              <input
                value={product.annualPremium}
                onChange={(event) => changeProduct(index, { annualPremium: event.target.value })}
                placeholder="F.eks. 5 000 kr"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
              />
            </label>
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
      }))} className="text-sm font-medium text-gray-700 underline hover:text-black">Legg til forsikring</button>
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
    first.insuranceData.company, second.insuranceData.company,
  );
  const totalDifference = differences.find((difference) => difference.type === "price" && !difference.insuranceKey);
  const productPriceDifferences = differences.filter((difference) => difference.type === "price" && difference.insuranceKey);
  const highlightedDifferences = differences
    .filter((difference) => difference.insuranceKey && difference.type !== "price")
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
  const groupsWithDifferences = groups.map((group) => ({
    group,
    differences: highlightedDifferences.filter((difference) => difference.insuranceKey === group.key),
  })).filter(({ differences }) => differences.length > 0);

  return (
    <div className="mt-6 space-y-4">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Sammenligning</h2>
          {totalDifference && (
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
              {totalDifference.text}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">Total årspremie</p>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[first, second].map((document, index) => (
            <div key={index} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <span className="min-w-0 text-sm font-medium text-gray-700">
                <span className="block text-xs font-normal text-gray-500">{index === 0 ? "Eksisterende" : "Nytt tilbud"}</span>
                <span className="block truncate">{document.insuranceData.company || `Tilbud ${index + 1}`}</span>
              </span>
              <span className="text-right text-sm font-semibold tabular-nums text-gray-900">
                {annualPremiumLabel(document.insuranceData)}
                {document.insuranceData.totalAnnualPremium !== null && <span className="ml-1 text-xs font-normal text-gray-500">/ år</span>}
              </span>
            </div>
          ))}
        </div>
        {productPriceDifferences.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-700">
            <p className="font-medium text-gray-900">Pris per forsikring</p>
            <ul className="mt-1 space-y-1">
              {productPriceDifferences.map((difference) => (
                <li key={difference.insuranceKey}><span className="font-medium">{groups.find((group) => group.key === difference.insuranceKey)?.label}:</span> {difference.text}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold text-gray-900">Viktigste forskjeller</h2>
        {groupsWithDifferences.length > 0 ? (
          <div className="mt-2 divide-y divide-gray-100">
            {groupsWithDifferences.map(({ group, differences: groupDifferences }) => (
              <div key={group.key} className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-900">{group.label}</h3>
                <ul className="space-y-2 text-sm leading-5 text-gray-700">
                  {groupDifferences.map((difference) => (
                    <li key={difference.title} className="grid gap-0.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-3">
                      <span className="font-medium text-gray-900">{difference.title}</span>
                      <span>{difference.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            {groups.some((group) => [...group.first, ...group.second].some((insurance) =>
              insurance.coverageSummary || insurance.deductible || insurance.importantTerms.length
            )) ? "Ingen sikre forskjeller funnet i oppgitte dekninger og vilkår." : "Ingen deknings- eller vilkårsopplysninger er oppgitt for sammenligning."}
          </p>
        )}
      </section>

      <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-gray-900 marker:hidden sm:p-5 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Vis alle detaljer</span>
          <span className="hidden group-open:inline">Skjul detaljer</span>
          <span aria-hidden="true" className="text-lg leading-none text-gray-500 group-open:rotate-180">⌄</span>
        </summary>
        <div className="border-t border-gray-100 px-4 pb-5 sm:px-5">
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 p-3 text-left text-gray-500">Dekning</th>
                  <th className="border-b border-gray-200 p-3 text-left">
                    <p className="text-xs font-normal text-gray-500">Eksisterende</p>
                    <p className="font-semibold text-gray-900">{first.insuranceData.company || "Tilbud 1"}</p>
                    <p className="mt-0.5 text-xs font-normal text-gray-500">{first.filename}</p>
                  </th>
                  <th className="border-b border-gray-200 p-3 text-left">
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
                {groups.map((group) => (
                  <InsuranceRows key={group.key} group={group} matchingPlan={matchingPlan} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <OriginalText document={first} />
            <OriginalText document={second} />
          </div>
        </div>
      </details>
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
    <tr className={different ? "bg-amber-50" : ""}>
      <td className="border-b border-gray-100 p-3 font-medium text-gray-700">
        {label}
      </td>

      <td className="border-b border-gray-100 p-3 text-gray-900">
        {first || firstMissingLabel || missingLabel}
        {firstSources.map((source) => <p key={`${source.documentId}-${source.section}-${source.page}`} className="mt-1 text-xs text-gray-500">
          {source.note ? `${source.note} · ` : ""}{source.company ? `${source.company} · ` : ""}{source.filename} · {source.termsNumber} · {source.effectiveFrom} · s. {source.page} · pkt. {source.section}
          {source.url && <> · <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">Kilde-PDF</a></>}
        </p>)}
        {firstBaseFacts.map((base) => <p key={`${base.source.documentId}-${base.source.section}-${base.source.page}`} className="mt-1 text-xs text-gray-500">
          Grunnverdi på eksisterende avtale: {base.value} · {base.source.company ? `${base.source.company} · ` : ""}{base.source.filename} · {base.source.termsNumber} · {base.source.effectiveFrom} · s. {base.source.page} · pkt. {base.source.section}
          {base.source.url && <> · <a href={base.source.url} target="_blank" rel="noopener noreferrer" className="underline">Kilde-PDF</a></>}
        </p>)}
      </td>

      <td className="border-b border-gray-100 p-3 text-gray-900">
        {second || secondMissingLabel || missingLabel}
        {secondSources.map((source) => <p key={`${source.documentId}-${source.section}-${source.page}`} className="mt-1 text-xs text-gray-500">
          {source.note ? `${source.note} · ` : ""}{source.company ? `${source.company} · ` : ""}{source.filename} · {source.termsNumber} · {source.effectiveFrom} · s. {source.page} · pkt. {source.section}
          {source.url && <> · <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">Kilde-PDF</a></>}
        </p>)}
        {secondBaseFacts.map((base) => <p key={`${base.source.documentId}-${base.source.section}-${base.source.page}`} className="mt-1 text-xs text-gray-500">
          Grunnverdi på nytt tilbud: {base.value} · {base.source.company ? `${base.source.company} · ` : ""}{base.source.filename} · {base.source.termsNumber} · {base.source.effectiveFrom} · s. {base.source.page} · pkt. {base.source.section}
          {base.source.url && <> · <a href={base.source.url} target="_blank" rel="noopener noreferrer" className="underline">Kilde-PDF</a></>}
        </p>)}
      </td>
    </tr>
  );
}

function InsuranceRows({ group, matchingPlan }: { group: InsuranceGroup; matchingPlan: MatchingPlan | null }) {
  return (
    <>
      <tr className="bg-gray-100">
        <th colSpan={3} className="p-3 text-left font-semibold text-gray-900">{group.label}</th>
      </tr>
      <ComparisonRow label="Produktnavn" first={groupValue(group.first, "productName")} second={groupValue(group.second, "productName")} />
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
      {groupTerms(group, matchingPlan).map((term) => (
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

function OriginalText({
  document,
}: {
  document: DocumentResult;
}) {
  if (document.source === "manual") return null;
  return (
    <details className="rounded-xl bg-gray-50 p-4">
      <summary className="cursor-pointer font-medium text-gray-700">
        Vis originaltekst –{" "}
        {document.insuranceData.company || document.filename}
      </summary>

      <pre className="mt-4 whitespace-pre-wrap text-sm text-gray-600">
        {document.text}
      </pre>
    </details>
  );
}
