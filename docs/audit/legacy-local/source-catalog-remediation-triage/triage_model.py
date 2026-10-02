"""Planning artifact builder. Reads the frozen audit; never writes to the repo/audit."""
from pathlib import Path
import csv, json, collections, re, hashlib, datetime, subprocess

AUDIT=Path('/tmp/source-catalog-completeness-audit')
OUT=Path('/tmp/source-catalog-remediation-triage')
REPO=Path('/Users/morten/Documents/forsikringsapp')
def readcsv(name): return list(csv.DictReader((AUDIT/(name+'.csv')).open()))
def parsed(value, default=None):
    try: return json.loads(value)
    except (TypeError, ValueError): return default if default is not None else []
def dump(name,value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def csvout(name, rows, fields=None):
    fields=fields or list(dict.fromkeys(k for r in rows for k in r))
    with (OUT/name).open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
        for row in rows:w.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(dict,list)) else v for k,v in row.items()})

gaps=readcsv('gap-findings'); sf={r['source_fact_id']:r for r in readcsv('source-fact-inventory')}
gap={r['finding_id']:r for r in gaps}; products=readcsv('product-ledger'); prod={r['product_identity']:r for r in products}
oldroots=readcsv('root-cause-candidates'); oldbatches=readcsv('remediation-batches')
rawresearch=readcsv('source-research-queue'); conflicts=readcsv('source-conflicts')
addons=readcsv('addon-ledger'); claims=readcsv('catalog-fact-support')
audit=json.load((AUDIT/'audit.json').open()); catalog=json.load((AUDIT/'catalog.json').open())
controls=json.load((AUDIT/'verified-false-unknowns.json').open())
sigrows=collections.defaultdict(list)
for g in gaps:sigrows[g['signature']].append(g)
p1sigs={s for s,rows in sigrows.items() if any(r['severity']=='P1' for r in rows)}
def ids_for_sig(s):return [r['finding_id'] for r in sigrows[s]]

