# MC/Bobil source inventory: Tryg and If

Verified 2026-09-28. Ordinary/private scope only. Source collection and design gate precede implementation. All original bytes are immutable; this inventory and the manifest carry metadata separately. Retrieval dates are not invented effective dates.

## Package gate

| Provider/type | Status | Product tiers | Full terms | Add-ons / constraints |
|---|---|---|---|---|
| Tryg MC | READY | Ansvar, Delkasko, Kasko, MC Ekstra | PAU20900/25405/27010 2026-07-01; PAU25935 2026-01-01 | Optional driver/passenger accident; Extra extends Kasko |
| Tryg Bobil | READY | Ansvar, Delkasko, Kasko, Bobil Ekstra | PAU18800/27007 2026-07-01; PAU25335/25305 2026-01-01 | Maskinskade PAU27110 2026-08-01 and accident are optional |
| If MC | READY | Ansvar, Delkasko, Kasko | MOT2-2 2024-03; SV692 2020-11, currently linked | Motor/gir only medium/heavy MC with Kasko |
| If Bobil | READY | Ansvar, Delkasko, Kasko, Super | MOT2-2 2024-03; SV707 2022-06, currently linked | Motor/gir and leiebil optional, including on Super |

## Original-artifact inventory

28 metadata records: 22 new physical artifacts and 6 byte-identical existing artifacts reused. Each row records source identity, exact origin and original SHA-256. The manifest uses repository-relative localPath; a reused artifact may have a legacy display filename in its original catalog.

