# MC/Bobil source inventory: Fremtind and Frende

Verified 2026-09-28. Public official artifacts only; no customer documents. Original bytes are immutable. Inventory with exact origin/resolved URLs, local paths, SHA-256, document dates, versions and package status is `catalog/sources/mc-bobil/fremtind-frende-manifest.json`. Retrieval date is not a document version. Original PDFs were read and representative two-column coverage/exclusion pages visually inspected.

## Source gate and representation

| Provider | Distributor | Type | Scope | Source status | Verified levels | Add-ons |
|---|---|---|---|---|---|---|
| Fremtind Forsikring AS | SpareBank 1 | MC | ordinary-sparebank1 | READY | Ansvar, Delkasko (Minikasko in IPID/terms), Kasko | No separate MC add-on established; driver/passenger accident and Kasko rental car included |
| Fremtind Forsikring AS | DNB | Bobil | ordinary-dnb | READY | Ansvar, Minikasko, Kasko, Topp/Toppkasko | Leiebil, Maskinskade conservatively optional per active IPID; webpage differs |
| Frende Skadeforsikring AS | Frende | MC | ordinary | READY | Ansvar, Delkasko, Kasko | Fører-/passasjerulykke on all three levels |
| Frende Skadeforsikring AS | Frende | Bobil | ordinary | READY | Ansvar, Delkasko, Kasko, Utvidet | Leiebil/ferieavbrudd and Maskinskade on Kasko/Utvidet; Utvidet itself is an explicitly named package over Kasko |

READY means enough current authoritative evidence for tiers and representative facts, not every possible rule. Use provider `fremtind`, not a new DNB/SB1 insurer. Scope names distinguish only verified ordinary distributed products. No existing Bil/Hus/Innbo/Reise provider migration. LOfavør is separately advertised on SB1's source page but is excluded. No NITO/Utdanningsforbundet data.

## Original source matrix

Exact hashes are in the manifest. All original HTML page dates remain unknown. New copies use `catalog/sources/mc-bobil/`; hash-identical existing files are referenced directly.

| Inventory name | Local artifact | Authority and printed version/date |
|---|---|---|
| fremtind-sb1-mc-page.html | same name in mc-bobil | Product page, unknown document date; explicitly links terms for new purchase today |
| fremtind-mc-terms.pdf | same name in mc-bobil | Full terms; core PMO-357.000-006 29.10.2023; Minikasko PMO-357.110-013 10.07.2023; Kasko PMO-357.120-010 22.01.2024; bonus PMO-004.412-008 18.09.2025; accident FMO-002.401-003 01.04.2019; liability FMO-001.100-007 29.10.2023; legal FFE-003.001-003 01.01.2025 |
| fremtind-mc-ipid.pdf | same name in mc-bobil | IPID V.104, date not printed |
| fremtind-dnb-bobil-page.html | same name in mc-bobil | Product page, date unknown; directly links all four tier PDFs and IPID |
| fremtind-bobil-ansvar.pdf | catalog/sources/sparebank1-fremtind/Vilkar_ansvar_bil.pdf | Full terms PMO-357.001-004 18.09.2025 plus shared liability/accident/legal components |
| fremtind-bobil-minikasko.pdf | catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf | Full terms PMO-357.210-012 18.09.2025; explicit Bobil subclauses |
| fremtind-bobil-kasko.pdf | catalog/sources/sparebank1-fremtind/Vilkar_Kasko_Bil.pdf | Full terms PMO-357.220-007 18.09.2025 |
| fremtind-bobil-topp.pdf | same name in mc-bobil | Full terms PMO-350.210-011 18.09.2025; Bobil-specific Topp component |
| fremtind-bobil-ipid.pdf | catalog/sources/sparebank1-fremtind/IPID_Bil.pdf | IPID V.106, no printed date; DNB links it as Bobil product information |
| fremtind-bobil-leiebil.pdf | catalog/sources/sparebank1-fremtind/Vilkar_leiebil.pdf | Optional full rider PMO-350.402-003 18.09.2025 |
| fremtind-bobil-maskinskade.pdf | catalog/sources/sparebank1-fremtind/Vilkar_maskinskade.pdf | Optional full rider PMO-350.201-001 18.09.2025 |
| frende-mc-page.html | same name in mc-bobil | Product page, no printed date |
| frende-bobil-page.html | same name in mc-bobil | Product page, no printed date |
| frende-mc-terms.pdf, frende-bobil-terms.pdf | catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf | Both current official APIs return exactly the existing common vehicle PDF, SHA-256 088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88; printed 01.01.2026, no separate document number |
| frende-mc-ipid.pdf | same name in mc-bobil | IPID updated 01.01.2026; not older search result `Motorsykkel_omaDcsy.pdf` 2024 |
| frende-bobil-ipid.pdf | same name in mc-bobil | IPID updated 01.01.2026 |
| frende-mc-mileage.html | same name in mc-bobil | Official subordinate product page; date unknown |