# Explicitly reviewed corrections: these are scope selectors for PLANNING,
# not new product facts, matching rules or implementable patches.
special_specs=[
 ('FIX-MC-RENTAL','Avgrens Gjensidige MC ferie-leie til dokumenterte nivåer',['GAP-2361'],'SCOPE','FIX_BEFORE_NITO',1,'TRIVIAL_DATA','LOW',
  'Fjern de tre ubetingede ferie-leie-påstandene fra Delkasko. Bevar Kasko-støtten. Fravær av støtte skal ikke omskrives til eksplisitt ikke-dekket.',
  'Delkasko får ikke Kasko-regelen; Kasko beholder sin 15-dagersregel og ordinær redning.'),
 ('FIX-MOVING-LIMIT','Fjern udokumentert gjenstandsgrense i Storebrand Innbo Super',['GAP-0931'],'CATALOG_DATA','FIX_BEFORE_NITO',1,'TRIVIAL_DATA','LOW',
  'Erstatt den udokumenterte 50 000-grensen med kildekorrekt henvisning til avtalt sum og relevant hendelsesbetinget særregel; ikke innfør ny ubetinget tallgrense.',
  'Flytting bevares; C.1.2s hendelsesbetingede regel må ikke bli universell grense; Standard endres ikke.'),
 ('FIX-PARKING','Korriger Frende Bil parkeringsbonusvilkår',['GAP-1401'],'CATALOG_DATA','FIX_BEFORE_NITO',1,'TRIVIAL_DATA','LOW',
  'Fjern påstått alders- og politivilkår uten kildestøtte; behold de dokumenterte parkering-, tids- og ukjent-kjøretøyvilkårene.',
  'Kasko/Utvidet samme dokumenterte bonusregel; MC arver ikke Bil-regel; kundens bonus endres ikke.'),
 ('FIX-PIPE','Avgrens Gjensidige Hus rørservice til dokumentert tining',['GAP-2132'],'CATALOG_DATA','FIX_BEFORE_NITO',1,'TRIVIAL_DATA','LOW',
  'Fjern tilleggspåstanden om oppspyling; behold dokumentert tining med egen kilde.',
  'Begge Hus-nivåer beholder tining. Ingen negativ påstand om oppspyling uten kilde.'),
 ('FIX-PLUSS-LIMIT','Korriger Gjensidige Reise Pluss enkeltgjenstands-overstyring',['GAP-2256'],'INHERITANCE','FIX_BEFORE_NITO',2,'TRIVIAL_DATA','LOW',
  'Legg dokumentert Pluss-overstyring på eksisterende bagasje.per_gjenstand. Bevar korrekt totalgrense og Standard.',
  'Standard 20 000; Pluss 40 000; totalgrense og kundeavtalt dokumentverdi uendret.'),
 ('FIX-EXTRA-STORAGE','Korriger Tryg Innbo Ekstras arv av fellesbodgrense',['GAP-4431'],'INHERITANCE','FIX_BEFORE_NITO',2,'DATA_BATCH','MEDIUM',
  'La Ekstras egne sted-/gjenstandsregler erstatte den feilaktig arvede grunnnivågrensen. Bevar skillet privat bod/fellesadkomst/ekstern bod/andre steder.',
  'Vanlig Innbo beholder egne grenser. Ingen erstatning av alle bodbegreper med én grense.'),
 ('FIX-MOVING-THEFT','Skill Tryg Innbo flyttetyveri fra generell transportskade',['GAP-4435'],'CANONICAL_MAPPING','MAPPING_REVIEW_FIRST',2,'SMALL_CODE','MEDIUM',
  'Knytt den dokumenterte regelen til tyveri/skadeverk under flytting. Velg eksisterende eksakt hendelsesnøkkel eller avgrenset provider-detalj.',
  'Privat flytting og generell transportskade må ikke få den profesjonelle flyttingens tyverigrense.'),
 ('FIX-INNBO-SCOPE','Korriger Gjensidige Innbo geografi, sted og egenandel',['GAP-1986','GAP-2017','GAP-2077','GAP-2078','GAP-2079','GAP-2080'],'CATALOG_DATA','FIX_BEFORE_NITO',2,'DATA_BATCH','MEDIUM',
  'Korriger de seks avgrensede kilde-/scopefeilene i eksisterende facts. Hver regel beholder egen hendelse, sted, nivå og proveniens.',
  'Europa privatansvar, verdensomspennende sykkeluhell, fellesbod og misligholdt husleie må ikke blandes.'),
 ('FIX-HOUSE-ART','Fjern kunstnerisk utsmykning fra Fremtind Hus Standard',['GAP-5106'],'SCOPE','FIX_BEFORE_NITO',1,'TRIVIAL_DATA','LOW',
  'Modeller Standards uttrykkelige unntak; bevar Topps dokumenterte dekning.',
  'Standard negativ og Topp positiv med egne kilder; ingen endring av kundedokument.'),
 ('FIX-HOUSE-DEDUCTION','Korriger Storebrand Hus aldersfradragets materialomfang',['GAP-0976','GAP-5699'],'CATALOG_DATA','FIX_BEFORE_NITO',2,'DATA_BATCH','LOW',
  'Bevar satser men avgrens rør til dokumentert materiale. Ta den nærliggende P2-badeinnretningslabelen med i samme tabellrevisjon.',
  'Plastrør og andre rør skilles; badeinnretningens elektriske delvilkår utvides ikke til hele kategorien.'),
 ('FIX-IF-MEDICAL','Korriger If Reise sykdoms- og ulykkesutløser',['GAP-3553','GAP-5714'],'SCOPE','FIX_BEFORE_NITO',1,'DATA_BATCH','LOW',
  'Fjern ubegrunnet alvorlighetskrav for ulykkesskade. Skill samtidig Basis fra sikkerhetsforskrifter som bare gjelder Standard/Super.',
  'Akutt sykdomsregel og kjent sykdomsforbehold bevares. Basis får ikke nye bagasje-/forsinkelsesdekninger.'),
 ('FIX-IF-BOAT-DEDUCTIBLE','Korriger If Båt aldersgrener for motor/gir-egenandel',['GAP-3706'],'CATALOG_DATA','FIX_BEFORE_NITO',1,'DATA_BATCH','LOW',
  'Representer kildens faste og prosentbaserte aldersgrener i eksisterende egenandelsfaktum uten universell minstegrense.',
  '4 000 til og med fem år; eldre grener beholder egne terskler; valgfri status bevares.'),
 ('FIX-DOG-BASE','Korriger Fremtind Hund base/Topp for allergi og diagnostikk',['GAP-5582','GAP-5584'],'ADDON','FIX_BEFORE_NITO',2,'DATA_BATCH','MEDIUM',
  'Gjenopprett dokumentert basisallergi og årlig MR/CT-sublimit, med Topps dokumenterte utvidelse som valgfri.',
  'Livstidsgrense skilles fra årsgrense og valgt veterinærsum. Katt og kundevalgt Topp bevares.'),
 ('FIX-DOG-LIFE','Bevar Fremtind Hund rasegrupper ved livsfradrag',['GAP-5601'],'CATALOG_DATA','FIX_BEFORE_NITO',2,'DATA_BATCH','MEDIUM',
  'Ta inn den manglende niårsgruppen, gulv og hovedforfallsvilkår uten å velge side i den separate web-/fullvilkårskonflikten.',
  'Rasegruppe, reduksjonsstart og opphør forblir ulike dimensjoner. Eksakt grensedato krever separat kildeavklaring.'),
 ('MAP-OVERNIGHT','Representer Storebrand Reise dagstur på korrekt overnattingsdimensjon',['GAP-1642'],'CANONICAL_MAPPING','MAPPING_REVIEW_FIRST',2,'SMALL_CODE','MEDIUM',
  'Bruk eksplisitt kildebundet reise.overnatting for generell reisedefinisjon. Ingen UI- eller runtime-utledning fra geografitekst. Avklar at Trygs sammensatte ordlyd ikke overfører tjenestereise.',
  'Standard versus Tryg Ekstra/Premium begge veier; avbestilling/leiebil beholder egne overnattingskrav.'),
 ('MAP-PESTS','Bevar Gjensidige Hus gnagerfakta ved råte-/insektutvidelse',['GAP-2134','GAP-2147'],'INHERITANCE','MAPPING_REVIEW_FIRST',2,'SMALL_CODE','MEDIUM',
  'Avgrens komponentenes semantiske identiteter slik at insektutvidelse ikke erstatter gjeldende gnagerskade/bekjempelse. Vurder lokale fakta først, ikke global endring av replacesBase.',
  'Standard med/uten tillegg og Pluss beholder mus/rotter, lukt/isolasjon samt egne insektvilkår.'),
 ('MAP-FRENDE-TAP','Samle dokumentert brukstap under Frende Hund Tap',['GAP-1284'],'ADDON','MAPPING_REVIEW_FIRST',2,'SMALL_CODE','MEDIUM',
  'Knytt brukstapsfakta til den kildebestemte Tap-komponenten. Unngå en selvstendig valgmulighet som dokumentasjonen ikke støtter.',
  'Tap alene får riktig deldekning; separat Bruksverdi kan ikke skape udokumentert produkt; kundens Tap-valg må ikke antas.'),
 ('MODEL-BRUK-LIV','Avklar Gjensidige Bruk som avhengig tillegg til Liv',['GAP-2900','GAP-2936'],'ADDON','CANONICAL_REVIEW_FIRST',2,'SMALL_CODE','MEDIUM',
  'Avklar minste eksplisitte avhengighetsrepresentasjon. Dagens requiresLevel gjelder hovedprodukt, ikke valgt annet tillegg. Katt Bruk må ha egen artsnøkkel/proveniens.',
  'Bruk uten Liv avvises eller vises avhengig uten å velge Liv automatisk; Hund/Katt forblir isolert.'),
 ('REVIEW-GJ-REHAB','Avklar behandlingsscope før Gjensidige rehabilitering flyttes',['GAP-2892'],'ADDON','SOURCE_RESEARCH_FIRST',0,'SOURCE_RESEARCH','MEDIUM',
  'Flytt ikke hele fysikalsk-behandlingstemaet blindt. Avklar SC-035s grense mellom basisbehandling og valgfri rehabilitering; deretter korrekt optional-komponent.',
  '5 000-grensen må ikke antyde ubetinget valgt dekning, og dokumentert basisakupunktur må ikke forsvinne.'),
 ('MAP-TRAVEL-DEPARTURE','Skill Storebrand forsinket avgang fra fremmøte',['GAP-1057'],'CANONICAL_MAPPING','MAPPING_REVIEW_FIRST',2,'SMALL_CODE','MEDIUM',
  'Skill ytelsene før tallkorrigering: avgang med transportørens 24-timersgren er ikke samme hendelse som forsinket fremmøte.',
  '1 500/20 000-grenene må ikke kryssmates; Standard/Super og hotellskillene bevares.'),
 ('MAP-FREMTIND-DEPARTURE','Skill Fremtind Reise avgang, innhenting og transittutgift',['GAP-5157'],'CANONICAL_MAPPING','MAPPING_REVIEW_FIRST',2,'SMALL_CODE','MEDIUM',
  'Skill den dokumenterte avgangsregelen fra fremmøte/innhenting; behold 24-timersvilkåret og klær/toalett under riktig hendelse.',
  'Kundeutgifter og produktmaks holdes ulike; ikke importer historisk Eika.'),
 ('FIX-BOAT-SUPER-INHERIT','Gjenopprett Storebrand Båt Super opplagsutstyr',['GAP-0085'],'INHERITANCE','FIX_BEFORE_NITO',2,'DATA_BATCH','LOW',
  'Bevar Kaskos dokumenterte opplagsutstyr i Super og egen grense. Endre eksakt produktkomposisjon, ikke alle boatCore-nivåer.',
  'Delkasko beholder sin dokumenterte scope; Super/Kasko matcher på denne deldekningen uten at alle øvrige ytelser arves.'),
 ('FIX-GJ-BOBIL-PESTS','Knytt Gjensidige Bobil skadedyr til Kasko',['GAP-2487'],'INHERITANCE','FIX_BEFORE_NITO',2,'DATA_BATCH','LOW',
  'La Kasko få den uttrykkelig dokumenterte dekningen og dens egne vilkår; Pluss beholder den.',
  'Delkasko får ikke skadedyr. Kilde, parent/detail og sidebytte kontrolleres.'),
 ('FIX-IF-CAMPING-SUPER','Materialiser If Campingvogn Supers dokumenterte ytelser',[],'CATALOG_DATA','FIX_BEFORE_NITO',3,'DATA_BATCH','MEDIUM',
  'Utvid bare Super med SV707s dokumenterte fukt-, ferie-, løsøre-, skadedyr- og nyverdiregler. Supergaranti med manglende fullvilkår holdes utenfor.',
  'Kasko/Delkasko får ikke Superytelser; fuktkontroll, alder og kildehenvisning må følge ytelsen.'),
 ('FIX-FREMTIND-MC-NEWVALUE','Materialiser Fremtind MC ordinær nyverdi',['GAP-0131','GAP-5370'],'CATALOG_DATA','FIX_BEFORE_NITO',3,'DATA_BATCH','LOW',
  'Bruk MC-spesifikk Minikasko-regel og Kaskos henvisning med alder, km, skadegrad, eierskap og tidligere skade. Ingen overføring til Snøscooter eller annen kanal.',
  'Mini/Kasko får bare den MC-spesifikke regelen; dokumentets nyverdi og kjørelengde overstyrer ikke hverandre.'),
]
special={}; specby={}
for key,title,seedids,layer,disposition,wave,complexity,risk,change,protect in special_specs:
    sigs={gap[x]['signature'] for x in seedids}
    if key=='FIX-IF-CAMPING-SUPER':sigs={g['signature'] for g in gaps if g['root_cause_id']=='SCRC-037'}
    specby[key]=dict(key=key,title=title,layer=layer,disposition=disposition,wave=wave,complexity=complexity,risk=risk,change=change,protect=protect)
    for s in sigs:
        assert s not in special,(s,key,special.get(s))
        special[s]=key

