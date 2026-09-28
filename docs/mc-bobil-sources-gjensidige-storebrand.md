# MC/Bobil source inventory: Gjensidige and Storebrand

Verified 2026-09-28. Source inventory only: source evidence is separate from code and production verification. All downloads are public official artifacts; no customer documents. This inventory uses immutable originals and SHA-256; no PDF text extraction/render is stored in the repository.

## Package gate

| Provider | Type | Scope | Status | Current product levels | Source basis |
|---|---|---|---|---|---|
| Gjensidige | MC | ordinary/private | READY | Ansvar, Delkasko, Kasko | Three current alminnelige PDFs, MOT03 IPID, MC page |
| Gjensidige | Bobil | ordinary/private | READY with isolated IPID discrepancy | Ansvar, Delkasko, Kasko, Pluss | Four current alminnelige PDFs, MOT08 IPID, Bobil page |
| Storebrand | MC | ordinary/private | READY with baggage applicability gap | Ansvar, Delkasko, Kasko | Current MC page, motor09 and gener07 |
| Storebrand | Bobil | ordinary/private | READY | Ansvar, Delkasko, Kasko, Super | Current Bil page with Bobil scope, motor09 and gener07 |

READY means sufficient authoritative material to implement documented product levels and verified facts; it does not mean every conceivable optional extension is quantified. Unresolved details below must remain absent/unresolved.

## Immutable artifact inventory

The complete machine-readable inventory is `catalog/sources/mc-bobil/gjensidige-storebrand-manifest.json`. All paths below are repository-relative. PDF page references are physical PDF pages (one-based), not printed footer numbering. Storebrand physical page 18 has printed footer 17.

| ID / local path | Official URL | SHA-256 | Version / valid from |
|---|---|---|---|
| `catalog/sources/mc-bobil/gjensidige-mc-produkt.html` | https://www.gjensidige.no/forsikring/mc-forsikring | `5fe4383ed92a538c0aea792c549d361202249149e1e5ff4eadf80be06d5a05f3` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-bobil-produkt.html` | https://www.gjensidige.no/forsikring/kjoretoy/bobilforsikring | `fe5e9775c7fab9c8e05a3c7448b3f6b8106839964f169fa76bf910d21a60ed26` | unknown / unknown |
| `catalog/sources/vehicle-extensions/storebrand-mc-forsikring.html` (reused) | https://www.storebrand.no/privat/forsikring/mc-forsikring | `57eee721cf1591ca4728d32446d83df52872e84b21ae40fd9796fa3fddbd163d` | unknown / unknown |
| `catalog/sources/mc-bobil/storebrand-bil-bobil-produkt.html` | https://www.storebrand.no/privat/forsikring/bilforsikring | `3a1592196e9b7c6a3dad7df21c1745881661e8fe0cce0793ff455003fcde32c6` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-mc-kasko-vilkar.pdf` | https://www.gjensidige.no/files/privat/vilkar/kjoretoy/MC-Kasko-alminnelige-vilkar.pdf | `735f518bd45c6470965c1ea6be2f596b6504cee9a09c47718a629ed319db5e58` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf` | https://www.gjensidige.no/files/privat/vilkar/kjoretoy/MC-Delkasko-alminnelige-vilkar.pdf | `45952992dfe399ab2739be019307a485044639516cc7a75dfbbdd030437495e7` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-mc-ansvar-vilkar.pdf` | https://www.gjensidige.no/files/privat/vilkar/kjoretoy/mc-ansvar-alminnelige-vilkar.pdf | `eb31b56bb352906888cace2eb516b4dc336da06f3d3f8414fe4f47b10f4301b1` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-bobil-pluss-vilkar.pdf` | https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bobil-Pluss-alminnelige-vilkar.pdf | `64eff6544529afba60722892de07b2db9ee8c3d0b0123001cbb7dfedfcd7e7d7` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-bobil-kasko-vilkar.pdf` | https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bobil-Kasko-alminnelige-vilkar.pdf | `7971a0170cf272cacec8e9da23633fa630245631d04e99f455b174dd3a2fc734` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-bobil-delkasko-vilkar.pdf` | https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bobil-Delkasko-alminnelige-vilkar.pdf | `978ff27d1df6f978775356ec1a65c164a2d18d2912d1b13bb63b99a110e1f1fd` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-bobil-ansvar-vilkar.pdf` | https://www.gjensidige.no/files/privat/vilkar/kjoretoy/bobil-ansvar-alminnelige-vilkar.pdf | `0b7e01951d751773f3d8afd1175ea2dcf137820a2d440d68f880370c2b369f03` | unknown / unknown |
| `catalog/sources/mc-bobil/gjensidige-mc-MOT03-ipid.pdf` | https://www.gjensidige.no/ipid/gfno/MOT03 | `4c5fca45ee41621e890580e0f3dead02c8bd57440bdac3913912b95a6faafdad` | MOT03 / unknown |
| `catalog/sources/mc-bobil/gjensidige-bobil-MOT08-ipid.pdf` | https://www.gjensidige.no/ipid/gfno/MOT08 | `ca50c2bcf74bed138add832ec6f1605f13e29d3416721dbe57f0696145e50cd6` | MOT08 / unknown |
| `catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf` (reused) | https://www.storebrand.no/privat/forsikring/mc-forsikring/_/attachment/inline/7b20f38c-208d-48ca-97f9-f82fab02216f:e9289744b0f0bb00c7304e715377b4be9a0e85d8/vilkar-motorvognforsikring.pdf | `7673b8ee8fd5329d9e87c0a128a0a5cd4eeefb0721c8c5d8a1dedeb246c041fb` | motor09 / 2025-04-01 |
| `catalog/sources/storebrand/vilkar-generelle.pdf` (reused) | https://www.storebrand.no/privat/forsikring/bilforsikring/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf | `4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754` | gener07 / 2026-09-01 |

