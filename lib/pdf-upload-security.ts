export const MAX_PDF_FILES_PER_SIDE = 5;
export const MAX_PDF_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_PDF_REQUEST_BYTES = 25 * 1024 * 1024;
export const MAX_PDF_PAGES_PER_FILE = 150;
export const MAX_PDF_PAGES_PER_SIDE = 250;
export const MAX_PDF_TEXT_CHARS_PER_FILE = 500_000;
export const MAX_PDF_TEXT_CHARS_PER_SIDE = 750_000;

export class PdfSecurityError extends Error {
  readonly status: 413 | 415 | 422;
  readonly code: string;

  constructor(
    status: 413 | 415 | 422,
    code: string,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type PreparedPdf = { data: Uint8Array };

export function validateRequestContentLength(value: string | null): void {
  if (!value) return;
  const bytes = Number(value);
  if (!Number.isSafeInteger(bytes) || bytes < 0) throw new PdfSecurityError(422, "invalid_content_length", "Ugyldig request.");
  if (bytes > MAX_PDF_REQUEST_BYTES) {
    throw new PdfSecurityError(413, "request_too_large", "Opplastingen er for stor. Maks samlet størrelse er 25 MiB.");
  }
}

export function validatePdfFileList(files: readonly File[]): void {
  if (files.length === 0) throw new PdfSecurityError(422, "missing_pdf", "Legg til minst én PDF på hver PDF-side.");
  if (files.length > MAX_PDF_FILES_PER_SIDE) {
    throw new PdfSecurityError(413, "too_many_files", "Du kan laste opp maksimalt 5 PDF-er per side.");
  }
  for (const file of files) {
    if (file.size > MAX_PDF_FILE_BYTES) {
      throw new PdfSecurityError(413, "file_too_large", "En PDF er for stor. Maks filstørrelse er 10 MiB.");
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new PdfSecurityError(415, "unsupported_file_type", "Alle opplastede filer må være gyldige PDF-er.");
    }
  }
}

export function validateAggregatePdfBytes(fileGroups: readonly (readonly File[])[]): void {
  const total = fileGroups.flat().reduce((sum, file) => sum + file.size, 0);
  if (!Number.isSafeInteger(total) || total > MAX_PDF_REQUEST_BYTES) {
    throw new PdfSecurityError(413, "request_too_large", "Opplastingen er for stor. Maks samlet størrelse er 25 MiB.");
  }
}

export async function preparePdf(file: File): Promise<PreparedPdf> {
  let data: Uint8Array;
  try {
    data = new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new PdfSecurityError(422, "unreadable_pdf", "PDF-en kunne ikke leses.");
  }
  const signature = new TextDecoder("ascii").decode(data.subarray(0, 5));
  if (signature !== "%PDF-") {
    throw new PdfSecurityError(415, "invalid_pdf_signature", "Filen er ikke en gyldig PDF.");
  }
  return { data };
}

export function validateParsedPdf(pageCount: number, text: string): void {
  if (!Number.isSafeInteger(pageCount) || pageCount < 1) {
    throw new PdfSecurityError(422, "invalid_pdf", "PDF-en er korrupt eller kan ikke leses.");
  }
  if (pageCount > MAX_PDF_PAGES_PER_FILE) {
    throw new PdfSecurityError(413, "too_many_pages", "PDF-en har for mange sider. Maks er 150 sider per fil.");
  }
  if (text.length > MAX_PDF_TEXT_CHARS_PER_FILE) {
    throw new PdfSecurityError(413, "too_much_text", "PDF-en inneholder for mye tekst for pilotversjonen.");
  }
  if (text.trim().length < 20) {
    throw new PdfSecurityError(422, "missing_text_layer", "PDF-en har ikke et lesbart tekstlag. Bruk en søkbar PDF.");
  }
}

export function validateParsedPdfSide(pageCounts: readonly number[], texts: readonly string[]): void {
  const pages = pageCounts.reduce((sum, value) => sum + value, 0);
  const characters = texts.reduce((sum, value) => sum + value.length, 0);
  if (pages > MAX_PDF_PAGES_PER_SIDE) {
    throw new PdfSecurityError(413, "too_many_pages", "PDF-ene har samlet for mange sider. Maks er 250 sider per side.");
  }
  if (characters > MAX_PDF_TEXT_CHARS_PER_SIDE) {
    throw new PdfSecurityError(413, "too_much_text", "PDF-ene inneholder samlet for mye tekst for pilotversjonen.");
  }
}

export function pdfParserError(error: unknown): PdfSecurityError {
  const candidate = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const name = typeof candidate.name === "string" ? candidate.name : "";
  if (/password/i.test(name)) {
    return new PdfSecurityError(422, "encrypted_pdf", "PDF-en er passordbeskyttet eller kryptert og kan ikke analyseres.");
  }
  return new PdfSecurityError(422, "invalid_pdf", "PDF-en er korrupt eller kan ikke leses.");
}