# True overlap, with distinct audit IDs preserved. Later full review includes
# exact MC Mini and Kasko, while earlier review covered Kasko only.
duplicate_sig={gap['GAP-0131']['signature']:gap['GAP-5370']['signature']}

# Historical scope may be deferred only for active-product pilot. It remains a
# known defect for historical customer comparisons, not a finding reversal.
def historical(rows):return all(prod[r['product_identity']]['historical']=='True' for r in rows)
source_classes={'SOURCE_CONFLICT_REVIEW_REQUIRED','SOURCE_PACKAGE_GAP','SOURCE_AMBIGUOUS','SOURCE_FACT_OPTIONAL_COMPONENT'}

def canonical_domain(g):
    s=g['semantic_concept'].lower();d=g['semantic_dimension'].lower()
    if any(w in s for w in ['alder','tegning','registrering','gyldighet','idmerk','kjøp','varighet','personkrets','sikrede','fraflytt','ubebodd','reisevarighet']):return 'ELIGIBILITY'
    if any(w in s for w in ['egenandel','alarm','ung fører','uten fører','gjenfinning']):return 'DEDUCTIBLE'
    if any(w in s for w in ['oppgjør','totaltap','reduksjon','avliving','avlivning']):return 'SETTLEMENT'
    if any(w in s for w in ['geografi','ansvar','rettshjelp']):return 'LEGAL_GEOGRAPHY'
    if any(w in s for w in ['unntak','begrensning','bruk','fysisk skade','bane','rasesykdom','rase','medfødt','ledd','hd/ad','kastrering','korsbånd','tannulykke','behandlingsunntak']):return 'QUALIFIERS'
    return 'BENEFIT_SUBJECT'

