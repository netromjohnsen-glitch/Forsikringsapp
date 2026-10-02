# Fremtidige hensyn – ikke implementert eller lagt til minimumssettet

## PDF/customer sammenligning

Vurder en separat, deterministisk oversikt over dokumenterte pris-/risikoforutsetninger øverst: avtalt årlig kjørelengde, fører-/bruksvilkår, egenandel, valgt sum, objekt og andre vesentlige forutsetninger når kundedokumentene faktisk dokumenterer dem. Det må skilles fra dekningenes kilometergrenser, katalogens standardmaks og individuelle priser. Manglende forutsetning er ikke et antatt standardvalg. Ingen ny PDF-arkitektur, prompt, ekstraksjon eller AI-kall er autorisert av triagen.

205 batcher kan påvirke katalogkunnskap i kundemodus når enrichment er berettiget; derfor LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen påvist PDF_EXTRACTION_IMPACT: rå kunde-PDF-er ble ikke brukt, og audit av offentlig katalog kan ikke bevise uttrekksfeil. PRODUCT_MODE_ONLY, CATALOG_ENRICHMENT_ONLY, PDF_EXTRACTION_IMPACT og UNKNOWN har derfor 0 tildelte batcher; dette er konservativ potensiell påvirkning, ikke målt kundeforbedring.

## Personforsikring

Kilder → uavhengig rådgiverrelevant faktainventory → canonical semantikk → produktkatalog → sammenligning → source→catalog-gate → menneskelig validering → publisering. Ikke start implementasjonen først og oppdag fullstendighet etterpå.

Første versjon kan behandle standard offentlige produktvilkår og dokumenterte summer i vanlige avtaledokumenter. Individuelle helsereservasjoner krever separat personvern-/sikkerhetsarkitektur. Fravær av et reservasjonsdokument betyr aldri «ingen reservasjon»; mulig sikker beskjed er at individuelle reservasjoner ikke er vurdert. Ingen personforsikring bygges nå.

## Drift av kildegrunnlag

Versjons-/gyldighetsdato og hashes må videreføres, ukjent dato må forbli ukjent, og ny kildeutgave bør utløse målrettet ny audit. SHA-likhet beviser filidentitet, ikke at samme kanalregel gjelder. NITO/avtalescope er separat fra forsikringsgiver; ingen medlemsprodukter oppfinnes her.