## Authority and dates

- Gjensidige's current product pages explicitly distinguish customer-specific full terms (available after obtaining a quote) from the public **alminnelige vilkår** and IPID. The public PDFs are authoritative general product information, not evidence of a customer's choices. In particular, `Utleie er ikke valgt` in a public example must never become the customer's `not_selected`.
- No policy version/effective date is visibly specified in the seven Gjensidige alminnelige PDFs or two IPIDs. Keep these fields unknown. Their technical creation dates (terms: 2026-06-01; generated IPIDs: 2026-09-28) do not establish policy validity.
- Storebrand motor09 explicitly applies from **2025-04-01**, gener07 from **2026-09-01**. Both current downloads matched originals already in the repository. The current MC page also matched the existing HTML byte-for-byte.
- Storebrand motor09 page 1 says the policy covers Bil, Bobil, MC and other listed types; differences are specified where applicable. This permits shared rules only after checking the individual clause and current product-level availability. It does not permit MC Super merely because the shared policy describes Super for Bil/Bobil.
- No separate Storebrand MC/Bobil IPID was linked from the current product pages or terms listing. This is not a blocker where full terms establish the relevant rules. The non-existent dedicated `/bobilforsikring` URL was not used as evidence; Bobil is explicitly described on the Bil page and in motor09.

## Gjensidige MC: verified facts and applicability

Sources: MC Ansvar/Delkasko/Kasko alminnelige PDFs and MOT03. Product page corroborates ordinary light/heavy MC. No MC Pluss, Super, engine-damage add-on, or other unlisted product is established.

