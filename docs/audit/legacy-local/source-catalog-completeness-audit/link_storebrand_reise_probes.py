from continue_audit import *
A=Audit();v=load('verified-false-unknowns.json');probes=load('runtime-storebrand-reise-probes.json');mapping={'reise.skadedyr.dekning':'SB-RE-054','reise.skadedyr.egenandel':'SB-RE-054','reise.bagasje.aldersfradrag':'SB-RE-028','reise.veterinar':'SB-RE-062'}
for probe in probes:
 assert probe['status']=='DISPLAY_UNKNOWN_CONFIRMED' and probe['side_swap_consistent']
 sf=next(f for f in A.f if f['product_identity']==probe['product'] and f['source_first_inventory_id']==mapping[probe['key']]);g=next(g for g in A.a['findings'] if g['finding_id']==sf['finding_id'])
 if probe['key'] not in sf['proposed_keys']:sf['proposed_keys'].append(probe['key'])
 sf['key_support_existing_catalog'][probe['key']]=True;sf['key_support_existing_type_registry'][probe['key']]=A.reg.get('Reise|'+probe['key']);sf['runtime_probe_file']='runtime-storebrand-reise-probes.json';g['proposed_existing_keys']=sf['proposed_keys'];g.update(remediation_complexity='DATA_ONLY',remediation_type='CATALOG_DATA_ONLY',visible_false_unknown_verified=True)
 if not any(x['product_identity']==probe['product'] and x['key']==probe['key'] for x in v):v.append(dict(product_identity=probe['product'],key=probe['key'],peer_identity=probe['peer'],display_state='unknown',display_text=probe['display']['first']['text'],source_fact_ids=[sf['source_fact_id']],finding_ids=[g['finding_id']],side_swap_consistent=True,cause='Missing own-source catalog rule, not a presentation defect.',source_scope_note='Own fullreise10source supports dimension; peer only exercises existing view, no false cross-provider equivalence.',runtime_probe_file='runtime-storebrand-reise-probes.json'))
save('verified-false-unknowns.json',v);A.a['catalog_counts']['verified_visible_false_unknown_cases']=len(v)
A.checkpoint('Storebrand Reise six additional visible false unknowns verified using exact own source and side swap','Båt','storebrand','storebrand-bat-super')
