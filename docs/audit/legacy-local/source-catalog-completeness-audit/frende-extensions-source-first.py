from continue_audit import *
base=load('frende-vehicle-independent-inventory.json')
# Shared text was read before these exact extension catalog facts; record intentional type exclusions and do not inherit Bil.
rows='''snow|Fører/passasjerulykke|valgfritt|Tilvalg på alle3Snønivåer;100000dødmedfamilie/under21,200000100%invaliditet,proposjonalt,3årsoppgjør,12.4unntak.|HTMLtable+PDF10–11punkt12
snow|Bonus|ingen|Ingen bonusopptjening for snøscooter.|HTMLFAQ
snow|Tyverioppgjør|gjenanskaffelse|Markedsverdi hvis tilsvarende scooter kjøpes innen60d;ellers60%avmarkedsverdi;ikke sammenbland med erstatningssumtak.|PDF8punkt11.6
snow|Kjøreutstyr|objekter|Dress/hansker/støvler/hjelm forsikret;fastlåst/nedlåstkrav18.2.9.|PDF2punkt3.5/PDF15
snow|Tegning|bruk|Norskregistrertserieprivat;ikkuregistrert/konkurranse/bane;komplettchassis/importregistrering.|HTMLFAQ
snow|Terreng|begrensningunntak|Generellterrengforbudgjelderikkesnøscooter;øvrigeløp/baneogfarligiskravgjelder.|PDF13–14punkt16/18.1.8
camp|Fukt|kaskovilkår|Godkjentfukttestskadeoppståttsisteåret;ikkereplekkasje,rørbruddlekkasjeunntatt;årligtestavcaravanforhandlerogtiltak.|PDF3punkt6.1.2/PDF14punkt18.1.11
camp|Løsøre|sumvalg|20000ellerbevis;HTMLutvidelse100000eller200000,10kpertingkunHTML.|PDF2punkt3.9/HTMLFAQ
camp|Løsøre|tyveristed|Tyveriløsøre20kfravognogtilkobletforteltavtre/glassfiber.|PDF3punkt4.1.3
camp|Fortelt/tilbygg|objektscope|Fortelt/spikerteltomfattet,totalforsikringssumvogn+tilbygg;platting/terrasseknyttetvogn.|PDF2punkt3.10–11/HTMLFAQ
camp|Naturskade|kasko|Kaskodekkernaturskadepåvognogspikertelt,HTMLexplicit.|HTMLFAQ
camp|Egenandel|valg|6000/8000/12000valgmuligheter;faktiskvalgkundespesifikt.|HTMLFAQ
camp|Utleie|tilleggsegenandel|6000ekstravedbrann/tyveri/kasko underutleidvogn.|PDF9punkt11.11
camp|Tegning|objekt|Privatcampingvogn/husvogn;combi-camp/påhengsvognforsikressomtilhenger.|HTMLFAQ
camp|Utvidelse|besiktigelse|Øktdekningsomfangkreverbefaringogskadefrivogn.|HTMLFAQ
trailer|Ansvar|tilknytning|Trekkbilensansvardekning,lasttrekkbilogsåfrakoblet;ikkeegeninkludertansvarpåtilhengerpolicy.|HTMLFAQ
trailer|Last|ikkeegentilhengerdekning|Fullterms3.9/6.1.3ekskltilhenger;20ktransportlastavhengigseparatFrendeInnboutvidetuhell,ikkeegenkundedekning.|PDF2–3/HTMLFAQ
trailer|Frakoblet|kasko/brann/tyveri|Disseegenskadedekningerogsånårtilhengerikkeerfestettilbil.|HTMLFAQ
trailer|Egenandel|særregel|Tilhengerforsikringskade2000;generellbrann/tyveri6000stårisammetabell,scopefortolkningikkeautomatisk.|PDF9punkt11.11
trailer|Tegning|objekter|Norskregistrertbil/båt/hestehenger,ogsåsnow-slede/MChenger/fritidstraktorhenger/uregistrert;privatbruk.|HTMLFAQ
trailer|Produktkjøp|enkeltstående|Kan kjøpes alene;bil/trailermåikkesammeselskap.|HTMLFAQ'''
special=[]
for i,line in enumerate(rows.splitlines(),1):
 typ,sub,dim,val,loc=line.split('|');special.append(dict(id=f'FR-EXT-{i:03d}',type=typ,subject=sub,dimension=dim,value=val,location=loc))
save('frende-extensions-independent-inventory.json',dict(source_first=True,catalog_fact_values_inspected=False,shared_inventory='frende-vehicle-independent-inventory.json',shared_terms_hash='088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88',sharedterms_read_all15pages=True,general_read_all4pages=True,html_read=['frende-snoscooterforsikring.html','frende-campingvognforsikring.html','frende-tilhengerforsikring.html'],special_rules=special,applicability_notes=['No machine/rental/newvalueBilrule transferred to extensions without exact source','No bonus transfer:11.13explicitBilBobilMC;SnøFAQnobonus','No automaticglass/roadsideDelkaskoterm transferred to BrannTyveri or Kasko extension','Snow accident explicitoptional all3levels; camp/trailer noaccidentpolicyinferred','Trailerownliability and transportlastmustnotbeinventedfromotherpolicybenefit']))
print(len(special),'type-specific source rules; shared61alreadyinventoried')