| Product scope | Canonical concept | Verified content | Evidence |
|---|---|---|---|
| All three | ansvar | Personal liability unlimited; property liability NOK 100 million; no liability deductible | Each terms PDF p1; MOT03 p1 |
| All three | rettshjelp | NOK 100,000; NOK 4,000 plus 20% deductible; Nordic geographical scope | p1 and Rettshjelp section; MOT03 p2 |
| All three | ulykke | Driver/passenger accident: death NOK 100,000; permanent medical disability NOK 200,000; details and aggregate limits apply | p1 and Ulykke section; MOT03 p1 |
| Delkasko/Kasko | brann / tyveri | Fire, lightning, explosion; theft and attempted theft; deductible NOK 6,000 | Terms p1/p3 |
| Delkasko/Kasko | glass | Glass breakage; repair sum NOK 1,000/no deductible; replacement unbounded sum/NOK 3,000 deductible | Terms p1/p3 |
| Delkasko/Kasko | veihjelp | Assistance on breakdown, damage, theft, driver/passenger illness/accident; deductible NOK 750 | Terms p1/p4 |
| Delkasko/Kasko | mc.bagasje | Personal belongings NOK 5,000, subject to insured peril and locked storage conditions stated on official page | Terms p1; MC page Personlige ting |
| Delkasko/Kasko | utstyr | Extra equipment/rebuilding NOK 10,000; higher sum available by agreement | Terms p1; MC page Ekstrautstyr |
| Kasko | kasko / feilfylling | Sudden external impact; collision/overturning etc.; misfuelling explicitly corroborated on current product page | Kasko p3; page coverage list |
| Delkasko/Kasko | mc.leiekjoretoy | On holiday outside Nordic countries, unrepaired after two working days: similar rental vehicle up to 15 days to finish planned holiday | MC Kasko/Delkasko p4, Veihjelp |
| All three | avtale.geografi | Europe except Kosovo, Russia, Belarus; legal assistance Nordic only | Terms p3; MOT03 p2 |

MOT03 explicitly states inheritance: Delkasko includes Ansvar; Kasko includes Delkasko. Do not infer a customer-specific Kasko deductible from the public example's NOK 8,000: the current page offers NOK 6,000–12,000. Keep the individually agreed deductible authoritative.

**Important negative applicability:** The shared Erstatningsregler page at the end of MC Kasko contains a total-loss guarantee, but explicitly restricts it to registered passenger cars/vans up to 3.5 tonnes and Bobil. It must NOT create MC `nyverdi.alder/km` facts. MC page/MOT03 provide no MC new-value age/km guarantee.

## Gjensidige Bobil: verified facts and applicability

Sources: Bobil Ansvar/Delkasko/Kasko/Pluss PDFs, MOT08, and current Bobil page. Each physical PDF title is Campingbil. Aliasing Campingbil to Bobil is appropriate at type level; it is not a Bil product.

