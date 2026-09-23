import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PDF_FILE_BYTES,
  MAX_PDF_REQUEST_BYTES,
  PdfSecurityError,
  pdfParserError,
  preparePdf,
  validateAggregatePdfBytes,
  validateParsedPdf,
  validateParsedPdfSide,
  validatePdfFileList,
  validateRequestContentLength,
} from "../lib/pdf-upload-security.ts";

const pdf = (name = "test.pdf", bytes = "%PDF-1.7\nsyntetisk") =>
  new File([bytes], name, { type: "application/pdf" });

test("falsk PDF med pdf-navn avvises med 415", async () => {
  await assert.rejects(() => preparePdf(pdf("falsk.pdf", "ikke en pdf")), (error) =>
    error instanceof PdfSecurityError && error.status === 415 && error.code === "invalid_pdf_signature");
});

test("for stor fil og samlet request avvises med 413", () => {
  const large = new File([new Uint8Array(MAX_PDF_FILE_BYTES + 1)], "stor.pdf", { type: "application/pdf" });
  assert.throws(() => validatePdfFileList([large]), (error) => error instanceof PdfSecurityError && error.status === 413);
  assert.throws(() => validateRequestContentLength(String(MAX_PDF_REQUEST_BYTES + 1)), (error) =>
    error instanceof PdfSecurityError && error.status === 413);
  const first = { size: 13 * 1024 * 1024 };
  const second = { size: 13 * 1024 * 1024 };
  assert.throws(() => validateAggregatePdfBytes([[first], [second]]), (error) =>
    error instanceof PdfSecurityError && error.status === 413);
});

test("mer enn ti PDF-er per side avvises kontrollert", () => {
  assert.throws(() => validatePdfFileList(Array.from({ length: 11 }, (_, index) => pdf(`${index}.pdf`))), (error) =>
    error instanceof PdfSecurityError && error.status === 413 && error.code === "too_many_files");
});

test("gyldig PDF-signatur godtas før parsing", async () => {
  const prepared = await preparePdf(pdf());
  assert.equal(new TextDecoder("ascii").decode(prepared.data.subarray(0, 5)), "%PDF-");
});

test("kryptert og korrupt PDF får ufølsom 422", () => {
  const encrypted = pdfParserError({ name: "PasswordException", message: "secret.pdf password" });
  const corrupt = pdfParserError({ name: "InvalidPDFException", message: "raw document bytes" });
  assert.equal(encrypted.status, 422);
  assert.equal(encrypted.code, "encrypted_pdf");
  assert.doesNotMatch(encrypted.message, /secret\.pdf/u);
  assert.equal(corrupt.status, 422);
  assert.equal(corrupt.code, "invalid_pdf");
  assert.doesNotMatch(corrupt.message, /raw document/u);
});

test("PDF uten tekst, for mange sider og for mye tekst avvises", () => {
  assert.throws(() => validateParsedPdf(1, "   "), (error) =>
    error instanceof PdfSecurityError && error.status === 422 && error.code === "missing_text_layer");
  assert.throws(() => validateParsedPdf(151, "Forsikringsdokument med lesbar tekst"), (error) =>
    error instanceof PdfSecurityError && error.status === 413 && error.code === "too_many_pages");
  assert.throws(() => validateParsedPdf(1, "x".repeat(500_001)), (error) =>
    error instanceof PdfSecurityError && error.status === 413 && error.code === "too_much_text");
});

test("samlede side- og tekstgrenser håndheves", () => {
  assert.throws(() => validateParsedPdfSide([126, 125], ["lesbar tekst", "lesbar tekst"]), (error) =>
    error instanceof PdfSecurityError && error.code === "too_many_pages");
  assert.throws(() => validateParsedPdfSide([1, 1], ["x".repeat(400_000), "y".repeat(350_001)]), (error) =>
    error instanceof PdfSecurityError && error.code === "too_much_text");
});
