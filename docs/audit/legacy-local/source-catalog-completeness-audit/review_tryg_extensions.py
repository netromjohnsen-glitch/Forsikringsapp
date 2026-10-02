from continue_audit import *
A=Audit();I=load('tryg-extensions-independent-inventory.json');B='catalog/sources/vehicle-extensions/'
A.root('SCRC-045','Tryg kjøretøyutvidelser beholder nivånavn, men utelater materielle tall/vilkår. Campingvogn mister naturskade som finnes eksplisitt i egne kilder; tillegg og grunnprodukter må ha type/nivåspesifikke tall.','45source-firstregler,13unikePDF+6HTMLsamtgjenbruktlegal/general;CampingvognKaskoNaturskadeunknownbekreftetsideswapruntime.',['Snøscooter','Campingvogn','Tilhenger'],['tryg'],'RB-41')
K={1:['avtale.geografi'],2:[],3:['ansvar.dekning','ansvar.grense'],4:[],5:['avtale.sesong'],6:[],7:['utstyr.dekning','utstyr.grense'],8:['brann.dekning','brann.egenandel','tyveri.dekning','tyveri.egenandel'],9:['redning.begrensning'],10:['kasko.dekning','kasko.egenandel'],11:['kasko.var'],12:['forerulykke.dekning','forerulykke.grense','ulykke.dekning','ulykke.grense'],13:['forerulykke.dekning','ulykke.dekning'],14:['ansvar.dekning'],15:['avtale.forsikringssum'],16:['utstyr.dekning','utstyr.grense'],17:['fortelt.dekning'],18:['losore.dekning','losore.grense'],19:['brann.dekning','brann.egenandel'],20:['tyveri.dekning','tyveri.egenandel'],21:['fortelt.dekning'],22:['utleie.dekning'],23:['naturskade.dekning','naturskade.egenandel'],24:['naturskade.begrensning'],25:['kasko.dekning','kasko.begrensning'],26:['kasko.var'],27:['glass.dekning','glass.egenandel'],28:['reparasjon.kontant'],29:['reparasjon.garanti'],30:['totalskade.oppgjor','avtale.forsikringssum'],31:['utstyr.aldersfradrag'],32:['fjerning.grense'],33:[],34:['utleie.begrensning'],35:[],36:['utstyr.grense'],37:['losore.grense','losore.egenandel'],38:['skadedyr.dekning'],39:['fukt.dekning','fukt.alder','fukt.egenandel'],40:['fukt.begrensning'],41:['ferie.dekning','ferie.grense','ferie.begrensning'],42:['rettshjelp.dekning','rettshjelp.grense','rettshjelp.egenandel'],43:['rettshjelp.begrensning'],44:[],45:[]}
full={1,3,15,36,39}
why={2:'Eier/panthaver/14dregelikkevist.',4:'PDFprodukt/IPID/webuenigeomavregistrering;ikkevelgverdi.',5:'Sesongfordelingkorrektparent;prosenttabellutelatt.',6:'Vesentligevilkårforbruk/ungeførere/baneutelatt.',7:'Hjelmog10kfastutstyrutelatt.',8:'Brann/tyveribareinkludert,6kBT4kKaskotallmangler.',9:'Kaskoeksplisittkorrektunntak,BTutelatt.',10:'Bareinkludertmisterfeilfyllingog24t/utløseravgrensning.',11:'Værinnendørs0egenandelmangler.',12:'Sum/rollekorrekt;dødinnen1år/gradertinvaliditetmangler.',13:'Materielleulykkeunntakog1årsoppgjørmangler.',14:'Ansvarligtrekkbil-sisttilknyttetforklaringmangler.',16:'10kpositiv;standardhjul/utoversum/materiellgrenseutelatt.',17:'Forteltallematerialerkorrekt;spikerteltmåinnisummangler.',18:'15k5kkorrekt;bevisvalg/utoversum/verdigjenstandsunntakmangler.',19:'Kasko6kbevart;Brann/BT4kmangler,utløserbredparent.',20:'Kasko6kbevart;BT4kmanglerogforsøkshærverkdetalj.',21:'TyveriunntakgittigrunnmenExtraoverstyrerfortelttekstutenåvidereføretyveribegrensning.',22:'Avtaltunderslag3mndmedrelasjonunntakmangler.',23:'Campingnaturskade8kogdekningmangler;Tilhengertallriktigmenfarelistegrovere.',24:'Viktigekategoriskegrensernaturskademangler.',25:'Bevartegrunnunntakmenutløserfarerogplutselig24tutelatt.',26:'Værinnendørs0egenandelmangler.',27:'Glass3k/0ogkrakelering/verkstedmangler;Tilhengerogsåheledekningen.',28:'70%kontantreparasjonogforbedringsfradragmangler.',29:'8årkarosseriverkstedsgarantimangler;motorspråktypereviewikkeoverføremotortilTilhenger.',30:'MarkedsverdiforsikringssumbevartTow;snømangleroppgjørsform.',31:'10%perårmax50%elektronikkutelatt.',32:'Fjerningutoverforsikringssummaterialutelatt.',33:'Forteltsikring/flomflytting/gassvilkårbevaressomkildedetalj.',34:'Utleierisikoogbegrensetidentifikasjonikkemodellert.',37:'50/15/10kkorrekt,1kegenandel/utvidetbevisvalg/ikkeutleiemangler.',38:'Bareinkludertmisterjevnliginnsyn/sikring/ingenmat.',40:'Unntakkorrekte;årligfukttestumiddelbartiltakoggarantifallbackmangler.',41:'Beløpogperiodekorrekt;dekketskadeogpåbegyntreiseutløser/leievognopphold/dokumentasjonutelatt.',42:'Rettshjelpbareinkludert,mister100k250k20k/4k20%.',43:'Rettshjelpbegrensningoghvem/ettersalgmangler.'}
for typ,stem in [('snow','snoscooter'),('camp','campingvogn'),('trailer','tilhenger')]:
 tiers=['ansvar','brann-og-tyveri','kasko'] if typ=='snow' else ['brann','brann-og-tyveri','kasko']+(['campingvogn-ekstra'] if typ=='camp' else [])
 for tier in tiers:
  pid=f'tryg-{stem}-{tier}';p=A.p[pid];extra=tier.endswith('ekstra');kasko=tier=='kasko'or extra;physical=tier!='ansvar';theft=tier in ['brann-og-tyveri','kasko']or extra;rows=[]
  paths={'product':B+('tryg-odpdf-dbf5be98.pdf'if typ=='snow'else'tryg-odpdf-778e88dd.pdf'),'safety':B+('tryg-odpdf-e47c9440.pdf'if typ=='snow'else'tryg-odpdf-65439673.pdf'),'ansvar':B+'tryg-odpdf-060a2170.pdf','accident':B+'tryg-odpdf-2001c3a6.pdf','accident-pass':B+'tryg-odpdf-56716918.pdf','legal':B+'tryg-odpdf-d8d47def.pdf','general':B+'tryg-odpdf-911ff8ae.pdf','extra':B+'tryg-odpdf-d09fac80.pdf','web':B+f'tryg-{stem}forsikring.html','ipid':B+('tryg-IPID-Snoscooter.pdf'if typ=='snow'else'tryg-IPID-Campingvogn-og-tilhenger.pdf')}
  paths['kasko']=B+('tryg-odpdf-5a0a847f.pdf'if typ=='snow'else'tryg-odpdf-03ff0533.pdf')
  paths['physical']=paths['kasko']if kasko else B+('tryg-odpdf-0d60de94.pdf'if typ=='snow'else 'tryg-odpdf-543856fa.pdf'if tier=='brann'else'tryg-odpdf-05b2538c.pdf')
  used={paths[k]for k in ['product','safety','web','ipid','legal','general']}
  used.add(B+'tryg-vilkar-'+({'snow':'fc5e4fcd','camp':'812784ac','trailer':'75f064ed'}[typ])+'.html')
  for n,q in enumerate(I['rules'],1):
   if q['type']not in ['all',typ] and not(q['type']=='tow'and typ!='snow'):continue
   if q['scope']=='physical'and not physical or q['scope']=='kasko'and not kasko or q['scope']=='theft'and not theft or q['scope']=='extra'and not extra or q['scope']=='base'and extra:continue
   if n==16 and extra:continue
   keys=[stem+'.'+k for k in K[n]];path=paths[q['source']];used.add(path);loc=q['location'];value=q['value']
   if n in [7,8,9,10,11,28,29,30]and typ=='snow':temporal='SpecificPAU26320/25505effective2026-10-01;catalogsnapshotSep29preserved;notolderversionproof.'
   else:temporal='Exactlocalversion'
   cls=PRESENT if n in full else COARSE if any(f['key']in keys for f in p['facts']+sum(p['addonFacts'].values(),[]))else MISSING;pri=''if cls==PRESENT else 'P1'
   if n in [2,5,6,13,14,16,18,24,25,29,34,43]:pri='P2'if cls!=PRESENT else''
   if n==9 and kasko or n==21 and not extra:cls=PRESENT;pri=''
   if n==30 and typ!='snow':cls=PRESENT;pri=''
   if n==4:cls='SOURCE_CONFLICT_REVIEW_REQUIRED';pri='P1'
   if n in [33,44,45]:cls='SOURCE_ONLY_ACCEPTABLE';pri=''
   if n==35:cls='SOURCE_FACT_ALREADY_REPRESENTED_BY_PARENT';pri=''
   if n==23 and typ=='trailer':cls=COARSE;pri='P2'
   if n==8:value='Brann/tyveri '+('4kKasko'if kasko else'6kBrannTyveri')+';åpenild/lyn/eksplosjon/tyveri/forsøkshærverk.'
   if n==19:loc='2 §2.2'if kasko else'1 §2.1';value=('6k'if kasko else'4k')+'hvisikkelavereavtalt;åpenild/lyn/eksplosjon.'
   if n in [20,21,22]:loc='2 §2.3'if kasko else'1–2 §2.2'
   if n==23:loc='2–3 §2.5'if kasko else'1–2 §2.2'if tier=='brann'else'2 §2.3'
   if n==24:loc='3 §2.5'if kasko else'2 §2.2'if tier=='brann'else'2 §2.3'
   comps=['tryg-snoscooter-forerulykke','tryg-snoscooter-ulykke']if n in [12,13]else['']
   for comp in comps:
    if comp=='tryg-snoscooter-ulykke':path=paths['accident-pass'];used.add(path);value=value.replace('PAU28002fører/passasjerbarehvisflerpersonregistrert','PAU28003førerogpassasjer');keys=['snoscooter.ulykke.dekning','snoscooter.ulykke.grense']
    rows.append(A.fact(pid,q['subject'],q['dimension'],value,path,loc,cls,keys,pri,why.get(n,'Korrektnivåregelbevart;fullclaimkontrollert.'),'SCRC-045',component=comp,inventory_id=q['id'],extra={'source_first_inventory':'tryg-extensions-independent-inventory.json','temporal_applicability_note':temporal}))
  rev={}
  for cf in p['facts']+sum(p['addonFacts'].values(),[]):
   ee=[f for f in rows if cf['key']in f['proposed_keys']]
   if ee:rev[cf['key']]={'locations':[{'artifact':f['source_artifact'],'location':f['source_location']}for f in ee],'note':'Numeric/coreclaimchecked;missingmaterialqualifiersseparate'}
  A.reverse(pid,rev)
  A.product_review(pid,sorted(used),True,'FullPDF/IPID/HTML sourcefirst45rules. Sharedbytesdeduplicatedwithtype/levelmeaningseparate. SnowOct1documentspreservedasdatedoriginals. Campnaturskadeomissionverifiedownsource+side-swapruntime. NoTilhengermotororCampingextra leakage; no inferencefromHTMLlostcheckboxmarkers.')
