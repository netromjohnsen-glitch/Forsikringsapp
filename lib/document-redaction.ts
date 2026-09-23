type RedactionCategory = "EMAIL" | "PHONE" | "PERSON_ID" | "ACCOUNT" | "KID" | "CUSTOMER_ID" | "NAME" | "ADDRESS";

type Redactor = { redact: (text: string) => string };

function digits(value: string): string {
  return value.replace(/\D/gu, "");
}

function validDatePart(value: string): boolean {
  if (value.length !== 6) return false;
  let day = Number(value.slice(0, 2));
  let month = Number(value.slice(2, 4));
  const year = Number(value.slice(4, 6));
  if (day > 40) day -= 40;
  if (month > 40) month -= 40;
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;
  return Number.isInteger(year);
}

export function isValidNorwegianIdentityNumber(value: string): boolean {
  const number = digits(value);
  if (!/^\d{11}$/u.test(number) || !validDatePart(number.slice(0, 6))) return false;
  const values = [...number].map(Number);
  const first = 11 - [3, 7, 6, 1, 8, 9, 4, 5, 2].reduce((sum, weight, index) => sum + weight * values[index], 0) % 11;
  const firstControl = first === 11 ? 0 : first;
  if (firstControl === 10 || firstControl !== values[9]) return false;
  const second = 11 - [5, 4, 3, 2, 7, 6, 5, 4, 3, 2].reduce((sum, weight, index) => sum + weight * values[index], 0) % 11;
  const secondControl = second === 11 ? 0 : second;
  return secondControl !== 10 && secondControl === values[10];
}

export function createDocumentRedactor(): Redactor {
  const replacements = new Map<string, string>();
  const counts = new Map<RedactionCategory, number>();
  const placeholder = (category: RedactionCategory, value: string) => {
    const key = `${category}\u0000${value.trim().toLocaleLowerCase("nb-NO")}`;
    const current = replacements.get(key);
    if (current) return current;
    const next = (counts.get(category) ?? 0) + 1;
    counts.set(category, next);
    const replacement = `[REDACTED_${category}_${next}]`;
    replacements.set(key, replacement);
    return replacement;
  };

  return {
    redact(text: string) {
      let result = text;
      result = result.replace(/(?<![\w.!#$%&'*+/=?^`{|}~-])[\w.!#$%&'*+/=?^`{|}~-]+@[\w](?:[\w-]{0,61}[\w])?(?:\.[\w](?:[\w-]{0,61}[\w])?)+/giu,
        (value) => placeholder("EMAIL", value));
      result = result.replace(/\+47(?:[ .-]?\d){8}\b/gu, (value) => placeholder("PHONE", value));
      result = result.replace(/\b(?:\d[ .-]?){10}\d\b/gu, (value) =>
        isValidNorwegianIdentityNumber(value) ? placeholder("PERSON_ID", value) : value);

      const labeled = (
        pattern: RegExp,
        category: RedactionCategory,
      ) => { result = result.replace(pattern, (_match, label: string, value: string) => `${label}${placeholder(category, value)}`); };

      labeled(/((?:fødselsnummer|personnummer|fødselsnr\.?|personnr\.?)\s*[:#-]?\s*)((?:\d[ .-]?){10}\d)/giu, "PERSON_ID");
      labeled(/((?:telefon|telefonnummer|mobil|mobilnummer|tlf\.?)\s*[:#-]?\s*)(\+?\d(?:[ .-]?\d){7,11})/giu, "PHONE");
      labeled(/((?:kontonummer|bankkonto|konto(?:nr\.?)?)\s*[:#-]?\s*)((?:\d[ .-]?){10}\d)/giu, "ACCOUNT");
      labeled(/((?:kid|kid-nummer)\s*[:#-]?\s*)(\d(?:[ .-]?\d){5,24})/giu, "KID");
      labeled(/((?:kundenummer|kundenr\.?|polisenummer|polisenr\.?|avtalenummer|avtalenr\.?|tilbudsnummer|tilbudsnr\.?)\s*[:#-]?\s*)([A-ZÆØÅ0-9][A-ZÆØÅ0-9./_-]{3,})/giu, "CUSTOMER_ID");
      labeled(/((?:navn|kunde|forsikringstaker|kontaktperson)\s*[:#-]\s*)([^\r\n]{2,120})/giu, "NAME");
      labeled(
        /((?:adresse|gateadresse|bostedsadresse|postadresse|forsikringsadresse)\s*[:#-]\s*)([^\r\n]{3,160}?)(?=\s+(?:boligtype|areal|byggeår|byggemateriale|dekning|forsikringssum|egenandel|produkt)\s*[:#-]|\r?$)/gimu,
        "ADDRESS",
      );
      return result;
    },
  };
}

export function buildUntrustedDocumentInput(documentTexts: readonly string[]): string {
  const redactor = createDocumentRedactor();
  return documentTexts.map((text, index) =>
    `--- START DOKUMENT ${index + 1}: Dokument ${index + 1} ---\n${redactor.redact(text)}\n--- SLUTT DOKUMENT ${index + 1} ---`
  ).join("\n\n");
}
