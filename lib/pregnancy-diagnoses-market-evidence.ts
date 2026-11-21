import type { CatalogFact, CatalogSource } from "./product-catalog.ts";

const commonDiagnoses = [
  ["downs_syndrom", "Downs syndrom", "Trisomi 21 bekreftet ved kromosomundersøkelse og av spesialist i barnesykdommer (ICD-10 Q90)."],
  ["cerebral_parese", "Cerebral parese", "Diagnosen G80 må stilles i første leveår og bekreftes av spesialist i barnesykdommer eller nevrologi."],
  ["hydrocephalus", "Vannhode (hydrocephalus)", "Medfødt eller oppstått innen én måned etter fødsel, bekreftet av spesialist (Q03, G91 eller G94.0)."],
  ["ryggmargsbrokk", "Ryggmargsbrokk (spina bifida)", "Myelomeningocele som krever kirurgi kort tid etter fødsel (Q05). Isolert meningocele og spina bifida occulta uten nervepåvirkning er unntatt."],
  ["enkammerhjerte", "Enkammerhjerte (UVH)", "Hjerte med ett hjertekammer (Q20.4)."],
  ["fallots_tetrade", "Fallots tetrade", "Kombinasjon av medfødte hjertefeil som oppfyller diagnosekode Q21.3."],
  ["lungearterieatresi", "Atresi av lungearterien", "Lungearterien er ikke utviklet og normal blodstrøm til lungene hindres (Q25.5)."],
  ["transposisjon_store_arterier", "Transposisjon av de store arteriene (TGA)", "Aorta og lungearterien har byttet plass (Q20.3)."],
  ["hypoplastisk_venstre_hjerte", "Hypoplastisk venstre hjertesyndrom (HLHS)", "Betydelig underutviklet venstre hjertehalvdel (Q23.4)."],
  ["alvorlig_fodselsasfyksi", "Alvorlig oksygenmangel ved fødsel", "Vedvarende lav Apgar 0–3 etter fem minutter, HIE grad II eller III og innleggelse på nyfødtintensiv. Diagnose P21.02 må bekreftes av spesialist i barnesykdommer."],
] as const;

const additionalIfDiagnoses = [
  ["misdannelse_spiseror_luftror", "Alvorlig misdannelse av spiserør eller luftrør", "Spiserørsatresi med eller uten fistel, symptomgivende fistel mellom spiserør og luftrør eller total spiserørsmembran (Q39.0, Q39.1, Q39.2 eller Q39.4)."],
  ["misdannelse_galleganger", "Alvorlig misdannelse av gallegangene", "Tett eller sterkt innsnevret hovedgallegang, manglende del av gallegang eller symptomgivende cyste i hovedgallegangen (Q44.2–Q44.4)."],
  ["medfodt_mellomgulvsbrokk", "Medfødt mellomgulvsbrokk", "Mellomgulvsdefekt som fører bukinnhold opp i brysthulen og påvirker pust og lungefunksjon (Q79.0)."],
] as const;

const variants = [
  {
    id: "if-person-gravid-super",
    hash: "08132b98f9354bd32fca89b3ea2341e65ab093ea85d89e7ded215ba769e3f4c3",
    list: "if", page: 4, section: "§ 4.2 – Alvorlig medfødt sykdom (s. 4–5)",
  },
  {
    id: "tryg-person-gravid-ekstra",
    hash: "437122f68004fed8946784da64e4f772f0f0523490b68e900b839abae115cd77",
    list: "tryg", page: 4, section: "§ 2.4 – Utvalgt medfødt diagnose",
  },
  {
    id: "tryg-person-gravid-premium",
    hash: "7ef0564690a01bc17f58205991b1369e951a8c4bd0a97ad3040c7aa588a564f3",
    list: "tryg", page: 4, section: "§ 2.4 – Utvalgt medfødt diagnose",
  },
  {
    id: "if-person-gravid-basis",
    hash: "2ec7d29522c415f2d591f156827cd874310ef7f03640e77578954fffdfd52dec",
    list: "none", page: 3, section: "§ 4 – Hva forsikringen omfatter (s. 3–4)",
  },
  {
    id: "tryg-person-gravid-gratis",
    hash: "02334247425da3c989e20dd7ea6d0b7e6192666226e10d4a90af7feb779ac36f",
    list: "none", page: 1, section: "§ 2 – Hva forsikringen omfatter",
    listSource: {
      id: "person:tryg-person-gravid-gratis:gravid-produktvilkar",
      hash: "764303066ce773f33f47551cc0111e85140937f80b84e45a3e54a5c22f7baa7d",
    },
  },
  {
    id: "storebrand-person-gravid",
    hash: "92678997731c4025c5d6247197fea8661fafab155c97e98d4ec9e1b1bb0a75d6",
    list: "none", page: 1, section: "Dekningsoversikt",
  },
] as const;

export function addPregnancyDiagnosisComparisonFacts(
  sources: Readonly<Record<string, CatalogSource>>,
  facts: Record<string, CatalogFact[]>,
): void {
  for (const variant of variants) {
    const componentId = "person:" + variant.id;
    const base = sources[componentId];
    if (base?.sha256 !== variant.hash || base.agreementScope !== "ordinary" ||
      !base.productIds?.includes(variant.id)) continue;

    const source = "listSource" in variant ? sources[variant.listSource.id] : base;
    if ("listSource" in variant && source?.sha256 !== variant.listSource.hash) continue;
    if (!source || source.agreementScope !== "ordinary" || source.sourceType !== "full_terms" ||
      !source.productIds?.includes(variant.id)) continue;

    const diagnosisFacts = [...commonDiagnoses, ...additionalIfDiagnoses].map(
      ([key, label, diagnosis], index): CatalogFact => {
        const included = variant.list === "if" || (variant.list === "tryg" && index < commonDiagnoses.length);
        const isIfList = variant.list === "if";
        const page = isIfList && index > 0 ? 5 : variant.page;
        const section = isIfList ? "§ 4.2 bokstav " + "abcdefghijklm"[index] : variant.section;
        const value = included ? diagnosis : variant.list === "none"
          ? "Forsikringen har ingen egen engangsutbetaling ved medfødt diagnose."
          : "Diagnosen står ikke i vilkårets liste for engangsutbetaling ved medfødt diagnose.";

        return {
          key: "person.gravid.medfodt." + key,
          label,
          value,
          coverageAvailability: included ? "included" : "unavailable",
          source: {
            documentId: source.id, section, page, filename: source.filename,
            company: source.company, url: source.url, termsNumber: source.termsNumber,
            effectiveFrom: source.effectiveFrom, agreementScope: source.agreementScope,
          },
        };
      },
    );
    facts[componentId] = [...(facts[componentId] ?? []), ...diagnosisFacts];
  }
}
