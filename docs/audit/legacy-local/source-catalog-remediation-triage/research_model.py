"""Explicit task-level deduplication, keeping every original question traceable."""
from triage_model import *

# One acquisition/clarification task can contain several explicitly scoped
# questions. A shared research request is NOT evidence of product equivalence.
conflict_groups={
 'tryg-dog-clarification':[1,51], 'frende-trailer-deductible':[2,15],
 'frende-innbo-current-ipid':[3], 'frende-house-scope':[4],
 'storebrand-motor-applicability':[6], 'storebrand-camp-trailer':[7],
 'storebrand-house-version':[8], 'storebrand-travel-transfer':[9],
 'frende-boat-applicability':[10], 'frende-cat-disappearance':[11],
 'frende-car-boundaries':[12], 'frende-mc-glass':[13], 'frende-motorhome-channel':[14],
 'gj-car-rental':[16], 'gj-contents-crypto':[17],
 'gj-legal-htu':[18,19,24,33], 'gj-house-insect-deductible':[20],
 'gj-travel-version':[21,22,23], 'gj-motorhome-level':[25,26],
 'gj-caravan-scope':[27,28,29,30], 'gj-boat-machine-legal':[31,32],
 'gj-dog-treatment':[34,35], 'if-motorhome-super':[36,37], 'if-mc-eligibility':[38],
 'if-scooter-deductible':[39], 'if-trailer-assistance':[40], 'if-caravan-extensions':[41],
 'if-house-package':[42], 'if-travel-treatment':[43], 'if-boat-package':[44],
 'if-pet-birth-boundaries':[45], 'tryg-mc-terms':[46], 'tryg-motorhome-terms':[47,48],
 'tryg-scooter-version':[49], 'tryg-boat-engine-age':[50], 'tryg-contents-version':[52],
 'tryg-travel-version':[53,54,55], 'fremtind-car-minikasko':[56],
 'fremtind-contents-channel':[57], 'fremtind-house-roof':[58], 'eika-historical-travel':[59],
 'fremtind-trailer-components':[60], 'fremtind-mc-driving-gear':[61],
 'fremtind-dnb-motorhome':[62,63,64], 'fremtind-sb1-boat':[65,66],
 'fremtind-cat-deductible':[67], 'fremtind-pet-expiry':[68], 'storebrand-boat-proof-device':[69,70],
}
conflict_to_group={f'SC-{i:03}':key for key,ns in conflict_groups.items() for i in ns}
extras={
 'SRQ-005':['frende-innbo-legal'],
 'SR-gjensidige-bobil-utleie':['gj-motorhome-riders'],
 'SR-gjensidige-bobil-fortelt':['gj-motorhome-riders'],
 'SR-gjensidige-tilhenger-extension':['gj-trailer-rental-rider'],
 'SR-gjensidige-snoscooter-extension':['gj-scooter-equipment-rider'],
 'SR-gjensidige-campingvogn-extension':['gj-caravan-riders'],
 'SR-gjensidige-bat-options':['gj-boat-riders'],
 'SR-gjensidige-pet-race':['gj-pet-breed-riders'],
 'SR-if-supergaranti':['if-super-guarantee'],
 'SR-if-motor-precise-scope':['if-motor-type-extensions'],
 'SR-if-innbo-optional':['if-contents-riders','if-super-guarantee'],
 'SR-if-hus-package':['if-house-package','if-super-guarantee'],
 'SR-if-reise-guarantee':['if-super-guarantee'],
 'SR-if-boat-general':['if-boat-package'],
 'SR-tryg-bil-product-base':['tryg-car-base-package'],
 'SR-tryg-mcb-ambiguity':['tryg-mc-terms','tryg-motorhome-terms'],
 'SR-tryg-extension-scope':['tryg-scooter-version','tryg-caravan-interruption'],
 'SR-tryg-boat-mainterms':['tryg-boat-core-package','tryg-boat-accident-clarification'],
 'SR-tryg-pet-source-conflicts':['tryg-dog-clarification','tryg-cat-life-conditions'],
 'SR-tryg-innbo-dates-ipid':['tryg-contents-version','tryg-liability-effective-version'],
 'SR-tryg-reise-web-conflicts':['tryg-travel-version','tryg-liability-effective-version'],
 'SR-fremtind-bil-channel-minikasko':['fremtind-car-channel-originals','fremtind-car-minikasko'],
 'SR-fremtind-innbo-art-channel':['fremtind-contents-channel'],
 'SR-fremtind-hus-roof-boundary':['fremtind-house-roof'],
 'SR-fremtind-reise-security-channel':['fremtind-travel-channel-safety'],
 'fremtind-light-ipid-components':['fremtind-trailer-components'],
 'fremtind-bobil-dnb-conflicts':['fremtind-dnb-motorhome'],
 'fremtind-boat-unit-age':['fremtind-sb1-boat'],
 'fremtind-pet-puppy-and-conflicts':['fremtind-puppy-rider','fremtind-cat-deductible','fremtind-pet-expiry'],
 'storebrand-boat-registration-and-alarm':['storebrand-boat-proof-device'],
 'storebrand-motor-camp-final-questions':['storebrand-motor-applicability','storebrand-camp-trailer'],
 'storebrand-innbo-holiday-context':['storebrand-contents-home-context'],
 'storebrand-hus-final-questions':['storebrand-house-version'],
 'storebrand-reise-purchase-transfer':['storebrand-travel-transfer'],
 'frende-bil-final-local-closure':['frende-car-boundaries'],
 'frende-mc-final-local-closure':['frende-mc-glass'],
 'frende-bobil-final-local-closure':['frende-motorhome-channel'],
 'frende-hus-final-local-closure':['frende-house-scope'],
 'frende-båt-final-local-closure':['frende-boat-applicability'],
 'frende-katt-final-local-closure':['frende-cat-disappearance'],
 'gjensidige-final-addon-applicability':['gj-car-addon-eligibility','gj-contents-cycle-rider','gj-motorhome-riders'],
}
extra_scope={
 'frende-innbo-legal':(['frende'],['Innbo'],'Presis privat rettshjelpsrolle i §9.1 og anvendelig naturskade-/geografihenvisning. Skaff relevant offentlig avklaring, ikke kundebevis.'),
 'gj-motorhome-riders':(['gjensidige'],['Bobil'],'Daterte fullvilkår og nivåmatrise for Utleie og Fortelt, hver med egen leveranse; offentlig tilgjengelighet alene gir ikke grenser.'),
 'gj-trailer-rental-rider':(['gjensidige'],['Tilhenger'],'Offentlig fullstendig Utleie-rider og nivåtilgjengelighet; ikke antatt kundens valg fra mal.'),
 'gj-scooter-equipment-rider':(['gjensidige'],['Snøscooter'],'Offentlige vilkår og nivågrenser for Henger/utvidet utstyr.'),
 'gj-caravan-riders':(['gjensidige'],['Campingvogn'],'Offentlige Utleie-vilkår og rider for høyere avtalte summer, nivåspesifikt.'),
 'gj-boat-riders':(['gjensidige'],['Båt'],'Fullvilkår og nivåtilgjengelighet for privat utleie, utvidet farvann, bygging og Smartbåt; separat svar per tillegg.'),
 'gj-pet-breed-riders':(['gjensidige'],['Hund','Katt'],'Offentlig rase-/artsbestemt avgrensningsoversikt og refererte riders; ingen individuelle poliser eller helseopplysninger.'),
 'if-super-guarantee':(['if'],['Bobil','Campingvogn','Innbo','Hus','Reise'],'Fullstendige toårs Supergaranti-regler, med eksakt anvendelig produkt-/versjonsmatrise. Felles forskning gir ikke rett til å dele fakta mellom familiene.'),
 'if-motor-type-extensions':(['if'],['Snøscooter','Campingvogn','Tilhenger'],'Eksakt snøscooter glass/redning, ordinær nyverdi på ikke-motorisert type og høyere utstyr/tilbygg-riders. Selvstendig svar per type.'),
 'if-contents-riders':(['if'],['Innbo'],'Fullvilkår for høy sykkelverdi og verdigjenstand/samling; sikker nivå-/sum-/egenandelsmatrise.'),
 'tryg-car-base-package':(['tryg'],['Bil'],'Bil-spesifikke produktvilkår og IPID for global geografi, eligibility og Leiebil-nivå; ikke importer MC/Bobil eller endre frosset datogate.'),
 'tryg-caravan-interruption':(['tryg'],['Campingvogn'],'Avklar om nettsidens avlyst reise gjelder samme produkt som fullvilkårets påbegynt/avbrutt ferie; eksakt datert scope.'),
 'tryg-boat-core-package':(['tryg'],['Båt'],'Ordinære ansvar/brann/tyveri/kasko-dekningsvilkår og sikkerhetsforskrifter som ikke inngår i PFB-produktbetingelsene. Daterte beløp, nivåer, vilkår og standardegendeler.'),
 'tryg-boat-accident-clarification':(['tryg'],['Båt'],'Eksakt ulykkesprodukt-versjon som avklarer IPID 80-år/sykehus mot PFB38900; ikke anta historisk sammendrag utvider fullvilkåret.'),
 'tryg-cat-life-conditions':(['tryg'],['Katt'],'Avklar annonsering kontra politikrav ved forsvinning i Katt Død; hold Hund Bruksverdi adskilt. Fullvilkår/produktdato er påkrevd.'),
 'tryg-liability-effective-version':(['tryg'],['Innbo','Reise','Hus'],'PGE90020 som faktisk gjaldt 29.09.2026 og eksakte produktreferanser. Lokal 01.10-utgave beviser ikke tilbakedatert gyldighet.'),
 'fremtind-car-channel-originals':(['fremtind','sparebank1-fremtind','dnb-fremtind','eika-fremtind'],['Bil'],'Arkiverte offisielle SB1/DNB-kanalsider og eksakte avtale-/tilleggsregler, kontrollert mot Eika og felles fullvilkår. Fullfør separat kanalmatrise før identiske sluttprodukter påstås.'),
 'fremtind-travel-channel-safety':(['fremtind'],['Reise'],'Gjeldende offentlig sikkerhetsforskrift som faktisk gjelder PRE samt SB1/DNB kanalvalg/varighet. §7.6 finnes ikke i lagret fullvilkår; ikke konstruer 90/120/180-valg.'),
 'fremtind-puppy-rider':(['sparebank1-fremtind'],['Hund'],'Fullstendig offentlig Valpeforsikring-rider med eligibility, varighet, antall kull og tillegg til tispe; nettsidens tilgjengelighet er utilstrekkelig.'),
 'storebrand-contents-home-context':(['storebrand'],['Innbo'],'Eksakt produktidentitet for innbo i bolig/fritidsbolig og de betingede reglenes anvendelse. Ingen nye grenser skal antas.'),
 'gj-car-addon-eligibility':(['gjensidige'],['Bil'],'Eksakt nivåmatrise for utvidet utstyr, spesiallakk og funksjonsutstyr. Generic IPID eller standardmal er ikke bevis for alle nivåer.'),
 'gj-contents-cycle-rider':(['gjensidige'],['Innbo'],'Offentlig høyere sykkelsum-rider med nivå og betingelser; kundebevis bare for faktisk valgt beløp.'),
}
task_groups=collections.defaultdict(lambda:dict(raw=[],conflicts=[]))
reconciliation=[]
for q in rawresearch:
    is_closed=q['status'].startswith('CLOSED')
    is_alias=q['status']=='ALIAS_OF_CONFLICT_TASK'
    if is_closed:
        keys=[]
    elif q['conflict_id']:
        keys=[conflict_to_group[q['conflict_id']]]
    else:keys=extras[q['queue_id']]
    reconciliation.append(dict(raw_queue_id=q['queue_id'],input_status=q['status'],triage_status='CLOSED_LOCAL' if is_closed else 'ALIAS_RETAINED' if is_alias else 'OPEN_DEDUPLICATED',task_keys=keys))
    for k in keys:task_groups[k]['raw'].append(q)
