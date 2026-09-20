import { groupTerms } from "./comparison.ts";
import type { Difference, InsuranceGroup, TermGroup } from "./comparison.ts";
import type { MatchingPlan } from "./hybrid-matching.ts";

// Navn på dekningsfamilier, uavhengig av selskapets ordlyd i enkeltfeltene.
// Andre familier kan bruke felles navnestamme i feltenes etiketter.
const coverageTitles: Record<string, string> = { nyverdi: "Totalskadegaranti" };

// Hovedvisningen kan vekte dokumenterte forskjeller ulikt per forsikringstype,
// uten å endre selve sammenligningen eller detaljdataene. Kategoriene bygger på
// kanoniske dekningsnøkler og er derfor uavhengige av selskap og produktnavn.
function innboPresentationPriority(difference: Difference): number {
  const key = difference.termKey || "";
  const withinCategory = Math.min(difference.priority, 199);
  if (key === "innbo.forsikringssum") return 2_400 + withinCategory;
  if (/^innbo\.(?:verdigjenstander|tilleggsinnredning)\./u.test(key)) return 2_300 + withinCategory;
  if (/^uhell\./u.test(key)) return 2_200 + withinCategory;
  if (/^tyveri\.utenforhjem\./u.test(key)) return 2_100 + withinCategory;
  if (/^sykkel\./u.test(key)) return 2_000 + withinCategory;
  if (/^tyveri\.uteareal\./u.test(key)) return 1_900 + withinCategory;
  if (/^utleie\./u.test(key)) return 1_850 + withinCategory;
  if (/^(?:tyveri\.(?:fellesbod|privatbod|fellesgarasje)|innbo\.lagring\.)/u.test(key)) {
    return 1_800 + withinCategory;
  }
  if (/^skadedyr\./u.test(key)) return 1_700 + withinCategory;
  if (/^flytting\./u.test(key)) return 1_600 + withinCategory;
  if (/(?:^|\.)egenandel(?:\.|$)/u.test(key) || difference.kind === "deductible") return 1_500 + withinCategory;
  if (/^(?:ansvar|rettshjelp)\./u.test(key)) return 1_400 + withinCategory;
  return 1_000 + withinCategory;
}

function housePresentationPriority(difference: Difference): number {
  const key = difference.termKey || "";
  const withinCategory = Math.min(difference.priority, 199);
  if (/^hus\.(?:forsikringsform|forsikringssum)$/u.test(key)) return 2_500 + withinCategory;
  if (/^hus\.plutselig\./u.test(key)) return 2_400 + withinCategory;
  if (/^hus\.(?:vann|ror)\./u.test(key)) return 2_300 + withinCategory;
  if (/^hus\.vatrom\./u.test(key)) return 2_250 + withinCategory;
  if (/^hus\.takvegg\./u.test(key)) return 2_200 + withinCategory;
  if (/^hus\.rate(?:_|\.)/u.test(key)) return 2_100 + withinCategory;
  if (/^hus\.skadedyr\./u.test(key)) return 2_050 + withinCategory;
  if (/^hus\.aldersfradrag\./u.test(key)) return 2_000 + withinCategory;
  if (/^hus\.(?:naturskade|vaer)\./u.test(key)) return 1_900 + withinCategory;
  if (/^hus\.(?:bygninger|andrebygninger|hage|teknisk)\./u.test(key)) return 1_800 + withinCategory;
  if (/^hus\.(?:pabud|gjenoppforing|rydding)\./u.test(key)) return 1_700 + withinCategory;
  if (/^hus\.utleie\./u.test(key)) return 1_600 + withinCategory;
  if (/(?:^|\.)egenandel(?:\.|$)/u.test(key) || difference.kind === "deductible") return 1_500 + withinCategory;
  if (/^hus\.(?:ansvar|rettshjelp|sikkerhet)\./u.test(key)) return 1_200 + withinCategory;
  return 1_000 + withinCategory;
}

function presentationPriority(difference: Difference): number {
  if (difference.insuranceKey === "innbo") return innboPresentationPriority(difference);
  if (difference.insuranceKey === "bolig") return housePresentationPriority(difference);
  return difference.priority;
}

function commonCoverageTitle(age: TermGroup, distance: TermGroup, family: string): string | null {
  if (coverageTitles[family]) return coverageTitles[family];
  const stem = (label: string) => label.match(/^(.*?)\s+[–-]\s+(?:alder|kilometer(?:grense)?|km)$/iu)?.[1]?.trim();
  const ageStem = stem(age.label);
  return ageStem && ageStem === stem(distance.label) ? ageStem : null;
}

function comparablePair(age: TermGroup, distance: TermGroup): boolean {
  return Boolean(age.first && age.second && distance.first && distance.second &&
    age.firstValueCount === 1 && age.secondValueCount === 1 &&
    distance.firstValueCount === 1 && distance.secondValueCount === 1);
}

// Bare visningslaget slår sammen rader. groupTerms og detaljvisningen beholder
// separate effektive verdier, grunnverdier og kildehenvisninger per datapunkt.
export function presentImportantDifferences(
  differences: Difference[],
  groups: InsuranceGroup[],
  matchingPlan: MatchingPlan | null,
  firstCompany: string | null,
  secondCompany: string | null,
): Difference[] {
  let result = [...differences];
  const sameCompany = firstCompany && secondCompany &&
    firstCompany.toLocaleLowerCase("nb-NO") === secondCompany.toLocaleLowerCase("nb-NO");
  const firstLabel = sameCompany ? `Eksisterende ${firstCompany}` : firstCompany || "Eksisterende";
  const secondLabel = sameCompany ? `Nytt tilbud ${secondCompany}` : secondCompany || "Nytt tilbud";

  for (const group of groups) {
    if (group.first.length !== 1 || group.second.length !== 1) continue;
    const terms = groupTerms(group, matchingPlan);
    const byKey = new Map(terms.map((term) => [term.key, term]));
    for (const age of terms) {
      if (!age.key.endsWith(".alder")) continue;
      const family = age.key.slice(0, -".alder".length);
      const distance = byKey.get(`${family}.km`);
      if (!distance || !comparablePair(age, distance)) continue;
      const title = commonCoverageTitle(age, distance, family);
      if (!title) continue;
      const included = result.filter((difference) => difference.kind === "term" &&
        difference.insuranceKey === group.key &&
        (difference.termKey === age.key || difference.termKey === distance.key));
      if (!included.length) continue;
      const firstIndex = result.indexOf(included[0]);
      const grouped: Difference = {
        title,
        text: `${firstLabel}: ${age.first} / ${distance.first} mot ${secondLabel}: ${age.second} / ${distance.second}.`,
        type: "tradeoff",
        kind: "term",
        insuranceKey: group.key,
        priority: Math.max(...included.map((difference) => difference.priority)),
      };
      result = result.filter((difference) => !included.includes(difference));
      result.splice(firstIndex, 0, grouped);
    }
  }
  return result.map((difference) => ({
    ...difference,
    priority: presentationPriority(difference),
  }));
}
