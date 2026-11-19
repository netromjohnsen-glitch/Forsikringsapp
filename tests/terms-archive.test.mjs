import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { GET } from "../app/api/vilkar/[provider]/[document]/route.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";
import { memberTermsSourceHref, termsSourceHref } from "../lib/terms-archive.ts";
import { createPilotSession, PILOT_COOKIE_NAME } from "../lib/pilot-access.ts";
import { findCatalogProduct, productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { trygMemberInventories } from "../lib/tryg-member-catalog.ts";

function archiveRequest(provider, document, cookie) {
  const request = new Request("https://tolken.test/api/vilkar/" + provider + "/" + document,
    cookie ? { headers: { Cookie: cookie } } : undefined);
  return GET(request, { params: Promise.resolve({ provider, document }) });
}

test("each archive route resolves only the intended catalogue document and edition", () => {
  const routes = new Set();
  const citations = new Set();
  for (const document of termsArchiveDocuments) {
    const route = "/api/vilkar/" + document.provider + "/" + document.slug;
    assert.match(route, /^\/api\/vilkar\/[a-z0-9-]+\/[a-z0-9-]+$/u);
    assert.ok(!routes.has(route), route);
    routes.add(route);
    for (const [documentId, effectiveFrom, originalUrl] of document.sources) {
      const catalogSource = productCatalog.sources[documentId];
      assert.ok(catalogSource?.sha256, documentId);
      assert.equal(catalogSource.url, originalUrl, documentId);
      assert.equal(catalogSource.effectiveFrom, effectiveFrom, documentId);
      const identity = JSON.stringify([documentId, effectiveFrom, originalUrl]);
      assert.ok(!citations.has(identity), identity);
      citations.add(identity);
      const source = { documentId, effectiveFrom, url: originalUrl, page: 1 };
      const fragment = document.pageAnchors === false ? "" : "#page=1";
      assert.equal(termsSourceHref(source), route + fragment);
      assert.equal(termsSourceHref({ ...source, page: 0 }), route);
      assert.equal(termsSourceHref({ ...source, effectiveFrom: "1900-01-01" }), originalUrl);
      assert.equal(termsSourceHref({ ...source, url: "https://example.test/new.pdf" }), "https://example.test/new.pdf");
      assert.equal(termsSourceHref({ ...source, documentId: "pdf:existing:0", url: undefined }), undefined);
    }
  }
  const helpPage = productCatalog.sources["boat-pet:gjensidige:hund:product"];
  const relatedPdf = productCatalog.sources["boat-pet:gjensidige:hund:treatment"];
  assert.equal(helpPage.url, relatedPdf.url);
  assert.equal(termsSourceHref({ documentId: helpPage.id, effectiveFrom: helpPage.effectiveFrom, url: helpPage.url, page: 0 }), helpPage.url);
});

test("existing Frende links still open the original cited pages", () => {
  for (const [slug, id, version, type] of [
    ["hytte", "frende-hytte-standard", "2026-09-01", "Hytte"],
    ["hytte", "frende-hytte-utvidet", "2026-09-01", "Hytte"],
    ["verdisak", "frende-verdisak", "2026-01-01", "Verdisak"],
  ]) {
    const product = findCatalogProduct("frende", id, version, { insuranceType: type, agreementScope: "ordinary" });
    assert.ok(product, id);
    const terms = resolveCatalogFacts(product, []).filter(fact => fact.source.documentId === product.sourceId);
    assert.ok(terms.length, id);
    for (const { source } of terms) {
      assert.equal(termsSourceHref(source), "/api/vilkar/frende/" + slug + "#page=" + source.page);
    }
  }
});


test("the member list links the exact NITO terms including the equivalent travel URL", () => {
  let bindings = 0;
  for (const document of termsArchiveDocuments) {
    for (const [scope, id, originalUrl, number, date, hash] of document.memberSources ?? []) {
      const member = trygMemberInventories.find(inventory => inventory.agreementScope === scope);
      const product = member?.products.find(item => item.id === id);
      const source = product?.sources.find(entry =>
        entry.url === originalUrl && (entry.documentNumber ?? "") === number &&
        (entry.effectiveDate ?? entry.publicationDate ?? "") === date &&
        (entry.archive?.sha256 ?? "") === hash);
      assert.ok(source, originalUrl);
      const href = "/api/vilkar/" + document.provider + "/" + document.slug;
      assert.equal(memberTermsSourceHref(scope, id, source), href);
      assert.equal(memberTermsSourceHref("utdanningsforbundet", id, source), originalUrl);
      assert.equal(memberTermsSourceHref(scope, "unknown", source), originalUrl);
      assert.equal(memberTermsSourceHref(scope, id, { ...source, documentNumber: "other" }), originalUrl);
      if (source.archive) {
        assert.equal(document.archivePath, "catalog/sources/" + source.archive.path);
        assert.equal(memberTermsSourceHref(scope, id, { ...source, archive: { ...source.archive, path: "other.pdf" } }), originalUrl);
      }
      bindings++;
    }
  }
  assert.equal(bindings, 13);
});

test("authenticated pilot requests serve the exact PDF for every allowed archive route", async t => {
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
  for (const document of termsArchiveDocuments) {
    const { provider, slug } = document;
    assert.equal((await archiveRequest(provider, slug)).status, 401);
    const response = await archiveRequest(provider, slug, cookie);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/pdf");
    assert.equal(response.headers.get("content-disposition"), 'inline; filename="' + provider + "-" + slug + '.pdf"');
    assert.match(response.headers.get("cache-control"), /private.*no-store/u);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    for (const [documentId] of document.sources) assert.equal(sha256, productCatalog.sources[documentId].sha256, documentId);
  }
  assert.equal((await archiveRequest("frende", "__proto__", cookie)).status, 404);
  assert.equal((await archiveRequest("unregistered", "hytte", cookie)).status, 404);
});