for c in conflicts:
    if c['id'] in conflict_to_group:task_groups[conflict_to_group[c['id']]]['conflicts'].append(c)

def product_scope(ps,fs):
    return [p['product_identity'] for p in products if p['provider'] in ps and p['insurance_type'] in fs]

tasks=[]
for i,(key,group) in enumerate(sorted(task_groups.items()),1):
    cs=group['conflicts'];rs=group['raw'];taskid=f'SR-{i:03}'
    if key in extra_scope:providers,families,question=extra_scope[key]
    else:
        providers=sorted({c['provider'] for c in cs});families=sorted({f for c in cs for f in c['family'].split('/')})
        question=' | '.join(c['id']+': '+c['claim']+'. '+c['observed'] for c in cs)
    if key=='eika-historical-travel':providers=['fremtind-eika-legacy']
    # Product-only summaries with extra conditions are preserved as exact source
    # questions, not discarded by grouping them with their conflict rows.
    additional=[{'raw_id':r['queue_id'],'question':r['exact_question'] or r['reason'],'required_evidence':r['external_source_needed_if_unresolved'] or r['required_sources']} for r in rs if not r['conflict_id']]
    sources=sorted({s for c in cs for s in parsed(c['sources'])})
    if not sources:
        sources=sorted({r['source_artifact'] for r in gaps if r['provider'] in providers and r['insurance_type'] in families})
    if key=='if-super-guarantee':priority='HIGH_VALUE'
    elif key in ['frende-innbo-current-ipid','eika-historical-travel','gj-legal-htu','storebrand-contents-home-context']:priority='MEDIUM_VALUE'
    else:priority='BLOCKS_NITO'
    tasks.append(dict(research_task_id=taskid,task_key=key,provider=providers,family=families,scope=sorted({prod[x]['agreement_scope'] for x in product_scope(providers,families)}),
      products=product_scope(providers,families),question=question,current_sources=sources,
      missing_evidence='Datert autoritativ produkt-/nivå-/kanalavklaring av de navngitte spørsmålene; fullvilkår/rider der pakken mangler, ikke forsikringsgiverlikhet eller kundedokument.',
      raw_queue_ids=sorted({r['queue_id'] for r in rs}),raw_open_queue_ids=sorted({r['queue_id'] for r in rs if r['status']!='ALIAS_OF_CONFLICT_TASK'}),
      conflict_ids=[c['id'] for c in cs],additional_questions=additional,priority=priority,blocks_batch_ids=[],pilot_blocking=priority=='BLOCKS_NITO',
      recommended_source_type='Aktivt datert fullvilkår/kanaltillegg + matchende IPID/produktside; skriftlig offisiell avklaring ved motstrid.',
      acquisition_boundary='Én koordinert bestilling med separate svar per spørsmål/type/kanal. Ingen antakelse om felles produkt eller felles faktaregel.',
      research_performed=False))
