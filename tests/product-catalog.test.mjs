import assert from "node:assert/strict";
import test from "node:test";
import { catalogProductMatchesSelection, productSuggestions } from "../lib/product-catalog.ts";

test("produktvalg begrenses til valgt selskap og forsikringstype", () => {
  const catalog = {
    companies: ["Selskap A", "Selskap B"],
    insuranceTypes: ["Bil", "Båt"],
    products: [
      { company: "Selskap A", insuranceType: "Bil", name: "Bil Pluss", providerId: "a", productId: "1", version: null },
      { company: "Selskap A", insuranceType: "Båt", name: "Båt Pluss", providerId: "a", productId: "2", version: null },
      { company: "Selskap B", insuranceType: "Bil", name: "Bil Ekstra", providerId: "b", productId: "3", version: null },
    ],
  };

  assert.deepEqual(productSuggestions(catalog, "selskap a", "bil"), ["Bil Pluss"]);
  assert.deepEqual(productSuggestions(catalog, "Selskap A", ""), []);
  assert.deepEqual(productSuggestions(catalog, "Ukjent", "Bil"), []);
});

test("produktmatching krever eksakt provider, canonical type og eksakt produkt", () => {
  const product = {
    company: "Selskap A", insuranceType: "Bil", name: "Kasko",
    providerId: "a", productId: "1", version: null,
  };
  assert.equal(catalogProductMatchesSelection(product, "selskap a", "Bilforsikring", "KASKO"), true);
  assert.equal(catalogProductMatchesSelection(product, "Selskap B", "Bil", "Kasko"), false);
  assert.equal(catalogProductMatchesSelection(product, "Selskap A", "Innbo", "Kasko"), false);
  assert.equal(catalogProductMatchesSelection(product, "Selskap A", "Bil", "Kasko Pluss"), false);
});