for ad in A.a['addon_coverage']:
 if ad['addon_id']in['tryg-snoscooter-forerulykke','tryg-snoscooter-ulykke']:ad.update(status='COMPLETE_WITH_RECORDED_GAPS',fully_audited=True,notes='PAU28002and28003separatesourcesandroles;optional,200k/100ksupported;qualifiersmissing.')
A.a['source_conflicts'].append(dict(id='SC-049',provider='tryg',family='Snøscooter',product='tryg-snoscooter-*',sources=[B+'tryg-odpdf-dbf5be98.pdf',B+'tryg-IPID-Snoscooter.pdf',B+'tryg-snoscooterforsikring.html'],claim='Avregistrering',observed='ProductJan2024ansvaropphør;HTMLansvarulykkeopphørandrebeholdes;IPIDJul2025avskiltingavslutterforsikringen.',status='SOURCE_CONFLICT_REVIEW_REQUIRED',action='Avklarversjon/valg,ikkefjernfysiskeellerulykkeutenavklaring.'))
A.a['source_research_queue'].append(dict(queue_id='SR-tryg-extension-scope',product=['tryg-snoscooter-brann-og-tyveri','tryg-snoscooter-kasko','tryg-campingvogn-campingvogn-ekstra'],reason='SnowOct1PDFBT6kvsHTML4kutennivå;avregistreringskonflikt;campwebintroavlystvsfullpåbegyntavbrutt;aldriutviddekningpåmarkedsintroalene.',external_source_needed_if_unresolved='Nivå/versjonsavklaringforwebtillegg;ingenexternhentingnå.',downloaded=False))
v=load('verified-false-unknowns.json');pid='tryg-campingvogn-kasko';ff=[f for f in A.f if f['product']==pid and f['source_first_inventory_id']=='TR-EXT-023'];probe=load('runtime-tryg-extensions-probe.json')[0]
assert probe['forward'][0]['first']['state']=='unknown' and probe['reverse'][0]['second']['state']=='unknown'
v.append(dict(product_identity=A.p[pid]['identity'],key='campingvogn.naturskade.dekning',peer_identity=probe['right'],display_state='unknown',display_text='Ikke dokumentert i kataloggrunnlaget',source_fact_ids=[f['source_fact_id']for f in ff],finding_ids=[f['finding_id']for f in ff],side_swap_consistent=True,cause='EgetPAU25255§2.5/IPID/produktnettsidebekrefterNaturskade;exactcatalogmanglerparentogchild.',source_scope_note='Ifkunvisningsprobe,Trygskildebevisgiregenproduktregel.',probe='runtime-tryg-extensions-probe.json'))
save('verified-false-unknowns.json',v)
A.checkpoint('Tryg snow/caravan/trailer ten levels and two addons closed; caravan naturskade false unknown verified','Båt','tryg','tryg-bat-ansvar')