| Product scope | Canonical concept | Verified content | Evidence |
|---|---|---|---|
| All four | ansvar / rettshjelp / ulykke | Personal liability unlimited, property NOK 100m; legal NOK 100k; accident death NOK 100k/disability NOK 200k | Each PDF p1; MOT08 p1 |
| Delkasko/Kasko/Pluss | brann / tyveri / glass / veihjelp | Fire/theft NOK 6,000 deductible; glass replacement NOK 3,000, repair no deductible; assistance NOK 750 | p1/p3 |
| Delkasko/Kasko/Pluss | utstyr | Fixed extra equipment unlimited; fortelt expressly excluded from this category and needs separate extension | p1/p3 |
| Delkasko/Kasko | bobil.losore | NOK 10,000 for belongings, only insured damage/theft events | p1; official page |
| Pluss | bobil.losore | NOK 50,000 for belongings | Pluss p1; official page |
| Kasko/Pluss | kasko / feilfylling | Sudden external impact and insured own damage; misfuelling on product page | p3; official page |
| Kasko/Pluss | nyverdi | Up to 1 year from first registration and 20,000 km; repair cost exceeds current market value; same new vehicle or cash; excludes company-owned/leased vehicle and used-purchase fire/theft | Both PDFs p15, Erstatningsregler |
| Pluss | maskinskade | First main renewal after age 15 from first registration, or 200,000 km, whichever first | p1/p3 |
| Pluss | maskinskade.komponenter | Named engine/transmission/driveline components and electronics; service-history conditions and component exclusions remain material | p3 |
| Pluss | maskinskade.egenandel.kilometer | 0–119,999 km: NOK 10,000; 120,000–159,999: NOK 14,000; 160,000–200,000: NOK 18,000 | p15 table |
| Pluss | bobil.fukt | Walls/roof/floor; Bobil not older than 15 years from production; fault-free moisture test by dealer/Bobil workshop less than one year before discovery | p3 |
| Pluss | bobil.skadedyr | Damage from rodents, insects and other pests | p3 |
| Pluss | bobil.feriegaranti | Insured damage preventing planned holiday longer than six days: documented alternative Bobil/hotel expenses up to NOK 1,500/day, 14 days; lending/rental holiday interruption excluded | p4 |
| Pluss | nokkel | Lost/stolen/damaged key, NOK 15,000; NOK 1,500 deductible; one event per policy year | p1/p3 |
| Kasko/Pluss | leiebil (assistance benefit) | Holiday outside Nordic countries, vehicle unrepaired after three working days: similar rental vehicle up to 15 days to complete holiday | p4 |
| Delkasko/Kasko/Pluss | bobil.utleie (optional availability) | Rental can be added for additional premium; public example's unselected status is not customer evidence | Official page Utleie; MOT08 p1 |
| Delkasko/Kasko/Pluss | bobil.fortelt (optional availability) | Fortelt requires separate extension; no verified fixed sum in these public terms | p3; MOT08 p1 |
| All four | avtale.geografi | Europe excluding Kosovo/Russia/Belarus; legal assistance Nordic only | p3; MOT08 p2 |

MOT08 documents tier inheritance explicitly. Increased belongings/equipment sums, fortelt and rental are possible extensions; do not set them selected from availability. Do not invent an extended sum, rental liability limit, or deductible not shown in a relevant authoritative source.

**Source discrepancy:** MOT08 calls the Pluss total-loss benefit “utvidet totalskade”. Both current Kasko and Pluss full alminnelige terms instead specify **1 year / 20,000 km**, and the current product page agrees. No Bobil 3-year/60,000-km clause was found. Use the full-terms rule and keep the IPID discrepancy documented. The Bil Pluss catalog must not supply Bobil rules.

**Semantic isolation:** Bobil Pluss `maskinskade.km` = coverage ceiling; deductible-table boundaries are separate. Moisture age is from manufacture and is not machine age from first registration. Fourteen holiday-guarantee days are not the separate fifteen-day foreign-holiday rental-car benefit. Customer annual mileage remains independent and has no catalog default.

## Storebrand MC: verified facts and applicability

Current MC page establishes Ansvar, Delkasko, Kasko. motor09 is the shared authoritative policy, not a warrant to expose MC Super. Relevant pages below are physical pages.

| Product scope | Canonical concept | Verified content | Evidence |
|---|---|---|---|
| All three | ansvar | Personal unlimited; property NOK 100m; zero liability deductible | motor09 p3 and p9 §6.1 |
| All three | rettshjelp | NOK 100,000; NOK 4,000 plus 20% of remainder | MC page; motor09 p30–33 §13 |
| All three | ulykke | Driver/passenger accident death NOK 100,000; disability NOK 200,000; under-18 disability NOK 500,000 | MC page; motor09 p5/p27–29 |
| Delkasko/Kasko | brann / tyveri / natur | Fire/lightning/explosion; theft; Nordic natural events; individual conditions and deductibles apply | motor09 §6.2 p9–12 |
| Delkasko/Kasko | mc.kjoreutstyr | Riding suit, helmet, gloves, boots as safety equipment; insured-peril scope, replacement-value rules | motor09 p7 §5; MC page |
| Delkasko/Kasko | utstyr | Fixed additional equipment NOK 20,000, at most 50% of vehicle replacement value | motor09 p7 §5 |
| Delkasko/Kasko | glass | Sudden breakage, max 50% vehicle replacement value; replacement NOK 3,000 deductible, repair zero | motor09 p12 §6.2.4 |
| Delkasko | veihjelp | Nordic assistance; NOK 750 deductible | motor09 p10–12 §6.2.3; MC page |
| Kasko | veihjelp | Assistance in the European countries where cover applies; NOK 750 deductible | motor09 p11–12 §6.2.3; MC page |
| Kasko | kasko / feilfylling | Collision/overturning/vandalism/misfuelling or other sudden external impact; builds on Delkasko | motor09 p12 §6.3 |

