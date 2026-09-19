# DNB / Fremtind Bil

Kontroll utført 19.09.2026 mot DNBs offentlige bilforsikringsside og de lokale,
offisielle Fremtind-kildene i `catalog/sources/sparebank1-fremtind`.

## Dokumentlikhet

DNB lenker Ansvar, Delkasko, Kasko, Topp og IPID til nøyaktig de samme URL-ene
som SpareBank 1. Nye nedlastinger ble sammenlignet byte for byte. SHA-256 var lik
for alle fem filer:

| Dokument | Vilkår/versjon | Gyldig fra | SHA-256 |
| --- | --- | --- | --- |
| Vilkar_ansvar_bil.pdf | PMO-357.001-004, med FMO-001.100-007, FMO-002.401-003 og FFE-003.001-003 | delvilkårenes egne datoer | `0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568` |
| Vilkar_Minikasko_Bil.pdf | PMO-357.210-012 | 18.09.2025 | `8a85385f3899b450a9dcafd873fb8d6517d974908c7196590f429ec3b2a3d818` |
| Vilkar_Kasko_Bil.pdf | PMO-357.220-007 | 18.09.2025 | `87696e04484ca2d3e98b2e62c070b1886b8eae6bd8206c6b029eb80a3693a739` |
| Vilkar_Toppkasko_Bil.pdf | PMO-350.200-016 | 18.09.2025 | `cc9af96bd2f91dffe76dced3d58481007d3036ba452e695f4f2b4a9489e01781` |
| IPID_Bil.pdf | V.106 | ikke oppgitt | `429a3e267cfbbcfa6da651997497386ffc7391c5f3aab461d469e4d5e65a5d94` |

DNB er derfor en egen distribusjonsidentitet i katalogen, men hovednivåene
gjenbruker de kanoniske Fremtind-komponentene og kildefilene. Det finnes ingen
DNB-spesifikke overrides i de fem kontrollerte dokumentene.

## Leiebil og Maskinskade

DNB-siden og IPID V.106 dokumenterer at Leiebil og Maskinskade er valgfrie
tillegg på Kasko og Topp. DNB-siden lenker ikke egne, separate PDF-vilkår for
tilleggene, og de fem DNB-lenkene refererer ikke sikkert til SpareBank 1-sidens
separate tilleggsvilkår.

Tilleggene kan derfor velges i DNB-katalogen, men 45 dager, 10 år, 200 000 km,
egenandeler og øvrige detaljvilkår står som ikke dokumentert. SpareBank 1s
tilleggsdata blir ikke kopiert eller arvet inn i DNB-avtalen.
