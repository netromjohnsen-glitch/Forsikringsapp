import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { GET } from "../app/api/vilkar/frende/[document]/route.ts";
import { frendeTermsArchive, termsSourceHref } from "../lib/frende-terms-archive.ts";
import { createPilotSession, PILOT_COOKIE_NAME } from "../lib/pilot-access.ts";
import { findCatalogProduct, productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";

const documents = [
  { slug: "hytte", products: ["frende-hytte-standard", "frende-hytte-utvidet"], version: "2026-09-01", type: "Hytte" },
  { slug: "verdisak", products: ["frende-verdisak"], version: "2026-01-01", type: "Verdisak" },
];

function archiveRequest(document, cookie) {
  return GET(new Request("https://tolken.test/api/vilkar/frende/" + document,
    cookie ? { headers: { Cookie: cookie } } : undefined), { params: Promise.resolve({ document }) });
}

test("the archive link keeps the cited PDF page for the exact catalogue editions", () => {
  for (const { slug, products, version, type } of documents) {
    for (const id of products) {
      const product = findCatalogProduct("frende", id, version, { insuranceType: type, agreementScope: "ordinary" });
      assert.ok(product, id);
      const terms = resolveCatalogFacts(product, []).filter(fact => fact.source.documentId === product.sourceId);
      assert.ok(terms.length > 0, id);
      for (const { source } of terms) {
        assert.match(source.url, /^https:\/\/api\.frende\.no\//u);
        assert.equal(termsSourceHref(source), "/api/vilkar/frende/" + slug + "#page=" + source.page);
        assert.equal(termsSourceHref({ ...source, page: 0 }), "/api/vilkar/frende/" + slug);
        assert.equal(termsSourceHref({ ...source, effectiveFrom: "2020-01-01" }), source.url);
      }
    }
  }
  const other = { documentId: "frendeHus", effectiveFrom: "2026-09-01", page: 4, url: "https://frende.no/" };
  assert.equal(termsSourceHref(other), other.url);
  assert.equal(termsSourceHref({ ...other, url: undefined }), undefined);
});

test("only a pilot session can open the two exact PDF originals", async t => {
  t.mock.method(process, "cwd", () => fileURLToPath(new URL("..", import.meta.url)));
  const previousCode = process.env.PILOT_ACCESS_CODE;
  const previousSecret = process.env.PILOT_SESSION_SECRET;
  process.env.PILOT_ACCESS_CODE = "synthetic-test-pilot";
  process.env.PILOT_SESSION_SECRET = "synthetic-test-pilot-session-secret";
  t.after(() => {
    if (previousCode === undefined) delete process.env.PILOT_ACCESS_CODE;
    else process.env.PILOT_ACCESS_CODE = previousCode;
    if (previousSecret === undefined) delete process.env.PILOT_SESSION_SECRET;
    else process.env.PILOT_SESSION_SECRET = previousSecret;
  });

  const cookie = PILOT_COOKIE_NAME + "=" + createPilotSession();
  for (const document of frendeTermsArchive) {
    assert.equal((await archiveRequest(document.slug)).status, 401);
    const response = await archiveRequest(document.slug, cookie);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/pdf");
    assert.match(response.headers.get("content-disposition"), /^inline; filename="Frende-.+\.pdf"$/u);
    assert.match(response.headers.get("cache-control"), /private.*no-store/u);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.equal(createHash("sha256").update(bytes).digest("hex"), productCatalog.sources[document.documentId].sha256);
  }
  assert.equal((await archiveRequest("__proto__", cookie)).status, 404);
});
