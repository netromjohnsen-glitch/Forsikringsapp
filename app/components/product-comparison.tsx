"use client";

import { useMemo, useState } from "react";
import { agreementScopeDisplayName } from "@/lib/provider-presentation";
import { catalogAgreementScope } from "@/lib/agreement-scope";
import { catalogProductIdentity, productCatalog, type CatalogProduct } from "@/lib/product-catalog";
import {
  compareCatalogProducts,
  findProductComparisonProduct,
  productComparisonInsuranceTypes,
  productComparisonOptions,
  productComparisonProviders,
  productComparisonScopes,
  productCoverageStateLabel,
  type ProductComparisonFact,
  type CatalogProductComparison,
  type ProductComparisonSource,
} from "@/lib/catalog-product-comparison";

import { productComparisonView, productRowPriority, catalogDisplayLabel, catalogDisplayValue, type ProductDisplayRow, type ProductCoverageGroup } from "@/lib/product-comparison-presentation";

type Selection = {
  company: string;
  agreementScope: string;
  productIdentity: string;
};

const emptySelection = (): Selection => ({ company: "", agreementScope: "", productIdentity: "" });

function sourceTypeLabel(source: ProductComparisonSource): string {
  if (source.sourceType === "ipid") return "IPID / produktark";
  if (source.sourceType === "product_page") return "Produktside";
  return "Offentlig vilkår";
}

