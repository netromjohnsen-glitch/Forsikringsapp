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
  type CatalogProductComparison,
  type ProductComparisonRow,
  type ProductComparisonSource,
} from "@/lib/catalog-product-comparison";

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

function ProductValue({ row, side, showSources = true }: { row: ProductComparisonRow; side: "first" | "second"; showSources?: boolean }) {
  const value = row[side];
  return (
    <div className={side === "first" ? "difference-side-existing rounded-lg px-4 py-4" : "difference-side-offer rounded-lg px-4 py-4"}>
      <p className={side === "first" ? "existing-label text-xs font-semibold uppercase tracking-wide" : "offer-label text-xs font-semibold uppercase tracking-wide"}>
        {side === "first" ? "Produkt A" : "Produkt B"}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{value.text}</p>
      {showSources && value.sources.map((source) => <ProductSource key={`${source.documentId}-${source.page}-${source.section}`} source={source} label={`${row.label} – ${side === "first" ? "Produkt A" : "Produkt B"}`} />)}
    </div>
  );
}

function DifferenceRow({ row, showLabel = true, showSources = true }: { row: ProductComparisonRow; showLabel?: boolean; showSources?: boolean }) {
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

function ProductResult({ result }: { result: CatalogProductComparison }) {
  return (
    <section className="surface-card mt-8 rounded-2xl border p-5 sm:p-8" aria-labelledby="product-comparison-result">
      <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.12em]">Produktsammenligning</p>
      <h2 id="product-comparison-result" className="section-title mt-1 text-2xl font-semibold">{result.insuranceType}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <ProductHeader label="Produkt A" product={result.first.product} />
        <span className="text-sm font-medium text-slate-500">mot</span>
        <ProductHeader label="Produkt B" product={result.second.product} />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">Viktigste forskjeller</h3>
        {result.importantSections.length === 0 ? (
          <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Ingen dokumenterte produktforskjeller i kataloggrunnlaget.</p>
        ) : (
          <div className="mt-3 divide-y divide-slate-200">
            {result.importantSections.map((section) => section.rows.length === 1 ? (
              <div key={section.id} className="py-5">
                <h4 className="text-base font-semibold text-slate-950">{section.label}</h4>
                <DifferenceRow row={section.rows[0]} showLabel={false} />
              </div>
            ) : (
              <details key={section.id} className="group">
                <summary className="cursor-pointer list-none py-5 marker:hidden [&::-webkit-details-marker]:hidden">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-base font-semibold text-slate-950">{section.label}</h4>
                    <span className="text-link shrink-0 text-sm font-semibold"><span className="group-open:hidden">Se detaljer</span><span className="hidden group-open:inline">Skjul</span></span>
                  </div>
                  <div className="mt-3 group-open:hidden">
                    <DifferenceRow row={section.rows[0]} showLabel showSources={false} />
                  </div>
                </summary>
                <div className="expanded-detail-area pb-5">
                  <div className="divide-y divide-slate-100">{section.rows.map((row) => <DifferenceRow key={row.key} row={row} />)}</div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      <details className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
        <summary className="text-link cursor-pointer rounded font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">Vis detaljert sammenligning</summary>
        <div className="mt-5 space-y-7">
          {result.sections.map((section) => (
            <section key={section.id} aria-labelledby={`product-detail-${section.id.replace(/[^a-z0-9]+/giu, "-")}`}>
              <h4 id={`product-detail-${section.id.replace(/[^a-z0-9]+/giu, "-")}`} className="font-semibold text-slate-950">{section.label}</h4>
              <div className="mt-2 divide-y divide-slate-100">{section.rows.map((row) => <DifferenceRow key={row.key} row={row} />)}</div>
            </section>
          ))}
        </div>
      </details>
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
