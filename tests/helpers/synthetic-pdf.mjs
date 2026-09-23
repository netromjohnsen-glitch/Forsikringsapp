export function syntheticPdf(pageCount = 1, text = "Bil Kasko. Hus. Innbo. Reise. Test insurance document.") {
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", ""];
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    const pageId = objects.length + 1;
    const contentId = pageId + 1;
    const fontId = pageId + 2;
    pages.push(pageId + " 0 R");
    const content = `BT /F1 12 Tf 50 700 Td (${text}) Tj ET`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    );
  }
  objects[1] = `<< /Type /Pages /Kids [${pages.join(" ")}] /Count ${pageCount} >>`;
  let pdf = "%PDF-1.7\n";
  const offsets = [0];
  for (const [i, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => String(offset).padStart(10, "0") + " 00000 n \n").join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Uint8Array(Buffer.from(pdf));
}