function ProductSource({ source, label }: { source: ProductComparisonSource; label: string }) {
  return (
    <details className="mt-2 text-xs text-slate-600">
      <summary
        aria-label={`Vis kilde: ${label}`}
        className="text-link w-fit cursor-pointer rounded font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Vis kilde · {sourceTypeLabel(source)}
      </summary>
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 leading-5">
        {source.note && <p>{source.note}</p>}
        <p>{[source.company, source.termsNumber !== "Ikke oppgitt" ? source.termsNumber : null,
          source.effectiveFrom, source.page > 0 ? `side ${source.page}` : null,
          source.section ? `punkt ${source.section}` : null].filter(Boolean).join(" · ")}</p>
        {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-link font-medium underline">Åpne originalkilde</a>}
      </div>
    </details>
  );
}

function ProductValue({ row, side, showSources = true }: { row: ProductDisplayRow; side: "first" | "second"; showSources?: boolean }) {
  const value = row[side];
  return (
    <div className={side === "first" ? "difference-side-existing rounded-lg px-4 py-4" : "difference-side-offer rounded-lg px-4 py-4"}>
      <p className={side === "first" ? "existing-label text-xs font-semibold uppercase tracking-wide" : "offer-label text-xs font-semibold uppercase tracking-wide"}>
        {side === "first" ? "Produkt A" : "Produkt B"}
      </p>
      {value.parentLabel && <p className="mt-2 text-xs font-medium text-slate-600">Dokumentert under {value.parentLabel}. Omfanget følger vilkåret nedenfor.</p>}
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{value.text}</p>
      {showSources && value.sources.map((source) => <ProductSource key={`${source.documentId}-${source.page}-${source.section}`} source={source} label={`${row.label} – ${side === "first" ? "Produkt A" : "Produkt B"}`} />)}
    </div>
  );
}

function DifferenceRow({ row, showLabel = true, showSources = true }: { row: ProductDisplayRow; showLabel?: boolean; showSources?: boolean }) {
  return (
    <div className="py-4">
      {showLabel && <p className="mb-2 text-sm font-medium text-slate-800">{row.label}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <ProductValue row={row} side="first" showSources={showSources} />
        <ProductValue row={row} side="second" showSources={showSources} />
      </div>
    </div>
  );
}

function ProductSelector({
  side,
  insuranceType,
  selection,
  onChange,
  onInvalidate,
}: {
  side: "A" | "B";
  insuranceType: string;
  selection: Selection;
  onChange: (value: Selection) => void;
  onInvalidate: () => void;
}) {
  const providers = productComparisonProviders(insuranceType);
  const scopes = selection.company ? productComparisonScopes(insuranceType, selection.company) : [];
  const selectedScope = selection.agreementScope || (scopes.length === 1 ? scopes[0].id : "");
  const products = selection.company
    ? productComparisonOptions(insuranceType, selection.company, selectedScope || null)
    : [];
  const showScope = scopes.some((scope) => scope.id !== "ordinary") || scopes.length > 1;

  function update(next: Selection) {
    onInvalidate();
    onChange(next);
  }

  return (
    <fieldset className={side === "A" ? "comparison-side-existing rounded-xl border p-4" : "comparison-side-offer rounded-xl border p-4"}>
      <legend className="px-1 text-base font-semibold text-slate-950">Produkt {side}</legend>
      <div className="grid gap-4">
        <label className="text-sm font-medium text-gray-700">
          Selskap
          <select
            aria-label={`Produkt ${side} – selskap`}
            value={selection.company}
            onChange={(event) => {
              const company = event.target.value;
              const nextScopes = company ? productComparisonScopes(insuranceType, company) : [];
              update({ company, agreementScope: nextScopes.length === 1 ? nextScopes[0].id : "", productIdentity: "" });
            }}
            className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none"
          >
            <option value="">Velg selskap</option>
            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </select>
        </label>

        {showScope && <label className="text-sm font-medium text-gray-700">
          Avtale / medlemsavtale
          <select
            aria-label={`Produkt ${side} – avtale eller medlemsavtale`}
            value={selectedScope}
            onChange={(event) => update({ ...selection, agreementScope: event.target.value, productIdentity: "" })}
            className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none"
          >
            {scopes.length > 1 && <option value="">Velg avtale</option>}
            {scopes.map((scope) => <option key={scope.id} value={scope.id}>{scope.name}</option>)}
          </select>
        </label>}

        <label className="text-sm font-medium text-gray-700">
          Produkt/variant
          <select
            aria-label={`Produkt ${side} – produkt eller variant`}
            value={selection.productIdentity}
            disabled={!selection.company || !selectedScope}
            onChange={(event) => update({ ...selection, agreementScope: selectedScope, productIdentity: event.target.value })}
            className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none disabled:cursor-not-allowed"
          >
            <option value="">Velg produkt</option>
            {products.map((product) => <option key={catalogProductIdentity(product)} value={catalogProductIdentity(product)}>
              {product.name}{products.filter((candidate) => candidate.name === product.name).length > 1 ? ` (${product.version ?? "ukjent versjon"})` : ""}
            </option>)}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

function ProductHeader({ label, product }: { label: string; product: CatalogProduct }) {
  const agreement = agreementScopeDisplayName({ company: product.company, agreementScope: catalogAgreementScope(product),
    catalogReference: { providerId: product.providerId, productId: product.productId, version: product.version,
      insuranceType: product.insuranceType, agreementScope: catalogAgreementScope(product) } });
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{product.company}</p>
      {agreement && <p className="text-sm text-slate-600">{agreement}</p>}
      <p className="text-sm text-slate-700">{product.name}</p>
    </div>
  );
}

function ProductEvidenceList({ facts, side, company, label, showUnknown = false }: {
  facts: ProductComparisonFact[]; side: "first" | "second"; company: string; label: string; showUnknown?: boolean;
}) {
  if (!facts.length && !showUnknown) return null;
  const sideLabel = side === "first" ? "Produkt A" : "Produkt B";
  return <div className="min-w-0" aria-label={`${label} – ${sideLabel} – ${company}`}>
    <p className="text-xs font-semibold text-slate-700">{sideLabel} · {company}</p>
    {!facts.length && <p className="mt-2 text-sm text-slate-700">{productCoverageStateLabel("unknown")}</p>}
    <div className="mt-2 space-y-4">{facts.map((fact, index) => <div key={`${fact.key}-${index}`}>
      <p className="text-sm font-medium text-slate-800">{catalogDisplayLabel(fact)}</p>
      {fact.state === "optional" && <p className="mt-1 text-xs text-slate-600">{productCoverageStateLabel(fact.state)}{fact.addOnNames.length > 0 ? ` (${fact.addOnNames.join(" / ")})` : ""}</p>}
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{catalogDisplayValue(fact)}</p>
      {fact.sources.map((source) => <ProductSource key={`${source.documentId}-${source.page}-${source.section}`} source={source} label={`${fact.label} – ${sideLabel}`} />)}
    </div>)}</div>
  </div>;
}

function CoverageGroup({ group, result }: { group: ProductCoverageGroup; result: CatalogProductComparison }) {
  const hasDetails = group.details.first.length > 0 || group.details.second.length > 0;
  const parentBackedRows = group.rows.filter((row) => row.first.parentLabel || row.second.parentLabel);
  const leadRows = group.rows.filter((row) => !parentBackedRows.includes(row) && productRowPriority(row.key) <= 2);
  const detailRows = group.rows.filter((row) => !leadRows.includes(row) && !parentBackedRows.includes(row));
  return <div className="py-5">
    {group.showHeading !== false && <h5 className="text-base font-semibold text-slate-900">{group.label}</h5>}
    <div className="divide-y divide-slate-100">{leadRows.map((row) => <DifferenceRow key={row.key} row={row} showLabel={!group.hiddenRowLabels?.includes(row.key)} />)}</div>
    {parentBackedRows.length > 0 && <div className="expanded-detail-area my-4">
      <h6 className="text-sm font-semibold text-slate-800">Dekninger dokumentert i hovedvilkåret</h6>
      {parentBackedRows.map((row) => <DifferenceRow key={row.key} row={row} />)}
    </div>}
    {group.models.map((model) => <div key={model.label} className="expanded-detail-area my-4">
      <h6 className="mb-3 text-sm font-semibold text-slate-800">{model.label}</h6>
      <div className="grid gap-5 sm:grid-cols-2">
        <ProductEvidenceList facts={model.first} side="first" company={result.first.product.company} label={model.label} showUnknown />
        <ProductEvidenceList facts={model.second} side="second" company={result.second.product.company} label={model.label} showUnknown />
      </div>
    </div>)}
    <div className="divide-y divide-slate-100">{detailRows.map((row) => <DifferenceRow key={row.key} row={row} showLabel={!group.hiddenRowLabels?.includes(row.key)} />)}</div>
    {hasDetails && <div className="expanded-detail-area mt-4">
      <h6 className="mb-2 text-sm font-semibold text-slate-800">Produktspesifikke detaljer</h6>
      <p className="mb-4 text-xs leading-5 text-slate-600">Detaljene har forskjellig omfang eller oppbygning og sammenlignes ikke én til én.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0"><ProductEvidenceList facts={group.details.first} side="first" company={result.first.product.company} label={group.label} /></div>
        <div className="min-w-0"><ProductEvidenceList facts={group.details.second} side="second" company={result.second.product.company} label={group.label} /></div>
      </div>
    </div>}
  </div>;
}

function ProductResult({ result }: { result: CatalogProductComparison }) {
  const sections = productComparisonView(result);
  return (
    <section className="surface-card mt-8 min-w-0 rounded-2xl border p-5 sm:p-8" aria-labelledby="product-comparison-result">
      <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.12em]">Produktsammenligning</p>
      <h2 id="product-comparison-result" className="section-title mt-1 text-2xl font-semibold">{result.insuranceType}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <ProductHeader label="Produkt A" product={result.first.product} />
        <span className="text-sm font-medium text-slate-500">mot</span>
        <ProductHeader label="Produkt B" product={result.second.product} />
      </div>
      <nav aria-label="Hopp til dekning" className="mt-7 min-w-0">
        <p className="mb-2 text-sm font-semibold text-slate-700">Hopp til</p>
        <div className="flex max-w-full gap-2 overflow-x-auto py-2 sm:flex-wrap">
          {sections.map((section) => <a key={section.id} href={`#${section.anchorId}`}
            className="text-link inline-flex min-h-11 shrink-0 items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
            {section.navLabel}
          </a>)}
        </div>
      </nav>
      <h3 className="mt-8 text-xl font-semibold tracking-tight text-slate-950">Dekninger og vilkår</h3>
      {result.differenceCount === 0 && <p className="mt-3 text-sm text-slate-600">Ingen dokumenterte produktforskjeller i kataloggrunnlaget.</p>}
      <div className="mt-5 space-y-8">
        {sections.map((section) => <section key={section.id} id={section.anchorId} tabIndex={-1}
          aria-labelledby={`${section.anchorId}-heading`} className="scroll-mt-6 rounded focus-visible:outline-2 focus-visible:outline-offset-4">
          <h4 id={`${section.anchorId}-heading`} className="border-b border-slate-300 pb-3 text-lg font-semibold text-slate-950">{section.label}</h4>
          <div className="divide-y divide-slate-200">{section.groups.map((group) => <CoverageGroup key={group.id} group={group} result={result} />)}</div>
        </section>)}
      </div>
      <p className="mt-5 text-xs leading-5 text-slate-500">Sammenligningen bygger på offentlige produktvilkår og katalogdata. Pris og individuelle avtalevalg er ikke med.</p>
    </section>
  );
}

export function ProductComparisonWorkspace() {
  const insuranceTypes = useMemo(() => productComparisonInsuranceTypes(), []);
  const [insuranceType, setInsuranceType] = useState("");
  const [first, setFirst] = useState<Selection>(emptySelection);
  const [second, setSecond] = useState<Selection>(emptySelection);
  const [result, setResult] = useState<CatalogProductComparison | null>(null);
  const [error, setError] = useState("");

  function invalidate() {
    setResult(null);
    setError("");
  }

  const firstProduct = first.productIdentity ? findProductComparisonProduct(first.productIdentity) : null;
  const secondProduct = second.productIdentity ? findProductComparisonProduct(second.productIdentity) : null;
  const ready = Boolean(insuranceType && firstProduct && secondProduct);

  function compare() {
    if (!firstProduct || !secondProduct) return;
    try {
      setResult(compareCatalogProducts(firstProduct, secondProduct, productCatalog));
      setError("");
    } catch {
      setResult(null);
      setError("Produktene kunne ikke sammenlignes sikkert fra kataloggrunnlaget.");
    }
  }

  return (
    <>
      <div className="surface-card rounded-2xl border p-5 sm:p-8">
        <h2 className="section-title text-xl font-semibold">Sammenlign produkter</h2>
        <p className="body-copy mt-2">Sammenlign dekninger og vilkår uten kundedokumenter. Pris og individuelle avtalevalg inngår ikke.</p>
        <label className="mt-6 block max-w-md text-sm font-medium text-gray-700">
          Forsikringstype
          <select
            value={insuranceType}
            onChange={(event) => {
              setInsuranceType(event.target.value);
              setFirst(emptySelection());
              setSecond(emptySelection());
              invalidate();
            }}
            className="form-control mt-1 w-full rounded-lg border px-3 py-2 outline-none"
          >
            <option value="">Velg forsikringstype</option>
            {insuranceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>

        {insuranceType && <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ProductSelector side="A" insuranceType={insuranceType} selection={first} onChange={setFirst} onInvalidate={invalidate} />
          <ProductSelector side="B" insuranceType={insuranceType} selection={second} onChange={setSecond} onInvalidate={invalidate} />
        </div>}

        <button type="button" onClick={compare} disabled={!ready} className="primary-button mt-6 w-full rounded-xl px-6 py-3 font-semibold shadow-sm disabled:cursor-not-allowed sm:w-auto">
          Sammenlign dekninger
        </button>
        {!ready && <p className="mt-2 text-sm text-slate-600">Velg forsikringstype og ett entydig katalogprodukt på hver side.</p>}
        {error && <div role="alert" className="error-panel mt-6 rounded-xl border p-4">{error}</div>}
      </div>
      {result && <ProductResult result={result} />}
    </>
  );
}