taskby={t['task_key']:t for t in tasks};taskbyid={t['research_task_id']:t for t in tasks}
for r in reconciliation:r['research_task_ids']=[taskby[k]['research_task_id'] for k in r.pop('task_keys')]

# Precise P1 source-blocking dimensions. Other safe source-backed rules in the
# same package remain implementation candidates and are NOT blanket-blocked.
source_seed={
 'GAP-2645':'gj-caravan-scope','GAP-3959':'tryg-mc-terms','GAP-4025':'tryg-motorhome-terms',
 'GAP-4028':'tryg-motorhome-terms','GAP-4091':'tryg-scooter-version','GAP-4262':'tryg-boat-core-package',
 'GAP-4297':'tryg-boat-engine-age','GAP-4363':'tryg-dog-clarification','GAP-4449':'tryg-contents-version',
 'GAP-4490':'tryg-travel-version','GAP-4575':'fremtind-car-minikasko','GAP-4688':'fremtind-car-minikasko',
 'GAP-4801':'fremtind-car-minikasko','GAP-4914':'fremtind-car-minikasko','GAP-5032':'fremtind-contents-channel',
 'GAP-5178':'fremtind-travel-channel-safety','GAP-5308':'fremtind-trailer-components','GAP-5329':'fremtind-trailer-components',
 'GAP-5386':'fremtind-dnb-motorhome','GAP-5406':'fremtind-dnb-motorhome','GAP-5414':'fremtind-dnb-motorhome','GAP-5448':'fremtind-dnb-motorhome',
 'GAP-5502':'fremtind-sb1-boat','GAP-5511':'fremtind-sb1-boat','GAP-5607':'fremtind-puppy-rider',
 'GAP-5608':'fremtind-pet-expiry','GAP-5630':'fremtind-pet-expiry','GAP-5629':'fremtind-cat-deductible','GAP-2892':'gj-dog-treatment',
}
source_sig={gap[k]['signature']:v for k,v in source_seed.items()}
if __name__=='__main__':
    print('tasks',len(tasks),'rawopen',sum(r['triage_status']=='OPEN_DEDUPLICATED' for r in reconciliation),'P1 mapping',len(source_sig))
    for s,d in decisions.items():
        if s in p1sigs and d['disposition']=='SOURCE_RESEARCH_FIRST' and s not in source_sig:print('MISSING',d['representative_finding_id'])