18 inventory entries, 10 new immutable artifacts, 8 reused entries (including the common Frende terms twice). Identical-file reuse does not authorize cross-type facts.

## Fremtind MC verified fact inventory

Primary [full terms](https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_MC.pdf), supported by [active SB1 page](https://www.sparebank1.no/nb/bank/privat/forsikring/mc-motorsykkelforsikring.html) and [IPID](https://dokument.fremtind.no/ipid/IPID_Motorsykkel.pdf).

- All levels: MC geography Europe, Turkey, Israel (p1 §2); legal assistance Nordic countries (p9 §2). Do not replace with Bobil geography.
- Ansvar: person unlimited, property NOK100m per event (p2 liability §2.1); driver/passenger accident adults NOK200k invalidity, children under20 NOK1m, death NOK100k with spouse/partner/child under20 else NOK50k (p3 accident §2). IPID explicitly includes accident in Ansvar.
- Legal expenses: NOK100k/tvist, NOK250k for at least3 parties same side (p10 §5.1); deductible certificate plus20% legal/expert expense (p11 §5.2).
- Delkasko includes fire/lightning/explosion, theft and associated vandalism, rescue. Fastened additional equipment is limited to NOK10k; riding gear is separately listed among insured equipment with no separate cap in that clause (p4 Minikasko §1.2); contents in attached locked box/bag NOK5k, excludes money/jewellery/watches (p5 §1.3). Do not copy veteran car contents or moped-car facts.
- Glass subsection applies only veteran vehicle/moped-car/tractor (p5 §2.3), therefore do not include MC glass from shared PDF.
- Rescue at home and after breakdown; wrong fuel tank drain/clean limit NOK10k; engine damage after starting with wrong fuel excluded from rescue (p6 §2.4). Rescue deductible NOK500 (p7 §4.3).
- Kasko accidental external vehicle damage (p8 §1.1). Explicit machine breakdown exclusion. MC-specific §1.2 separately includes rental car NOK350/day, normal repair duration max15d, prior approval (p8). The generic exclusion of rental expense in §1.1 does not remove this explicit MC exception.
- Customer chooses Kasko deductible from certificate. Page lists 4000/7000/10000/15000 choices; never populate a customer-specific chosen value from options. Undisclosed under23 driver adds NOK12k (p8 §3.1).
- IPID explicitly lists wrong-fuel damage in Kasko; keep source-specific provenance if catalogued separately from rescue.
- No MC maskinskade add-on, rental motorcycle, annual mileage default or Bobil-only facts proven. LOfavør NOK1000 deductible benefit excluded.

## Fremtind Bobil verified fact inventory

Primary DNB-linked [Topp Bobil full terms](https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bobil.pdf), which contains base tiers; [DNB page](https://www.dnb.no/forsikring/kjoretoy/bobilforsikring) establishes tier identity/distribution, not authority over conflicting terms.

- All levels Europe except Turkey/Kosovo/Russia/Belarus (p1 §2); legal assistance Nordic (p10). Liability, accident, legal amounts correspond to explicitly shared components listed above.
- Minikasko: fire/theft/vandalism; glass and rescue; fixed equipment NOK50k or certificate value (p4 §1.2). Bobil awning/annex NOK50k; no theft protection when Bobil removed; belongings NOK40k/maxNOK10k per item, excludes money/gift cards/securities/jewellery/watches (p4 §§1.2–1.3).
- Kasko: accidental external collision/overturning/wrong fuel (§1.1 p8). Basic replacement rules (p5 Minikasko §3.2.1): <=1year / <=15000km / repair>80% replacement value; not leased. These rules apply to covered losses, not new all-risk damage under Minikasko.
- Topp: belongings NOK100k/maxNOK10k per item (p8 §1.1); key NOK15k (p9 §2.1.1); key deductible NOK1k (p10 §4.1); unknown third party parking no bonus loss to first renewal after6years, time/place known (p9 §2.1.4).
- Topp holiday interruption: alternative accommodation NOK1500/day for remaining planned holiday max15days after covered damage (p9 §2.1.6); not same concept as rental vehicle.
- Topp moisture roof/walls/floor: passed authorized caravan dealer moisture inspection, cover for1year after inspection; excludes vehicle older15years and outside policy period (p9 §2.1.7).
- Topp replacement: <=3years / <=100000km / repair>80%, not leased (p9–10 §3.1); not 60000km from another provider.
- Machine rider (PMO-350.201-001 p1) optional: first renewal after10years or200000km whichever first. Deductible brackets (p2): <=99999km NOK10k;100000–149999 NOK15k;150000–200000 NOK20k. Preserve km limit separately from deductible intervals.
- Rental rider (PMO-350.402-003 p1) optional: corresponding car type maxNOK600/day, normal repair max45days; total loss/theft max45days and max15days after settlement offer; no glass-only claims.
- Private hire: Kasko §1.1 excludes unless certificate explicitly includes. No automatic selected private-hire fact from DNB marketing.

### DNB source conflicts and decisions

DNB page contains old values: fixed equipment NOK10k vs terms50k; Topp belongings80k vs terms100k; holiday2weeks vs terms15days; Norden for physical cover vs termsEurope. Full terms win for these facts. Page says Topp includes machine/rental but current linked IPID marks both optional and Topp fullterms do not include these riders. Safest catalogue representation is optional riders, not selected by catalogue alone. Page says private hire up to2months included, and same page later excludes hire; fullterms require certificate. No arbitrary resolution to included. This is documented authority conflict, not an invented benefit.

## Frende MC verified fact inventory

[Current MC fullterms endpoint](https://api.frende.no/documents/terms/public/pnc/MotorcycleInsurance) returns common vehicle terms01.01.2026. [IPID](https://www.frende.no/documents/204/IPID_Motorsykkel.pdf) verifies Ansvar→Delkasko→Kasko inheritance and type scope.

- Common geography Europe except Russia/Turkey/Belarus, legal Nordic (§2 p2).
- Ansvar liability and legal; legal limit NOK100k, Nordic, deductible NOK4000+20% (§14 p11–13). Do not automatically include accident: official product table explicitly calls it optional on all levels.
- Delkasko fire/theft and rescue, fastened accessory NOK20k (§3 p2, §§4–5 p3). Riding suit/gloves/boots/helmet explicitly within insured items (§3.5 p2); no separate fabricated helmet limit. Rescue at home, NOK750 deductible (§5 p3,§11.11 p9).
- Kasko collision/overturning/vandalism/wrong fuel (§6 p3–4); loose goods theft NOK10k (§6.1.3) while IPID explicitly excludes loose goods theft under Delkasko. Keep protection/limit scope precise.
- Motor breakdown excluded from Kasko; Bobil machine rider cannot attach to MC. Website explicitly says rental motorcycle unavailable; do not infer rental car from generic common §7.
- Accident optional: use common §12 p10–11 for sum/conditions. Page says death/invalidity, IPID confirms separate coverage.
- Annual mileage choices 6000 /12000 /unlimited are documented by [official mileage page](https://www.frende.no/forsikringer/mc-forsikring/du-velger-kjorelengden/), not chosen customer mileage. Common §11.12 p9 controls exceeded agreed mileage. No default assigned.

## Frende Bobil verified fact inventory

[Current Bobil fullterms endpoint](https://api.frende.no/documents/terms/public/pnc/MotorHomeInsurance) returns the same common vehicle terms01.01.2026. [Bobil IPID](https://www.frende.no/documents/200/IPID_Bobil.pdf) explicitly says Ansvar/Delkasko/Kasko plus optional Leiebil, Maskinskade, Utvidet with Kasko. [Product page](https://www.frende.no/forsikringer/bobilforsikring/) presents Utvidet as tier. Represent Utvidet as Kasko+documented package, not as automatically selected for Kasko customers.

- All levels geography/legal as above. Accident treatment follows explicit product package, not the generic terms' mere availability.
- Base covered belongings NOK20k, fixed equipment20k, fortelt included (§3 p2); theft of belongings from Bobil/connected awning20k (§4.1.3 p3).
- Delkasko fire/theft/glass/rescue. Kasko accidental external damage and wrong fuel; nyverdi1year/15000km/repair>80% (§6 p3–4,§11.7 p8), with Bobil applicability confirmed by IPID.
- Kasko does NOT include moisture from Bobil: common §6 moisture exception is explicitly campingvogn. Bobil needs Utvidet §8.7.
- Utvidet nyverdi3years/60000km/repair>80%, not leased and no unrecovered theft (§8.1 p4); key20k/no deductible (§8.2); fixed equipment50k (§8.4 p5); Bobil belongings100k (§8.8 p5).
- Utvidet Bobil moisture: approved test showing damage arose within12months, repair of leak itself excluded, pipe leakage excluded (§8.7 p5). No unsupported Bobil age ceiling added from another insurer.
- Optional rental: classC throughout repair; loss/theft31days; alternative NOK250/day max31days; on Bobil holiday alternative overnight/transport1500/day max15days (§7 p4). Explicit customer selection required.
- Optional machine: through insurance year turning12years or200000km; service compliance, named components (§9 p5–6). Deductible km brackets10k/15k/20k at100k/150k/200k (§11.11 p9) kept separate from maximum coverage km.
- Rentals need certificate under §16; rental Bobil additional deductible6000 (§11.11 p9). No source-backed claim of included private-hire add-on without agreement.

## Remaining source boundaries

1. Frende page calls product Kasko with/without ferieavbrudd in old introductory text while same page/IPID/fullterms clearly show expanded Utvidet benefits. Use actual tier table and applicable fullterms, never reduce Utvidet to holiday-only.
2. Frende machine period has an internal edge: §9 says end of insurance year turning12, §11.11 says no compensation older12. Preserve precise higher-detail §9 text and report this timing ambiguity; never invent a day-level cutoff. IPID also says older12. This does not affect certain200000km upper bound.
3. DNB optional machine/rental versus webpage bundled Topp claims require conservative optional interpretation as above; customer document remains authoritative.
4. IPID date for Fremtind unknown; version V.104/V.106 known. Mixed component dates must not be flattened into a fabricated uniform effective date.
5. No source proves MC engine rider, MC rental motorcycle (Frende explicitly no), theft of MC loose items under Frende Delkasko, Bobil pest coverage, or broad channel equivalence. Omit/unknown rather than borrow other providers/types.
6. Existing general Frende/Fremtind terms originals can be referenced without duplication; this wave does not amend original catalogues.

## Implemented owned catalogue and checks

`lib/mc-bobil-fremtind-frende-catalog.ts` exports 14 exact product tiers and five optional add-ons. Evidence has separate type/scope IDs even where original bytes are shared. No customer price or chosen annual-mileage values are generated. `tests/mc-bobil-fremtind-frende.test.mjs`: 26/26 passed, including SHA-256 verification for all18 inventory entries, exact scoped lookup, authority conflict, optional coverage isolation, cross-provider/type rejection, moisture/nyverdi/mileage isolation and conservative exclusions. Owned ESLint and TypeScript passed during integration. Full repository validation belongs to the root task.