**Do not import:** Bobil moisture/holiday/belongings clauses; MC Super; Bil/Bobil-specific machine damage; generic total-loss age/km unless exact MC applicability is separately proven.

**Baggage ambiguity:** MC product page explicitly says baggage/goods transported with the MC are not covered. motor09 page 7 has a generic baggage row under a shared policy that says it applies to all listed vehicle types unless specified otherwise; §6.4.6 explicitly excludes MC from *extended* baggage. Neither transferring the generic NOK 10,000 amount to MC nor presenting a resolved generic negative from the page alone is sufficiently clear. Omit/unresolve `mc.bagasje` until applicability is clarified by Storebrand. Riding protective equipment is expressly included and is a different concept.

**Optional rental:** §7 is explicitly conditional on the insurance certificate. The MC page does not establish MC rental offering; do not infer an available MC rental add-on merely from a shared Bil/Bobil rental table.

## Storebrand Bobil: verified facts and applicability

The current Bil product page has an explicit “Ekstra for bobil” section; motor09 page 1 expressly includes Bobil and §6.4.8 contains its specific Super rules. Baseline Ansvar/Delkasko/Kasko/Super follows this applicable product structure and §6.3/6.4 inheritance.

| Product scope | Canonical concept | Verified content | Evidence |
|---|---|---|---|
| All four | ansvar / rettshjelp / ulykke | Shared liability/legal/accident rules as above | motor09 p1/3/5 and §§6.1,12,13 |
| Delkasko/Kasko/Super | brann / tyveri / glass / natur | Shared applicable insured perils, as above; use full clauses | §§6.2.1–6.2.5 |
| Delkasko | veihjelp | Nordic assistance | §6.2.3 p10–12 |
| Kasko/Super | veihjelp | European assistance in covered countries | §6.2.3 p10–12 |
| Delkasko/Kasko | bobil.losore | Bobil baggage/belongings NOK 30,000 | p7 §5, explicit Bobil row |
| Super | bobil.losore | Bobil belongings NOK 100,000 | p7; p18 §6.4.8(3) |
| Delkasko/Kasko | utstyr | Fixed extra equipment NOK 20,000, max 50% vehicle replacement value | p7 §5 |
| Super | utstyr | Fixed extra equipment NOK 50,000, max 50% vehicle replacement value | p17 §6.4.7 |
| Kasko | kasko / feilfylling | Own damage including misfuelling, inherits Delkasko | p12 §6.3 |
| Kasko | nyverdi (withheld) | Summary table shows 1 year / 15,000 km, but detailed §10.3 restricts it to vehicles registered as person-/varebil; do not assume Bobil applicability | p4/13 tables; p24–25 §10.3 |
| Super | nyverdi | 3 years / 60,000 km; new-registered to policyholder; listed repair/previous-damage conditions; not leased | p13–14 §6.4.1 |
| Super | maskinskade | Up to 200,000 km and until age 12 from first registration; included named components, service and exclusions | p14–16 §6.4.3 |
| Super | maskinskade.egenandel.kilometer | 0–99,999 km NOK 8,000; 100,000–149,999 NOK 15,000; 150,000–200,000 NOK 20,000 | p16 §6.4.3 |
| Super | bobil.fukt / bobil.vann | Bobil newer than 8 years from production; leak from fresh/wastewater/heating pipes; moisture cover up to 1 year after approved caravan-dealer test; frost excluded | p18 §6.4.8(1) |
| Super | bobil.fukt.egenandel | NOK 8,000 | p18 §6.4.8(1) |
| Super | bobil.feriegaranti | Insured damage after holiday starts; documented alternative accommodation NOK 1,500/day, remaining planned days max 15 | p18 §6.4.8(2) |
| Super | nokkel | NOK 20,000, deductible NOK 1,000; exclusions include merely forgotten key and technical fault alone | p16–17 §6.4.4 |
| Super | parkering | Unknown other vehicle, known time/place, approved workshop; NOK 25,000 without bonus loss; chosen Kasko deductible | p17 §6.4.5 |
| Kasko/Super | leiebil (optional) | Certificate-selected class C or extended class I; normally max 60 repair days; special workshop/time limits and alternative cash rules | p18–19 §7; current page explicitly Valgfritt |

