import { formatPortfolioPrice, type PortfolioPrice } from "../../lib/portfolio-price-presentation.ts";

export function PortfolioPriceList({ price }: { price: PortfolioPrice }) {
  return <div className="mt-3 text-sm">
    <p className="mb-3 text-xs text-slate-500">Beregnet årspris for analyserte objekter</p>
    <dl className="space-y-2">{price.components.filter(component => component.expected > 0).map(component => <div key={component.key} className={`flex flex-wrap justify-between gap-2 ${component.key === "premie.total" ? "border-t border-slate-200 pt-2 font-semibold" : ""}`}>
      <dt>{component.label}</dt><dd className="min-w-0 tabular-nums">
        {component.completeness === "conflicting" ? "Motstridende prisopplysninger" : component.amount === null ? "Ikke dokumentert" : formatPortfolioPrice(component.amount)}
        {component.completeness === "partial" && <span className="block text-xs font-normal">Delsum · {component.priced} av {component.expected} objekter priset</span>}
      </dd>
    </div>)}</dl>
    {price.documented.value !== null && <p className="mt-3 text-xs">{price.documented.origin === "manual_agreement" ? "Registrert avtaletotal" : "Dokumentert avtaletotal"}: {price.documented.value}</p>}
    {price.conflict && <p role="note" className="mt-2 text-sm">Dokumentert avtaletotal og beregnet porteføljesum stemmer ikke overens. Prisforskjellen kan ikke avgjøres sikkert.</p>}
    {price.failedDocuments > 0 && <p role="note" className="mt-2 text-xs">Ikke alle dokumenter ble analysert. Summene er ufullstendige.</p>}
  </div>;
}
