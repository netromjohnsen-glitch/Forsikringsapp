// Brukes bare til å avgjøre om to allerede matchede datapunkter skal
// fremheves som en forskjell. Originalverdier og kilder beholdes urørt.
const plain = (value: string) => value.trim().replace(/\s+/gu, " ")
  .replace(/\.$/u, "").toLocaleLowerCase("nb-NO");

// Slike ord kan uttrykke betingelse, avgrensning eller rekkefølge. Da er
// omstokking av kommaledd ikke et sikkert tegn på materiell likhet.
const materialWords = /(?<!\p{L})(?:ikke|uten|unntatt|med|mindre|kun|bare|innen|etter|før|inntil|maks(?:imalt)?|begrenset|dersom|hvis|må|krever|gjelder|ved|over|under|fra|til)(?!\p{L})/iu;

function simpleEnumeration(value: string): string[] | null {
  const normalized = plain(value);
  if (!normalized.includes(",") || /[\d;:!?()\[\]\/–—-]/u.test(normalized)) return null;
  if ((normalized.match(/\bog\b/gu) ?? []).length > 1) return null;
  const parts = normalized.split(/\s*,\s*|\s+og\s+/u);
  if (parts.length < 3 || parts.length > 8 || parts.some((part) =>
    !/^[\p{L}]+(?: [\p{L}]+){0,3}$/u.test(part) || materialWords.test(part))) return null;
  return parts.sort();
}

export function materiallyEquivalentValues(first: string, second: string): boolean {
  if (plain(first) === plain(second)) return true;
  const left = simpleEnumeration(first);
  const right = simpleEnumeration(second);
  return Boolean(left && right && left.length === right.length &&
    left.every((part, index) => part === right[index]));
}
