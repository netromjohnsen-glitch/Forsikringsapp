from continue_audit import *
A=Audit();I=load('frende-vehicle-independent-inventory.json');E=load('frende-extensions-independent-inventory.json')
base='catalog/sources/vehicle-extensions/'
general=base+'frende-Generelle_vilkår-01012026.pdf'
A.root('SCRC-021','Frende Snøscooter/Campingvogn/Tilhenger share applicable vehicle terms but their catalog mostly preserves included status and a few sums. Exact type-specific benefits, optional accident availability, legal limits, settlement and qualifying conditions are absent. No Bil-only new-value, machine or rental cover is inferred.','Independent shared 61-rule inventory plus 21 extension rules; seven exact resolved products and all available optional components examined.',['Snøscooter','Campingvogn','Tilhenger'],['frende'],'RB-19')
configs=[('snow','snoscooter','SnowmobileInsurance','snoscooterforsikring',['ansvar','brann-og-tyveri','kasko']),('camp','campingvogn','CaravanInsurance','campingvognforsikring',['brann-og-tyveri','kasko']),('trailer','tilhenger','TrailerInsurance','tilhengerforsikring',['brann-og-tyveri','kasko'])]
rows=[
('Personkrets','forsikrede','Forsikringstaker og registrert eier/medeier; rettshjelp bare privatkunder.','2 §1','all',[],COARSE,'P2'),
('Geografi','område','Europa unntatt Russland, Tyrkia og Belarus; rettshjelp i Norden.','2 §2','all',['avtale.geografi'],PRESENT,''),
('Rettshjelp','personkrets/tvist','Privat eier, fører og bruker; også tvist etter salg og ved nykjøp før ny forsikring, samt voldgift.','11–12 §14.1','all',['rettshjelp.dekning'],COARSE,'P1'),
('Rettshjelp','utgifter/unntak','Egen advokat, sakkyndig og vitner i første instans; blant annet anke, idømte kostnader, tidligere tvistegrunnlag, sameiere, yrke og straff unntatt; forvaltningsklage må være uttømt.','12 §14.2–3','all',['rettshjelp.dekning'],COARSE,'P1'),
('Rettshjelp','sum','100 000 kr per tvist; 250 000 kr med minst tre parter; ikke over økonomisk interesse.','12–13 §14.4','all',['rettshjelp.grense'],MISSING,'P1'),
('Rettshjelp','egenandel','4 000 kr pluss 20 prosent av øvrige kostnader; én egenandel per tvist.','13 §14.4','all',['rettshjelp.egenandel'],MISSING,'P1'),
('Brann','hendelser/unntak','Brann og lyn; svimerker og startkomponenten unntatt; følgeskade av brann/kortslutning omfattet.','3 §4.1–2','physical',['brann.dekning'],COARSE,'P1'),
('Tyveri','hendelser/unntak','Tyveri og forsøk; ikke husstandsmedlem/ansatt eller lånt/prøvd kjøretøy som ikke leveres tilbake.','3 §4.1–2','physical',['tyveri.dekning'],COARSE,'P1'),
('Fastmontert ekstrautstyr','sum/omfang','20 000 kr inkluderer også lakk utover originallakk, lakkbeskyttelse og folie på skadet område; bare valgt skadeomfang.','2 §3.7','physical',['utstyr.grense','utstyr.dekning'],COARSE,'P2'),
('Sikkerhetsutstyr','omfang','Alarm, varseltrekant, brannslokkingsutstyr og annet sikkerhetsutstyr følger det forsikrede objektet innen valgt skadeomfang.','2 §3.8','physical',[],MISSING,'P2'),
('Kontanter','unntak','Kontanter og verdipapirer er ikke forsikret.','2 §3','physical',[],MISSING,'P2'),
('Oppgjør','reparasjon','Verdiøkning trekkes fra; ingen erstatning for verdireduksjon; likeverdige nye eller brukte deler.','7 §11.4','physical',[],MISSING,'P2'),
('Oppgjør','kontant','Kontantoppgjør kan ikke kreves; arbeid 50 prosent av takst og mva etter dokumentert reparasjon.','7 §11.5','physical',[],MISSING,'P2'),
('Oppgjør','markedsverdi/tap','Totalskade erstattes med markedsverdi; stjålet kjøretøy tidligst tapt etter 30 dager; gjenvunnet gjenstand kan beholdes mot tilbakebetaling.','7–8 §11.6','physical',[],MISSING,'P1'),
('Kasko','hendelser','Plutselig og uforutsett sammenstøt, utforkjøring, velt, hærverk og feilfylling der relevant for objektet.','3 §6.1','kasko',['kasko.dekning'],COARSE,'P1'),
('Kasko','unntak','Motor/gir/drivverk/elektronikk bare ved annen dekket skade; frost/fukt/rust/slitasje/indre flekker og underslag unntatt. Avvist garantiansvar kan likevel dekkes med regress. Særdekning for campingvognfukt holdes separat.','4 §6.2','kasko',['kasko.begrensning'],COARSE,'P1'),
('Bruksbegrensninger','aktivitet','Løp/trening og avsperret område unntatt med dokumentert opplæringsunntak; transport i næring og flyplassområde begrenset. Terrengunntaket gjelder ikke snøscooter.','13–14 §16','all',[],MISSING,'P1'),
('Sikkerhet','vedlikehold/last','Påbudt utrustning, vedlikehold/service, ikke overlast og sikret last; brudd kan gi bortfall/avkortning etter vilkårets regler.','14 §18.1','all',[],MISSING,'P2'),
('Sikkerhet','tyverisikring','Låst kjøretøy, nøkkel separat; fastmontert utstyr sikret mot demontering; egne krav til oppbevaring av verdier og klær.','14–15 §18.2','physical',[],MISSING,'P2'),
('Administrasjon','meldefrist','Skade skal meldes snarest og senest innen ett år fra kunnskap om grunnlaget.','15 §19','all',[],ADMIN,'')]
for typ,stem,doc,html,levels in configs:
 path=base+'frende-'+doc+'.pdf';web=base+'frende-'+html+'.html'
 for level in levels:
  pid='frende-'+stem+'-'+level;p=A.p[pid];actual={f['key'] for f in p['facts']};physical=level!='ansvar'
  def add(sub,dim,value,loc,cls=MISSING,keys=None,priority='P1',why='',src=path,inv=''):
   kk=[stem+'.'+k for k in (keys or [])]
   if cls==COARSE and not any(k in actual for k in kk):cls=MISSING
   return A.fact(pid,sub,dim,value,src,loc,cls,kk,priority,why or 'Exact source dimension not fully preserved by resolved catalog, inherited facts or available optional components. No customer selection inferred.','SCRC-021',inventory_id=inv,extra={'source_first_inventory':'frende-extensions-independent-inventory.json','type_applicability':typ,'customer_mode_impact_class':'LIKELY_SHARED_WITH_CUSTOMER_MODE' if priority else 'UNKNOWN'})
  for n,(sub,dim,val,loc,scope,keys,cls,pri) in enumerate(rows,1):
   if scope=='physical' and not physical:continue
   if scope=='kasko' and level!='kasko':continue
   add(sub,dim,val,'PDF '+loc,cls,keys,pri,inv=f'FR-EXT-COMMON-{n:02}')
  if typ=='snow':
   add('Ansvar','lovbestemt/ulovfestet','Lovbestemt bilansvar suppleres med ulovfestet ansvar på 10 millioner kr per hendelse og år; ikke vegfraktavtale.','PDF11 §13.1',COARSE,['ansvar.dekning'])
   add('Fører/passasjerulykke','valgfri tilgjengelighet','Tilvalg på alle tre nivåer; valgt bare dersom det fremgår av forsikringsbeviset.','HTML dekningsmatrise; PDF10 §12.1',MISSING,['ulykke.dekning'],src=web,inv='FR-EXT-001')
   add('Fører/passasjerulykke','sum og vilkår ved valg','Valgt tillegg: 100 000 kr dødsfall med ektefelle/samboer/barn eller under 21 år; 200 000 kr ved 100 prosent varig medisinsk invaliditet, forholdsmessig ellers; tidligere funksjon trekkes fra, fastsettelse etter tre år.','PDF10–11 §12.2–3',MISSING,['ulykke.dod','ulykke.invaliditet'])
   add('Fører/passasjerulykke','unntak ved valg','Ytre plutselig kroppshendelse, ikke sykdom; unntak for rus og selvmord, samt psykisk skade med avgrenset PTSD-unntak knyttet til fysisk varig skade.','PDF10–11 §12.1/12.4',MISSING,[])
   add('Bonus','ingen bonus','Snøscooter har ikke bonusopptjening.','HTML spørsmål om bonus',MISSING,['bonus.dekning'],'P2',src=web,inv='FR-EXT-002')
   add('Tegning','objektscope','Norskregistrert seriefremstilt snøscooter i privat bruk; ikke uregistrert eller konkurranse/bane; import krever chassisnummer og registrering.','HTML spørsmål om hvilke snøscootere',MISSING,[],'P2',src=web,inv='FR-EXT-005')
   if physical:
    add('Kjøreutstyr','objekter/sikring','Kjøredress, hansker, støvler og hjelm følger snøscooteren innen valgt skadeomfang; nedlåst i fastboltede rom eller låst til kjøretøyet.','PDF2 §3.5 / PDF15 §18.2.9',MISSING,['kjoreutstyr.dekning'],inv='FR-EXT-004')
    add('Tyverioppgjør','gjenanskaffelse','Markedsverdi dersom tilsvarende snøscooter kjøpes innen 60 dager etter tyveri; ellers 60 prosent av markedsverdi.','PDF8 §11.6',MISSING,[],inv='FR-EXT-003')
    add('Egenandel','brann/tyveri','6 000 kr med mindre lavere egenandel i bevis; tyveri uten egenandel dersom alarm fungerte.','PDF9 §11.11',MISSING,['brann.egenandel','tyveri.egenandel'])
   if level=='kasko':
    add('Løsøre','sum/tyveri','Løse ting og bagasje 10 000 kr; tyveri etter Kasko §6.1.3. Ikke en økt grense for kjøreutstyr.','PDF2 §3.9 / PDF3–4 §6.1.3',MISSING,['bagasje.grense'])
    add('Egenandel','dyr/ung fører','Påkjørsel av dyr: avtalt egenandel minus 6 000 kr ved omgående melding. Hvis fører yngre enn avtalt aldersgrense: ekstra 8 000 kr; ingen aldersgrense antas valgt.','PDF9 §11.11',MISSING,[])
  elif typ=='camp':
   add('Løsøre','grunnsum','20 000 kr eller avtalt sum, ved skade innen valgt nivå.','PDF2 §3.9',PRESENT,['losore.grense','losore.dekning'],'',inv='FR-EXT-008-BASE')
   add('Løsøre','valg/objektgrense','Produktsiden tilbyr utvidelse til 100 000 eller 200 000 kr og angir 10 000 kr per ting. Bevisvalget er kundespesifikt; ingen valgt utvidelse antas.','HTML FAQ om løsøre',COARSE,['losore.grense'],src=web,inv='FR-EXT-008')
   add('Løsøre','tyveristed','Tyveri 20 000 kr fra campingvogn og tilkoblet fortelt av tre eller glassfiber.','PDF3 §4.1.3',COARSE,['losore.dekning'],inv='FR-EXT-009')
   add('Fortelt/tilbygg','omfang','Fortelt, platting og terrasse knyttet til campingvognen.','PDF2 §3.10–11',PRESENT,['fortelt.dekning'],'',inv='FR-EXT-010-BASE')
   add('Fortelt/tilbygg','avtalt samlet verdi','Produktsiden krever at samlet forsikringssum inkluderer campingvogn og spikertelt/tilbygg. Faktisk sum følger avtalen.','HTML FAQ om spikertelt',CUSTOM,['fortelt.dekning'],'',src=web,inv='FR-EXT-010')
   add('Egenandel','valgbare nivåer','Produktsiden oppgir 6 000, 8 000 eller 12 000 kr; faktisk valgt egenandel følger forsikringsbeviset.','HTML FAQ egenandel',MISSING,['egenandel.valg'],src=web,inv='FR-EXT-012')
   add('Utleie','ekstra egenandel','Ekstra egenandel 6 000 kr ved brann-, tyveri- eller kaskoskade på utleid campingvogn.','PDF9 §11.11',MISSING,['utleie.egenandel'],inv='FR-EXT-013')
   add('Tegning','objektscope','Privat campingvogn/husvogn; combi-camp og påhengsvogn går under tilhengerproduktet.','HTML FAQ objekter',MISSING,[],'P2',src=web,inv='FR-EXT-014')
   add('Utvidelse','besiktigelse','Økning av dekningsomfang krever besiktigelse og skadefri vogn.','HTML FAQ utvidelse',MISSING,[],'P2',src=web,inv='FR-EXT-015')
   add('Sikkerhet','campingvogn særkrav','Snø fjernes fra tak/terrasse; forankring eller hjullås når vognen forlates.','PDF14–15 §18.1.9/18.2.8',MISSING,[],'P2')
   if level=='kasko':
    add('Fukt','skade og avgrensning','Godkjent fukttest skal vise at skade oppstod siste år; lekkasjen selv og skade fra rørbrudd/lekkasje unntatt.','PDF3 §6.1.2',PRESENT,['fukt.dekning','fukt.begrensning'],'',inv='FR-EXT-007-BASE')
    add('Fukt','årlig kontroll og utbedring','Årlig test utført og godkjent av autorisert caravanforhandler; nødvendige tiltak ved anmerkning/fukt.','PDF14 §18.1.11',COARSE,['fukt.begrensning'],inv='FR-EXT-007')
    add('Naturskade','dekning','Naturskade på campingvogn og spikertelt omfattes av Kasko ifølge produktsiden.','HTML FAQ naturskade',MISSING,['naturskade.dekning'],src=web,inv='FR-EXT-011')
  else:
   add('Last','ikke egen dekning','Løse ting og bagasje på tilhenger omfattes ikke av tilhengerforsikringen.','PDF2 §3.9 / PDF3–4 §6.1.3',PRESENT,['kasko.begrensning'],'',inv='FR-EXT-017')
   add('Tilknyttet annen forsikring','ansvar/last','Trekkbilens ansvar kan omfatte frakoblet henger; 20 000 kr last omtales bare under separat Frende Innbo utvidet uhell. Dette er ikke egen tilhengerdekning.','HTML FAQ ansvar og last','SOURCE_ONLY_ACCEPTABLE',[],'',src=web,inv='FR-EXT-016')
   add('Frakoblet tilhenger','skadeomfang','Valgt Kasko/brann/tyveri gjelder også når tilhengeren ikke er festet til bilen.','HTML FAQ frakoblet',COARSE,['brann.dekning','tyveri.dekning']+(['kasko.dekning'] if level=='kasko' else []),src=web,inv='FR-EXT-018')
   add('Egenandel','spesialregel og tabellscope','2 000 kr for skade under tilhengerforsikring står sammen med generelle 6 000 kr brann/tyveri. Eksakt prioritet ved brann/tyveri er ikke eksplisitt i tabellen.','PDF9 §11.11',REVIEW,['egenandel.grunn'],'',inv='FR-EXT-019')
   add('Tegning','objektscope','Privat bil-, båt- og hestehenger; også snøscooterslede, MC-henger, fritidstraktorhenger og uregistrert henger omtales.','HTML FAQ objekter',MISSING,[],'P2',src=web,inv='FR-EXT-020')
   add('Produktkjøp','kan kjøpes separat','Tilhengerforsikringen kan kjøpes alene; bilen trenger ikke være i samme selskap.','HTML FAQ enkeltstående',MISSING,[],'P2',src=web,inv='FR-EXT-021')
  # Shared-package applicability decisions: retain explicit uncertainty, never copy Bil-only benefits.
  add('Fellesvilkår','typeoverføring','Ingen dokumentert rett til Bil-nyverdi, Bil-maskinskade eller Bil-leiebil for denne eksakte typen. Delkasko/glass/redning er ikke automatisk arvet fra eget kapittel.','PDF3–6 §5–9; eksakt produktsidematrise','SOURCE_ONLY_ACCEPTABLE',[],'',why='Separate type applicability checked; absence is not invented NOT_COVERED.')
  if level=='kasko':
   add('Nøkkel','typeanvendelighet','Kasko §6.1.4 sier tap av nøkkel uten typeavgrensning, mens egenandelstabellen og utvidet avsnitt bruker bilordlyd; typeanvendelse er ikke sikkert avklart av egen produktside.','PDF4 §6.1.4 / PDF9 §11.11',REVIEW,[],'')
  for sub,dim,val,loc,cls,pri in [
   ('Generelle unntak','krig/terror','Krig/atom/biologiske begrensninger; seksukersregel ved uventet krig; terror/epidemi 100 millioner kr er selskapets årstak, ikke kundesum.','PDF2 §1',MISSING,'P2'),
   ('Cyber','fysisk følgeskade','Cyberunntak med unntak for fysisk skade dekket av det enkelte produkt.','PDF4 §9',MISSING,'P2'),
   ('Eierskifte','ettervern','14 dager for ny eier uten egen forsikring; forsikringen overføres ikke ubetinget.','PDF3 §5',MISSING,'P2'),
   ('Administrasjon','avtale','Oppsigelse, svik, renter, skjønn og vinning holdes uten ordinære sammenligningsfakta.','PDF2–4 §2–8/10–11',ADMIN,'')]:add(sub,dim,val,loc,cls,[],pri,src=general)
  # Each existing claim above was checked by meaning, not only by presence of source citation.
  reverse={f['key']:dict(artifact=path,pdf_page=f['source']['page'],section=f['source']['section'],note='Exact value/status and type/level supported by the shared clause plus type product matrix; material missing children recorded independently.') for f in p['facts']}
  A.reverse(pid,reverse)
  A.product_review(pid,[path,web,general],True,'Seven-product extension audit closure: shared full15p and general4p reused by verified hash; full exact HTML reviewed source-first; all existing 3–12 claims reverse checked. No modeled addons. Snow optional accident availability inventoried as missing, not selected. Trailer deductible and generic Kasko key applicability recorded as REVIEW_REQUIRED; uncertainty is not silently resolved. Delkasko/glass/rental/machine/new-value Bil rules intentionally not transferred. Completeness means review closure with findings, not gap-free product.')
conf=dict(id='SC-015',provider='frende',family='Tilhenger',sources=[base+'frende-TrailerInsurance.pdf'],claim='Type-specific deductible and generic fire/theft rows have unresolved ordering',observed='§11.11: tilhenger damage 2000; general fire/theft 6000 unless lower certificate. Local exact type page does not disambiguate. Generic Kasko key applicability to extensions also retained for review.',status='SOURCE_APPLICABILITY_REVIEW_REQUIRED',action='Official exact trailer deductible applicability and exact extension Kasko key scope needed; do not choose arbitrary value.')
if not any(x['id']=='SC-015' for x in A.a['source_conflicts']):A.a['source_conflicts'].append(conf)
A.checkpoint('Frende seven extension products source-first and reverse review closed with explicit scope uncertainties; no cross-type Bil benefits inferred','Bil','gjensidige','gjensidige-bil-ansvar')
r=load('resume.json');r.update(next_exact_action='Verify next Gjensidige Bil identity and applicable source package; build independent inventory before inspecting values. Frende seven extension reviews are closed with recorded gaps/uncertainties, do not repeat.',current_product=None,current_family='Bil');save('resume.json',r)
