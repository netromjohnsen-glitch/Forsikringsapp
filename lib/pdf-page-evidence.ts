const clean = (value: string) => value.normalize("NFKC").toLocaleLowerCase("nb-NO").trim().replace(/[ \t]+/gu, " ");

const editionHeading = /^vilkårs(?:utgave|versjon)(?:\s*[:=]\s*(.+))?:?$/u;

// Some Tryg documents identify the edition by exact terms number and
// effective date, followed by an optional superseded date.
const numberedEdition = /^(?:vilkår )?([a-z0-9]+) gjelder fra (\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2})(?:\.(?: avløser vilkår av \d{1,2}\.\d{1,2}\.\d{4}\.?)?)?$/u;

export function hasDocumentCatalogVersion(text: string, version: string | null, termsNumber?: string): boolean {
  if (!version || !/^\d{4}(?:-\d{2}-\d{2})?$/u.test(version)) return false;
  // The worker separates pages with blank lines. Keep those lines so that
  // a heading cannot borrow its value from the beginning of another page.
  const lines = text.split(/\r?\n/u).map(clean);
  const declarations = lines.flatMap((line, index) => {
    const heading = editionHeading.exec(line);
    if (heading) return [heading[1] ?? lines[index + 1] ?? ""];
    const annual = version.length === 4 && line === "bevis og vilkår" && /^\d{4}$/u.test(lines[index + 1] ?? "");
    if (annual) return [lines[index + 1]];
    const numbered = termsNumber && numberedEdition.exec(line);
    return numbered && numbered[1] === clean(termsNumber) ? [numbered[2]] : [];
  });
  if (!declarations.length) return false;
  if (version.length === 4) return declarations.every(declaration => declaration === version);
  const date = new Date(version + "T00:00:00Z");
  if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== version) return false;
  const [year, month, day] = version.split("-");
  const monthName = date.toLocaleString("nb-NO", { month: "long", timeZone: "UTC" });
  return declarations.every(declaration => {
    const label = declaration.replace(/^vilkår av /u, "");
    const numeric = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/u.exec(label);
    return label === version || Boolean(numeric && Number(numeric[1]) === Number(day) &&
      Number(numeric[2]) === Number(month) && numeric[3] === year) ||
      [day, String(Number(day))].some(d => label === d + ". " + monthName + " " + year);
  });
}
