from continue_audit import *
A=Audit();I=load('if-pet-independent-inventory.json')
A.root('SCRC-042','If Hund/Katt hovednivåer og Liv har bare delvis materialisert fullvilkårets sykdoms-/alders-/sumperiode- og særvilkår. Basisutredning, fødsel/medfødt, artsbestemte leddkrav og Livsytelser går tapt bak få hovedfakta.','HUN2-1/KAT2-1 desember2022 source-first,tidligerepartialSF-raderbevart;eksaktenivåeroglivkontrollertmed39utvidedeinventarregler.',['Hund','Katt'],['if'],'RB-38')
K={1:['dyr.veterinar.sum.valgbar'],2:['dyr.veterinaralder.opphor'],3:['dyr.tannskade.dekning'],4:['dyr.medisin.dekning'],5:['dyr.tannsykdom.dekning','dyr.tannsykdom.grense'],6:['dyr.tannsykdom.dekning'],7:['dyr.allergi.dekning','dyr.allergi.grense'],8:['dyr.rehabilitering.dekning'],9:['dyr.keisersnitt.dekning'],10:['dyr.keisersnitt.dekning'],11:['dyr.medfodt.dekning'],12:['dyr.avlivning.dekning'],13:['dyr.veterinar.rollover'],14:['dyr.liv.dekning'],15:['dyr.liv.sum.valgbar'],16:['dyr.liv.reduksjon.start','dyr.liv.reduksjon.sats','dyr.liv.opphor'],17:['dyr.liv.reduksjon.start','dyr.liv.opphor'],18:['dyr.liv.dekning'],19:['dyr.kremering.dekning'],20:['dyr.forsvinning.dekning'],21:['dyr.bruksverdi.dekning'],22:[],23:[],24:[],25:[],26:['dyr.karenstid.sykdom'],27:[],28:[],29:[],30:[],31:[],32:[],33:['dyr.veterinar.sum.valgbar'],34:['dyr.veterinar.egenandel.fast'],35:[],36:[],37:[],38:[],39:[]}
oldmatch={1:('Veterinær','årsperiode'),2:('Veterinær','opphør'),3:('Tannulykke','dekning'),8:('Rehabilitering','frist'),13:('Rollover','kvalifiserende vilkår'),14:('Liv','valgfrihet'),26:('Karenstid','sykdom'),34:('Veterinær','valgt egenandel'),37:('Administrasjon','skademelding')}
for species in ['hund','katt']:
 animal='dog' if species=='hund' else 'cat';T=f'catalog/sources/boat-pet/if-{animal}-terms.pdf';D=f'catalog/sources/boat-pet/if-{animal}-ipid.pdf'
 for tier in ['basis','standard','super']:
  pid=f'if-{species}-{tier}';p=A.p[pid];rows=[];addon=f'if-{species}-liv';prior=[f for f in A.f if f['product']==pid]
  for n,q in enumerate(I['rules'],1):
   if q['scope']=='upper' and tier=='basis' or q['scope']=='super' and tier!='super' or q['scope'] in ['dog','doglife'] and species!='hund' or q['scope']=='cat' and species!='katt' or n==17 and species!='hund':continue
   old=oldmatch.get(n)
   if n==4 and tier=='basis':old=('Medisin','behandlingssted')
   if n==4 and tier=='standard':old=('Medisin','utvidelse')
   if n==5 and tier=='standard':old=('Tannsykdom','livstidsgrense')
   if n==5 and tier=='super' and species=='katt':old=('Tannresorpsjon','årlig undergrense')
   if n==7 and tier=='standard':old=('Allergibehandling','livstidsgrense')
   existing=next((f for f in prior if old and (f['semantic_subject'],f['semantic_dimension'])==old),None)
   if existing:
    existing['continuation_inventory_links']=list(set(existing.get('continuation_inventory_links',[])+[q['id']]))
    rows.append(existing);continue
   comp=addon if q['scope'] in ['life','doglife'] else ''
   fs=p['addonFacts'].get(comp,[]) if comp else p['facts']
   cls=COARSE if any(f['key'] in K[n] for f in fs) else MISSING;pri='P1';val=q['value'];loc=q['location']
   if n in [4,6,7,15,17,18,22,24,25,27,28,29,30,33,35,38]:pri='P2'
   if n==16 and species=='katt':
    existing=next(f for f in prior if f['semantic_subject']=='Liv' and f['semantic_dimension']=='aldersmodell');rows.append(existing);continue
   if n==16 and species=='hund':val='Gruppe1fra6år20%forrigesumtilhovedforfall8;gruppe2fra8til10;gruppe3fra10til12.';loc='6 §5.2'
   if n==15:val=('Valgtbeløpmenmaxnyhundavsammerase;IDhvis>15k;bruksverdiutbetalingredusererliv;annenlivserstatninghindrerdobbel.' if species=='hund' else 'Valgtbeløpmenmaxnykattavsammerase;alltidID-merket;annenlivserstatninghindrerdobbel.')
   if n==23:val=('Hund:forsikretfør4mndOGbeggeforeldreNKKfri.' if species=='hund' else 'Katt:forsikretfør4mndELLERbeggeforeldrefrie.')
   if n==5:val=('HundSuperkaries/TRinntilveterinærsumÅRLIG.' if species=='hund' else val)
   if n==7:val='Basisutredningallergi.' if tier=='basis' else 'SuperallergibehandlinginntilveterinærsumÅRLIG.'
   if n==9:cls='SOURCE_CONFLICT_REVIEW_REQUIRED';pri='';val+=' IPID bruker merenn1år/ikkeflereenn2;SC045.'
   if n==36:cls='SOURCE_ONLY_ACCEPTABLE';pri=''
   if n==39:cls='SOURCE_CONFLICT_REVIEW_REQUIRED';pri=''
   # Species-specific physical pages, no cross-species source attribution.
   if '/Katt' in loc:
    import re
    dog,tail=loc.split('/Katt');cat,section=tail.split(' §',1);loc=(dog.replace('Hund','') if species=='hund' else cat)+' §'+section
   loc=loc.replace('Hund','')
   why='Materiell kildebestemmelse ikke trygt representert i eksakt base/inheritance/optional; arts- og nivåkontekst beholdt.'
   if n==16:why='Raseavhengig start/opphør er sann hovedpåstand, men konkrete6/8/10og8/10/12grener mangler;ikke kundens alder.'
   if n==17:why='Kildens rasegrupper mangler ved henvisning dokumentert rasegruppe; kan lagres som provider-spesifikk detalj.'
   if n==7 and tier=='super':why='Superallergi med,men årligperiode er ikke eksplisitt på valgtveterinærsum.'
   if n==5:why='Superpositiv kjerne korrekt,men årligperiode/avgrensning tilkaries/TRikkevist;KattTRhåndtertallerede.'
   if n==38:why='VeterinærEuropaogvalgfriLivverdenmangler;geografienmåholdesatskilt.'
   rows.append(A.fact(pid,q['subject'],q['dimension'],val,D if n==39 else T,loc,cls,K[n],pri,why,'SCRC-042',component=comp,inventory_id=q['id'],extra={'source_first_inventory':'if-pet-independent-inventory.json'}))
  # Reverse every base and optional claim; previously recorded broad controls remain, errors get explicit override.
  rev={}
  for cf in p['facts']+sum(p['addonFacts'].values(),[]):
   ee=[f for f in rows+prior if cf['key'] in f['proposed_keys']]
   if cf['key']=='dyr.veterinar.dekning':ee=[A.fact(pid,'Veterinær','inkludertgrunn','Sykdom/ulykke veterinærutgifter etteravtalt nivå,ikkeubetingetalleårsaker.',T,'4 §5.1',PRESENT,[cf['key']],inventory_id='IF-PET-BASE-POSITIVE')]
   if ee:rev[cf['key']]={'locations':[{'artifact':f['source_artifact'],'location':f['source_location']} for f in ee]}
  A.reverse(pid,rev)
  for c in A.support:
   if c['product_identity']!=p['identity']:continue
   if c['key']=='dyr.veterinar.rollover':c.update(support_status='CATALOG_FACT_TOO_COARSE',full_claim_validated=False,manual_reverse_evidence={'artifact':T,'location':'5 §5.1.9','note':'10k/capcorrect,butunuseddoesnotentailskadefritt;existingSFfindingpreserved.'})
   if c['key']=='dyr.tannsykdom.dekning' and species=='katt' and tier=='super':c.update(support_status='CATALOG_FACT_TOO_COARSE',full_claim_validated=False,manual_reverse_evidence={'artifact':T,'location':'4 §5.1.3','note':'TR5kannualexceptionnotrepresentedbywithinvetlimit;existingSFfindingpreserved.'})
  A.product_review(pid,[T,D],True,'Continuedexistingpartialreviewwithoutduplicatepriorfindings;39-ruleindependentinventoryextendsHUN2-1/KAT2-1andIPID,allmaterialveterinary+lifechaptersreviewed. ExactHund/KattHDAND/ORpreserved;noinventedfixedsum/deductible. Lifeoptional,rasetables,missing/bruksverdi/cremationclosed. Separateungdyrproductexplicitoutofactivecatalogscope;IPIDbirthtimingconflictSC045.')
 for ad in A.a['addon_coverage']:
  if ad['addon_id']==f'if-{species}-liv':ad.update(status='COMPLETE_WITH_RECORDED_GAPS',fully_audited=True,notes='AllthreeveterinarylevelsoptionalLife;lifesumcustomerchoice,trueagemechanismverified,remainingexactbreedbranches/ID/sixmonthdisappearance/cremation/usevalue/lifelimitationrecorded.')
A.a['source_conflicts'].append(dict(id='SC-045',provider='if',family='Hund/Katt',product=[f'if-{s}-{t}' for s in ['hund','katt'] for t in ['basis','standard','super']],sources=[f'catalog/sources/boat-pet/if-{s}-{d}.pdf' for s in ['dog','cat'] for d in ['terms','ipid']],claim='Keisersnitt: minst vs mer enn ett år; færre enn to vs ikke flere enn to tidligere',observed='Full5.1.6:minstettår/ikketoellerflere;IPID:merennettår/ikkeflereennto. Exactboundariesconflict.',status='SOURCE_CONFLICT_REVIEW_REQUIRED',action='Getapplicableclarification;donotflattenexacteligibilityboundary.'))
A.checkpoint('If Hund/Katt all six levels and two Liv addons closed; reused prior facts and audited remaining conditions','Bil','tryg','bil-ansvar')