| Source / scope | Document / effective date or version | Local artifact | SHA-256 | Official URL |
|---|---|---|---|---|
| tryg mc product_page | not stated; unknown | `catalog/sources/mc-bobil/tryg-mc-product.html` | `488ed14be555a30a6706e08bc81dc55d85d06cdcae7f0da7d5cd2f8b6b081b75` | [tryg-mc-product.html](https://www.tryg.no/forsikringer/kjoretoy/mc-forsikring) |
| tryg mc terms_index | not stated; unknown | `catalog/sources/mc-bobil/tryg-mc-terms-index.html` | `2bdb096f09c08c6c93640cf6e7f5cd3abf871d3ece7b86ee32cba9471f1d1110` | [tryg-mc-terms-index.html](https://www.tryg.no/forsikringer/kjoretoy/mc-forsikring/vilkar) |
| tryg bobil product_page | not stated; unknown | `catalog/sources/mc-bobil/tryg-bobil-product.html` | `9bcce0eea60c4dd61628fb29d82d27c21ef8b1ee89f5bf3a9dfd86c8de10f385` | [tryg-bobil-product.html](https://www.tryg.no/forsikringer/kjoretoy/bobilforsikring) |
| tryg bobil terms_index | not stated; unknown | `catalog/sources/mc-bobil/tryg-bobil-terms-index.html` | `7ec847e8afccfc3160100cdf66490eb7224342729f635669b6a5cf73e549ae76` | [tryg-bobil-terms-index.html](https://www.tryg.no/forsikringer/kjoretoy/bobilforsikring/vilkar) |
| tryg mc/bobil terms | PAU25003; 2024-07-01 | `catalog/sources/tryg/Bilforsikring-Ansvar.pdf` | `c024994aa75d6dd5a6f6fd8349589a19afb3d7e6d69ab133dbb280c57342b3d6` | [tryg-05PAU25003.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25003&vilk=Ansvar-MC) |
| tryg mc terms | PAU25935; 2026-01-01 | `catalog/sources/mc-bobil/tryg-05PAU25935.pdf` | `7996b6796ba109c322b0382576da6fe3f63145b8fb1342378d5683df82cfbb30` | [tryg-05PAU25935.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25935&vilk=Delkasko-MC) |
| tryg mc terms | PAU25405; 2026-07-01 | `catalog/sources/mc-bobil/tryg-05PAU25405.pdf` | `917b3381e5792c10decfdeceb3c8af3bb70b4703d0c15406dd972c55321411c0` | [tryg-05PAU25405.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25405&vilk=Kasko-MC) |
| tryg mc terms | PAU27010; 2026-07-01 | `catalog/sources/mc-bobil/tryg-05PAU27010.pdf` | `75657812b727c1346472dac5464fd8077826e114e7fe00679e6ac2d2aee97c8b` | [tryg-05PAU27010.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU27010&vilk=Ekstra-MC) |
| tryg mc/bobil terms | PAU28003; 2024-07-01 | `catalog/sources/tryg/Fører- og Passasjerulykke.pdf` | `d3b347f12c14756916de04c0a5a595d34bf8c082ff8d59dc1e2f02d07cfa8f52` | [tryg-05PAU28003.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU28003&vilk=Forerogpassasjerulykke) |
| tryg mc terms | PAU20900; 2026-07-01 | `catalog/sources/mc-bobil/tryg-05PAU20900.pdf` | `4c65a011cc69f0fae49ff18d0a5f877b2d3aedfcdc1624c543d87f9ca03a2b35` | [tryg-05PAU20900.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU20900&vilk=Produktvilkaar-MC) |
| tryg mc terms | 000PA209; unknown | `catalog/sources/mc-bobil/tryg-05000PA209.pdf` | `54f601c4e8e1bc415029b2c4d9787e359719507948774a102f719c6c691900c0` | [tryg-05000PA209.pdf](https://www.tryg.no/odpdf?vilkNr=05000PA209&vilk=MC-Sikkerhetsforskrift) |
| tryg mc/bobil terms | PGE91000; 2024-07-01 | `catalog/sources/tryg/hus/05PGE91000.pdf` | `b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320` | [tryg-05PGE91000.pdf](https://www.tryg.no/odpdf?vilkNr=05PGE91000&vilk=Generelle-vilkaar) |
| tryg mc/bobil terms | PGE91500; 2026-01-01 | `catalog/sources/tryg/hus/05PGE91500.pdf` | `bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291` | [tryg-05PGE91500.pdf](https://www.tryg.no/odpdf?vilkNr=05PGE91500&vilk=Rettshjelp) |
| tryg bobil terms | PAU25335; 2026-01-01 | `catalog/sources/mc-bobil/tryg-05PAU25335.pdf` | `2a1cd47ccbfbb5ea8532500d3b964fac22a2ede5d34fcffb2046899185fd0e48` | [tryg-05PAU25335.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25335&vilk=Delkasko-bobil) |
| tryg bobil terms | PAU25305; 2026-01-01 | `catalog/sources/mc-bobil/tryg-05PAU25305.pdf` | `cd521eb44c91f9ab6a0fd9c06513b1e1e076355efdb2fe130ed222c80c25edea` | [tryg-05PAU25305.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25305&vilk=Kasko-bobil) |
| tryg bobil terms | PAU27007; 2026-07-01 | `catalog/sources/mc-bobil/tryg-05PAU27007.pdf` | `a14a3404fceef8c42d91fb4ec95906e06b87edcfc13188e697e01855aa99f404` | [tryg-05PAU27007.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU27007&vilk=Ekstra-bobil) |
| tryg bobil terms | PAU27110; 2026-08-01 | `catalog/sources/tryg/Bilforsikring-Maskinskade.pdf` | `2aa1b0b720c552de29409db06dfdd89c97a57a27a2b669576f3e15f90b21c71d` | [tryg-05PAU27110.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU27110&vilk=Maskinskade-bobil) |
| tryg bobil terms | PAU18800; 2026-07-01 | `catalog/sources/mc-bobil/tryg-05PAU18800.pdf` | `2549ebec8fae718e4f8d3e8a1b46aacb359a3292f35dea71999ac1595cc53fec` | [tryg-05PAU18800.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU18800&vilk=Produktvilkaar-Bobil) |
| tryg bobil terms | 000PA188; unknown | `catalog/sources/mc-bobil/tryg-05000PA188.pdf` | `04ebb4d9cc9d8a3fe157a128ef5b56c97f3ae544c79ea62cac2574c64e1f6e6d` | [tryg-05000PA188.pdf](https://www.tryg.no/odpdf?vilkNr=05000PA188&vilk=Bobil-Sikkerhetsforskrift) |
| tryg mc ipid | not stated; 2025-07-01 (document version; no separate effective date) | `catalog/sources/mc-bobil/tryg-mc-ipid.pdf` | `f02f83205dd20bd896c21266fa6b8b2782644fd70f2780032f91ffa0081ef6d3` | [tryg-mc-ipid.pdf](https://www.tryg.no/system/files/download/pdf/ipid/IPID-Motorsykkelforsikring.pdf) |
| tryg bobil ipid | not stated; 2025-04-01 (document version; no separate effective date) | `catalog/sources/mc-bobil/tryg-bobil-ipid.pdf` | `ec3a019f57f6a8c424aa60611ddecbe4027f4768071668fc816cca1f64a07790` | [tryg-bobil-ipid.pdf](https://www.tryg.no/system/files/download/pdf/ipid/IPID-Bobilforsikring.pdf) |
| if mc product_page | not stated; unknown | `catalog/sources/mc-bobil/if-mc-product.html` | `0c78b98294568d71be4765fcec9ddeffd4c26614d79c4eaecdf914bd11355cb3` | [if-mc-product.html](https://www.if.no/privat/forsikring/kjoretoy/mc-forsikring) |
| if bobil product_page | not stated; unknown | `catalog/sources/mc-bobil/if-bobil-product.html` | `6ab8554b61adb169ad925a551e4ca404f3edc3c0f3cd57d59ffabc8994a63623` | [if-bobil-product.html](https://www.if.no/privat/forsikring/kjoretoy/bobilforsikring) |
| if mc/bobil terms | MOT2-2; 2024-03 | `catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf` | `57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987` | [if-MOT2-2.pdf](https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kj%C3%B8ret%C3%B8yforsikring) |
| if mc terms | SV692; 2020-11 | `catalog/sources/mc-bobil/if-SV692.pdf` | `ac91470a3859045cd1ab64300bca5ba34531f73faed7965f00797bb89de6f419` | [if-SV692.pdf](https://if.no/apps/vilkarsbasendokument/Vilkaar?dt=2020-11-07&vilkaar=SV692) |
| if bobil terms | SV707; 2022-06 | `catalog/sources/mc-bobil/if-SV707.pdf` | `a4e2c6ecafc88fafbb5a0e194a373c4e2953b920d2947582352bdf845a03154e` | [if-SV707.pdf](https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=SV707) |
| if mc ipid | not stated; unknown | `catalog/sources/mc-bobil/if-mc-ipid.pdf` | `b7d77964328489ec76b1512fbe5ac59302ac75514e0fb71ce36040299850c4f2` | [if-mc-ipid.pdf](https://if.no/apps/vilkarsbasendokument/IPID?ipid=Motorsykkelforsikring) |
| if bobil ipid | not stated; unknown | `catalog/sources/mc-bobil/if-bobil-ipid.pdf` | `c408c2633b793713aeedd4c592fd6ccd97c5e6457b257592789a2aae4f0028a7` | [if-bobil-ipid.pdf](https://if.no/apps/vilkarsbasendokument/IPID?ipid=Bobilforsikring) |

## Source authority and applicability decisions

- Official Tryg term-index pages connect the downloaded component PDFs to exactly MC or Bobil. The Ansvar, accident, general and legal-expense PDFs are shared artifacts but must be referenced by type-specific components. Current source packages are ordinary products. No member-product facts are taken from discounts or membership pages.
- Tryg actual retrieved bytes supersede stale search snippets: MC Kasko/Extra and Bobil Extra are dated July 2026, not 2024/2025. All effective-dated downloaded terms are already in force at verification date. The two safety documents state document codes but no effective date; keep dates unknown. Tryg MC IPID is 2025-07-01; Bobil IPID 2025-04-01.
- If MOT2-2 pp2,4 explicitly lists covered vehicle types and base inheritance (Delkasko includes Ansvar; Kasko includes Delkasko). MC requires SV692; Bobil requires SV707. MOT2-2 section 4.9/4.10 additions are for personbil/varebil/bobil, not automatic MC applicability. MC motor/gir is separately defined by SV692.
- If IPIDs are undated. They confirm product levels/add-on structure but do not supply a fabricated validity date. Both special terms remain directly linked by current official product pages despite their older original effective dates.
- If Bobil page contradicts itself: top feature says new replacement below 100,000 km; table says 60,000 km. Applicable MOT2-2 section 4.11.1 (p11), incorporated by SV707 section 3.3, states **before 60,000 km and within three years**. Use full-term value with its provenance; do not create a competing catalog fact from the contradictory marketing sentence.
- If Bobil IPID labels some motor limits under “Super” while also identifying motor/gir as optional. Full terms and current product table explicitly require selection of this add-on even on Super. Availability must not imply selected.
- If MC page says motor/gir available for all MC under seven years, but full SV692 section 2 and IPID restrict it to medium/heavy MC. Preserve this restriction, never infer cover for lightweight MC.
- Tryg MC IPID depicts enhanced accident benefits in Extra. Full PAU27010 p2 explicitly conditions increased invalidity sum on a separately agreed accident cover. Never let MC Extra alone set optional accident cover selected.

## Evidence-backed facts for later catalogs

References below are one-based PDF pages and exact section/subheading. Product inheritance is structural; customer choices always remain authoritative.

### Tryg MC

- All levels: PAU25003 p1 §1 covers statutory liability, unlimited personal injury and other damage up to NOK100m, and legal expenses. PAU20900 p1 §3 limits geography to Europe except Russia, Belarus and Turkey; legal expenses to Nordics. PGE91500 pp4–5 §6 gives ordinary dispute limit100k (250k with at least three co-parties) and 4k +20% excess deductible.
- Delkasko: PAU25935 p1 §1: fixed accessories10k; loose items/luggage10k in lockable luggage box. §§2.1–2.2 fire/theft6k deductible unless lower agreed. §2.3 glass only three/four-wheel MC, windshield excluded; replacement3k/repair0. P2 §2.4 roadside assistance750, transport max50% vehicle value; road-access requirement.
- Kasko: PAU25405 p1 §2.1 collision/off-road/overturn/vandalism/misfuelling/sudden external damage; breakdown/frost excluded; certificate determines deductible. Pp3–4 §3.4 new replacement requires first year on policyholder, no more10k km, repair estimate >80% new replacement value; theft unresolved three weeks also covered, lease excluded. These are coverage limits, never annual mileage/odometer.
- MC Ekstra: PAU27010 p1 §1 motor/transmission/drivetrain plus electronic control units: damage before eight years from first registration;4k deductible under three years,6k from three through seven. Wear/corrosion/tuning/recoverable warranty/ordinary Kasko loss excluded. Unknown third-party parked damage without bonus loss before six years. Rental car or MC500/day, normal repair max10days. Luggage30k and fixed accessories50k. Long-trip spare-part transport3k (minimum three hours from home).
- Extra p2: engine cleaning after wrong fuel15k/1k deductible; MC key20k/1k deductible. Hospital lump-sum5k after at least48hours. If optional accident cover is agreed, invalidity sum500k at disability above25%; does not establish the choice itself.
- Optional driver/passenger accident: PAU28003 pp1–2 §§1–3: invalidity200k; death100k within one year; vehicle-use scope and specified illness/injury exclusions.

### Tryg Bobil

- Same liability/legal-expense and geographic rules, via Bobil product PAU18800 rather than MC product.
- Delkasko: PAU25335 p1 §1 includes fitted interior and purpose-built awning/terrace; fixed extras10k; loose items/personal belongings15k total/5k item. Fire/theft6k default. Awning-theft exclusions: canvas, or when vehicle removed. Underslag requires declared rental; missing three months, family/employee excluded. P2 §§2.3–2.4 glass3k replacement/0 repair and roadside750/max50% vehicle value.
- Kasko: PAU25305 p1 §2.1 adds collision/overturn/sudden external damage and insects/rodents/other pests. Breakdown, frost/power-cut excluded. Agreed deductible; +5k for driver under23 unless policyholder. §3.3 p4 uses market-value settlement; **no separate new-for-old age/km guarantee documented**.
- Bobil Ekstra: PAU27007 p1 §1 fixed extras plus extra wheels50k combined; loose/personal100k,10k item,15k in awning;1k deductible. Loose/baggage cover excluded during rental. Key20k per insurance year/1k deductible; wrong-fuel engine cleaning15k/1k.
- Extra moisture: roof/wall/floor damage within15years of first registration. Deductible8k before10years; thereafter25%, minimum8k. Awning/terrace, pipe leakage/breakage and frost excluded. Do not equate with internal-water cover.
- Extra interrupted holiday: documented necessary additional rental/stay2k/day, remaining planned holiday max14days after covered damage; no rental-use cover. Provider does not procure rental vehicle.
- Optional maskinskade: PAU27110 p1 §1 to200k km or through insurance period turning10years, whichever first. P2 excludes habitation equipment/installations; deductible10k up to120k km,14k120–160k,18k160–200k. Deductible bands must remain isolated from200k coverage cap. Applies only when chosen alongside Kasko.

### If MC

- Base levels: MOT2-2 p4 §4 documents inheritance; statutory liability/legal expenses/accident included at Ansvar; Delkasko adds fire/theft/vandalism/nature/glass/assistance; Kasko adds accidental external damage. Legal-expense4k+20% and ordinary fire/theft/Kasko8k are default terms, certificate may override; glass3k/0, roadside750 (pp18–19 §8.5). Geography p3 §2 excludes Kosovo/Russia/Belarus/Asian Turkey; legal expenses Nordics.
- SV692 p1 §1 expressly adds helmet, suit, gloves, boots, back protector and airbag garments. Current page specifies unlimited protective-clothing sum. MOT2-2 p3 §3.4 has combined extras/baggage40k capped50% vehicle value; do not misrepresent this as40k for each category.
- Motor/gir optional for medium/heavy MC at Kasko only (SV692 p1 §2). Covers specified sudden mechanical/electrical component damage. Damage at age8+ excluded (§2.3 p2); acquisition below7years from IPID. §2.6 p2 deductible4k after age deduction10/15/20/30% at respective <5/5/6/7-year bands; age counted from Jan1 after purchase as new. Repair capped at pre-loss replacement value (§2.7 pp2–3). No MC coverage-km maximum stated: do not borrow Bobil200k.
- SV692 p3 §4.1 approved extra lock reduces theft deductible2k. §4.2 special10k increases for breach of declared youngest driver/only-driver condition; these are conditional deductibles.

### If Bobil

- MOT2-2 base inheritance as above. Ordinary extras/baggage40k combined, max50% vehicle value, p3 §3.4. SV707 p2 §1 additionally covers attached building construction40k; do not copy campingvogn-only transport rules to Bobil.
- Super: MOT2-2 pp11–12 §4.11 incorporated by SV707 §3.3: replacement within3years/before60k km; exact damage/lease/settlement clauses remain attached. Key/misfuelling/charging cable1k deductible; accident and parked-damage combined20k per event; parked damage from unknown vehicle, known time/location, chosen Kasko deductible, no bonus loss.
- SV707 pp2–3 §3.3.1 internal fresh/waste/heating-water leakage requires no moisture check; other moisture needs approved professional check and is covered up to one year after check; vehicle younger15years from production. Frost/snow-load excluded. Keep moisture age separate from motor/new-value age.
- §3.3.2 p3 holiday guarantee reimburses alternate stay/rental1.5k/day max15remaining planned days after covered damage. §3.3.3 combined extras/baggage100k. §3.3.4 unforeseen insects/rodents; loose items only if vehicle damaged simultaneously. §4 exclusions include theft from canvas awning and loose-property-only accidental damage.
- Optional leiebil: SV707 p2 §3.2 max45days for repair/total loss/theft; overrides90-day general vehicle wording. MOT2-2 p10 §4.10 car class up to500/day, optional200/day cash max15days; no glass-only claim.
- Optional motor/gir: SV707 p2 §3.1 incorporates MOT2-2 §§4.9.1–4.9.7 pp7–10: coverage until200k km;8k deductible after0/10/20/30% mileage deductions at <100k/100k/150k/175k. Do not invent a coverage-age maximum from purchase-age: page separately states purchase before15years/<150k km. Various subcomponents limited100k remain component limits, never annual mileage.
- Rental must be declared: SV707 p5 §6.2.1 unagreed rental adds10k deductible; MOT2-2 Super excludes rental vehicles. Therefore no unconditional rental inclusion inferred from marketing FAQ. Annual distance in IPID5k-to-unlimited is customer-selectable, not catalog-filled customer mileage.

## Gaps and implementation cautions

The four source packages are usable READY; that does not itself prove code implementation. Unknown source dates remain explicit (If IPIDs/product pages and Tryg safety documents). No MC “Super” is invented for If. No Tryg Bobil nyverdi age/km is invented. If Bobil page and IPID conflicts are resolved by scoped full terms with recorded authority. Products must not select optional accident/motor/rental merely because they are offered. If higher-order age wording is kept textual, preserve its exact age basis rather than over-normalizing.

Source evidence has been read from complete original PDFs. Key pages for MC new value, MC motor age/deductible, Bobil moisture and holiday limits were rendered to images and visually checked; scratch text/renders stayed under `/tmp`. Download process used official URLs with no account/session/cookies. No private documents were accessed.

## Implemented catalog and verification

`lib/mc-bobil-tryg-if-catalog.ts` exports `trygIfMcBobilCatalog`: 15 products, seven level-scoped add-on definitions, 31 scoped source metadata records and 479 materialized facts. These are not 479 distinct source propositions: common verified rows are materialized separately for each exact type/level to avoid ambiguous inheritance across versions. The manifest's `catalogUsage` lists every actual component and canonical key using each artifact; `sourceIds` maps reused artifacts to their separate type-scoped metadata.

| Provider/type | Implemented canonical product IDs | Optional add-on IDs |
|---|---|---|
| Tryg MC | tryg-mc-ansvar, tryg-mc-delkasko, tryg-mc-kasko, tryg-mc-mc-ekstra | tryg-mc-ulykke (lower levels), tryg-mc-ulykke-ekstra (MC Ekstra) |
| Tryg Bobil | tryg-bobil-ansvar, tryg-bobil-delkasko, tryg-bobil-kasko, tryg-bobil-bobil-ekstra | tryg-bobil-ulykke; tryg-bobil-maskinskade (Kasko/Extra) |
| If MC | if-mc-ansvar, if-mc-delkasko, if-mc-kasko | if-mc-motor-gir (Kasko only; source restriction medium/heavy MC retained) |
| If Bobil | if-bobil-ansvar, if-bobil-delkasko, if-bobil-kasko, if-bobil-super | if-bobil-leiebil, if-bobil-motor-gir (Kasko/Super) |

Additional verified baseline: If MOT2-2 §8.4.2 p18 explicitly applies to `kjøretøy`, with both MC and Bobil named in the document's scope (p2). Baseline replacement for covered total damage is within one year and no more than15,000km, repair cost above80% original purchase price. Neither SV692 nor SV707 excludes these vehicle types from this clause; their repair-specific rules do not replace this totalskade clause. This baseline is present on Delkasko/Kasko physical-cover components, and If Bobil Super replaces it with §4.11.1's three-year/60,000km guarantee. Rental, lease and other actual clause restrictions remain attached.

The focused provider suite contains47 tests: every tier, exact provider/type/agreement lookup, manual options, optional unknown/explicit status, document-over-catalog, type-specific replacement limits, correct rental versus holiday duration, full-term authority, negative cross-type add-ons, verified page/hash metadata and unknown date handling. All47 passed locally. Full-system validation is performed by the coordinating implementation task; no production/deployment claims are made here.

Not individually materialized as new canonical facts: Tryg hospital lump-sum and long-trip spare-part transport subbenefits, If conditional driver/extra-lock deductible increases, general repair guarantee/settlement clauses, and declaration-dependent rental permissions. These remain available in original source artifacts/inventory. No selection is inferred from rental permission or accident availability. These detail omissions do not invent blanket exclusions or modify the source rules.