Do not publish Bobil private rental, pests or fortelt as included without a specific verified applicable clause. Do not interpret Storebrand's generic luggage row (NOK 10,000/20,000) as Bobil limits: the explicit Bobil NOK 30,000/100,000 row governs. No member products are modeled.

## Known gaps and implementation safeguards

1. Preserve unknown version/dates for Gjensidige. A retrieval date identifies a snapshot, not the customer's applicable policy version.
2. Keep public Gjensidige example fields (`Utleie er ikke valgt`, sample Kasko deductible) out of customer-choice defaults.
3. Gjensidige Bobil Pluss IPID “extended total loss” is not sufficient to create a higher limit than current full terms.
4. Storebrand MC baggage applicability unresolved; MC Super and MC optional rental not established and must not be synthesized.
5. No customer-specific policy terms are fetched; per-customer agreement details stay authoritative.
6. Reuse current byte-identical Storebrand artifacts; do not modify originals or their existing source manifests.
7. Future catalog provenance must identify the precise physical page and section and explicitly constrain provider, insuranceType, ordinary scope, product tier, and add-on where applicable.
8. No production verification or code-level implementation claim is made by this source inventory.

## Implemented catalog and verification

`lib/mc-bobil-gjensidige-storebrand-catalog.ts` materializes 14 products and four optional add-ons using the shared MC/Bobil adapter. It contains 417 facts across 18 product/add-on components. There are 17 type-scoped source metadata records from 15 physical artifact records: 12 new public originals, three reused existing originals. Eleven physical artifacts directly supply facts; the remaining four establish product structure, authority or general terms. The manifest records every component/key/page/section use separately from artifact counts.

| Provider | MC products | Bobil products | Optional additions implemented |
|---|---|---|---|
| Gjensidige | Ansvar, Delkasko, Kasko | Ansvar, Delkasko, Kasko, Pluss | Bobil Utleie and Fortelt; availability requires actual selection |
| Storebrand | Ansvar, Delkasko, Kasko | Ansvar, Delkasko, Kasko, Super | Bobil Leiebil and Utvidet leiebil, exclusive alternatives on Kasko/Super |

Products are explicitly materialized, with no implicit inheritance assumptions. Product IDs and optional eligibility use canonical provider/type/level IDs. Every source metadata record has exact type and ordinary agreement scope; shared Storebrand PDF bytes have separate MC/Bobil source IDs.

Additional conservative omission: Storebrand **Kasko** new-value settlement is not supplied for Bobil because §10.3 (physical p24–25) specifically limits its 1-year/15,000-km guarantee to registered passenger cars/vans. A generic summary table is insufficient to resolve whether any given Bobil satisfies that registration condition. Super §6.4.1 uses the broader kjøretøy scope and does not repeat this registration restriction.

`tests/mc-bobil-gjensidige-storebrand.test.mjs` adds 33 tests. They cover every product level; exact aliases and ordinary scope; shared-source/type boundaries; optional availability versus selection; full-terms precedence over vague IPID wording; source hashes; moisture/machine/deductible/holiday limit separation; and conservative omission of unsupported cross-type guarantees. These are **CODE VERIFIED** controls over separately **SOURCE VERIFIED** rows. No production verification is claimed.