def scope_provider(g):
    # Shared Bil authoring is proven by four catalog wrappers. Channel validation
    # remains independent and cannot be inferred from this implementation group.
    return 'fremtind-four-bil-ids' if g['root_cause_id']=='SCRC-051' else g['provider']

def production_files(provider,family):
    p='fremtind' if provider in ['fremtind-four-bil-ids','sparebank1-fremtind','dnb-fremtind','eika-fremtind','fremtind-eika-legacy'] else provider
    if family in ['Hund','Katt','Båt']:return ['lib/boat-pet-catalog.ts']
    if family in ['Snøscooter','Campingvogn','Tilhenger']:return ['lib/vehicle-object-catalog.ts']
    if family in ['MC','Bobil']:
        suffix='tryg-if' if p in ['tryg','if'] else 'gjensidige-storebrand' if p in ['gjensidige','storebrand'] else 'fremtind-frende'
        return [f'lib/mc-bobil-{suffix}-catalog.ts']
    return [f'lib/{p}{"-"+family.lower() if family!="Bil" else ""}-catalog.ts']

registries=json.load((OUT/"existing-type-registries.json").open())
keys_by_family=collections.defaultdict(set)
for p in catalog["products"]:
    for field in ["facts","addonFacts"]:
        facts=p.get(field,[])
        if isinstance(facts,list):
            for f in facts:
                if isinstance(f,dict) and "key" in f:keys_by_family[p["insuranceType"]].add(f["key"])
for family,registry in registries.items(): keys_by_family[family].update(registry["keys"])
decisions={}
for signature,rows in sigrows.items():
    r=next((r for r in rows if r['severity']=='P1'),rows[0])
    s=sf[r['source_fact_id']]
    blocked=any(x['classification'] in source_classes for x in rows)
    if signature in special:
        sp=specby[special[signature]];kind=sp['key'];disp=sp['disposition']
    elif historical(rows):kind='HISTORICAL';disp='DEFER_SAFE'
    elif blocked or r['finding_id']=='GAP-5178' or (r['root_cause_id']=='SCRC-046' and r['semantic_concept']=='Maskinskade' and r['classification']=='CATALOG_FACT_SEMANTICALLY_MISMAPPED'):
        kind='SOURCE';disp='SOURCE_RESEARCH_FIRST'
    elif not parsed(r['proposed_existing_keys']):
        kind='MODEL-'+canonical_domain(r);disp='CANONICAL_REVIEW_FIRST'
    else:
        support=parsed(s['key_support_existing_catalog'],{})
        reg=parsed(s['key_support_existing_type_registry'],{})
        unregistered=[k for k in parsed(r['proposed_existing_keys']) if not(support.get(k) is True or reg.get(k) is True or k in keys_by_family[r["insurance_type"]])]
        if unregistered:kind='MAP-REGISTER';disp='MAPPING_REVIEW_FIRST'
        else:kind='DATA';disp='FIX_BEFORE_NITO'
    if r['severity']!='P1' and not signature in p1sigs:
        disp='P2_CANDIDATE' if kind=='DATA' or signature in special else ('DEFER_UNTIL_RELEVANT' if historical(rows) else 'DEFER_POST_PILOT')
    batchkind="MODEL" if kind.startswith("MODEL-") else kind
    group=(kind,) if signature in special else (scope_provider(r),r["insurance_type"],r["scope"],batchkind)
    if signature in duplicate_sig:disp="DUPLICATE / COVERED_BY_OTHER_BATCH"
    decisions[signature]=dict(signature_id=signature,representative_finding_id=r['finding_id'],rows=rows,kind=kind,disposition=disp,group=group,
      historical=historical(rows),canonical_domain=canonical_domain(r),unregistered_keys=unregistered if kind=='MAP-REGISTER' else [])

if __name__=='__main__':
    print('P1',collections.Counter(d['disposition'] for s,d in decisions.items() if s in p1sigs))
    print('groups',len({d['group'] for s,d in decisions.items() if s in p1sigs}))
    print('groups bykind',collections.Counter(d['kind'] for s,d in decisions.items() if s in p1sigs))
