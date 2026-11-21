/**
 * PDF-verified overrides for Utdanningsforbundet PPK11601 / PPK11602.
 * Based on NITO patterns; text and pages verified against udf-hus.pdf and udf-hus-ekstra.pdf.
 */
import { appendedReferenceFacts as nitoAppended, legacyKeys as nitoLegacy, overrides as nitoOverrides } from "./tryg-member-hus-overrides-nito.mjs";

function mergeOverrides(base, patch) {
  const merged = {};
  for (const kind of ["standard", "extra"]) {
    merged[kind] = { ...(base[kind] ?? {}) };
    for (const [key, val] of Object.entries(patch[kind] ?? {})) {
      if (val === null) delete merged[kind][key];
      else merged[kind][key] = { ...(merged[kind][key] ?? {}), ...val };
    }
  }
  return merged;
}

const udfPatch = {
  standard: {
    "hus.forsikringsform": {
      label: "Forsikringsform",
      value:
        "Bygning kan være en fullverdi- eller førsterisikoforsikring. Det står i forsikringsbeviset hvis forsikringen er førsterisikoforsikring. Er dette ikke spesifisert i forsikringsbeviset er bygningen fullverdiforsikret.",
      page: 1,
      section: "BYGNING – fullverdi og førsterisiko",
    },
    "hus.forsikringssum": null,
    "hus.hage.grense": {
      value:
        "Skade på hageanlegg er omfattet med til sammen inntil 500 000 kroner. Sumbegrensningen gjelder ikke for brann og naturskade på hageanlegg tilknyttet bolighus og våningshus. Utvendig vannbasseng fast tilkoblet bygningens ledningsanlegg regnes som hageanlegg. Brygger og kaier regnes ikke som hageanlegg.",
      page: 1,
      section: "1.3 Hageanlegg og brygge",
    },
    "hus.ror.utvendig": {
      value:
        "Bygningens utvendige rør og ledninger med tilknyttet utstyr er omfattet. Utvendig vannbasseng med tilknyttede ledninger, brønn, borehull, drensledning, infiltrasjonsledning, spredeledning eller spredegrøft er ikke omfattet. Drensledning er likevel omfattet ved brann og naturskade.",
      page: 1,
      section: "1.2 Utvendige rør og ledninger med tilknyttet utstyr",
    },
    "hus.gjenoppforing.klimatiltak": {
      label: "Tilskudd til klimavennlige tiltak",
      value:
        "Ved gjenoppføring av fullverdiforsikret bolighus omfatter dekningen et tilskudd på inntil 25 000 kroner til installering av klimavennlige eller sikkerhetsmessige tiltak utover det som er påkrevd etter lov eller forskrift.",
      page: 1,
      section: "1.6 Tilskudd til klimavennlige tiltak",
    },
    "hus.pabud.grense": {
      value:
        "Merutgifter som nevnt over er omfattet med inntil 2 000 000 kroner per skadetilfelle. For bygninger forsikret på førsterisiko omfattes merutgifter ved offentlige påbud med inntil 20 prosent av forsikringssum, men ikke mer enn 2 000 000 kroner.",
      page: 2,
      section: "1.5 Offentlige påbud",
    },
    "hus.ansvar.dekning": {
      page: 1,
      section: "1.8 Privatansvar",
    },
    "hus.hage.vaer": {
      value:
        "Skade på hageanlegg inklusiv utvendig vannbasseng med ledninger forårsaket av dyr, frost eller andre klimatiske forhold er unntatt. Men skade på hageanlegg som skyldes en flomlignende situasjon dekkes.",
      page: 4,
      section: "2.6 Unntak – hageanlegg",
    },
    "hus.naturskade.dekning": { page: 1, section: "1.7 Naturskade" },
    "hus.rettshjelp.dekning": { page: 1, section: "1.9 Rettshjelp" },
    "hus.takvegg.folgeskade": {
      value:
        "Gjennom åpning eller utetthet på grunn av annen dekningsmessig skade, og direkte fra terreng eller grunn ved nedbør, snøsmelting eller kjøving når det medfører frittstående vann over laveste gulv, er omfattet. Skade som følge av vann fra tak, takrenne og utvendige nedløp fra tak er unntatt.",
      page: 2,
      section: "2.3 Følgende er dekket / unntak",
    },
    "hus.vann.egenandel.gjentatt_vann": {
      value:
        "Egenandelen økes med 20 000 kroner når bygningen i løpet av de siste 36 måneder har hatt en tilsvarende skade ved inntrengning av vann i bygning direkte fra terreng eller grunn, eller utstrømning fra innvendige rør.",
      page: 2,
      section: "2.3 Egenandel",
    },
  },
  extra: {
    "hus.forsikringsform": null,
    "hus.forsikringssum": null,
    "hus.hage.grense": {
      value:
        "Skade på hageanlegg beliggende rundt bygning på forsikret eiendom, samt tilførselsvei er omfattet. Brygger og kaier regnes ikke som hageanlegg.",
      page: 1,
      section: "1.3 Hageanlegg og brygge",
    },
    "hus.pabud.grense": {
      value:
        "For fredede bygninger omfattes merutgifter ved offentlige påbud med inntil 1 000 000 kroner.",
      page: 1,
      section: "1.5 Offentlige påbud",
    },
    "hus.gjenoppforing.klimatiltak": {
      label: "Tilskudd til klimavennlige tiltak",
      value:
        "Ved gjenoppføring av fullverdiforsikret bolighus omfatter forsikringen et tilskudd på inntil 50 000 kroner til installering av klimavennlige tiltak utover det som er påkrevd etter lov eller forskrift.",
      page: 1,
      section: "1.6 Tilskudd til klimavennlige tiltak",
    },
    "hus.vatrom.selverommet": {
      value:
        "Forsikringen dekker vannskade på våtrom som er en direkte følge av svak konstruksjon, materialfeil eller feilmontering når arbeidet er utført av godkjent/autorisert personell, vannskaden er oppstått mens forsikringen er i kraft og vannskaden er konstatert innen 10 år fra arbeidet ble utført. Materialfeil, feil utførelse eller mangelfullt arbeid der det ikke er konstatert følgeskade på våtrommet er ikke å anse som en skade.",
      page: 3,
      section: "2.3 Våtromsdekning",
    },
    "hus.tilpasning.grense": {
      value:
        "Hvis sikrede utsettes for ulykkesskade og må bruke rullestol, omfatter forsikringen nødvendige utgifter til tilpasning av hjemmet for å forbedre fremkommeligheten for rullestolbrukeren. Slike utgifter erstattes med inntil 250 000 kroner for hvert forsikringstilfelle. Det er en forutsetning at ulykkesskaden inntreffer i forsikringstiden og medfører varig medisinsk invaliditet på minst 50 prosent.",
      page: 5,
      section: "2.8 Tilpasning for rullestolbruker",
    },
    "hus.ansvar.dekning": {
      label: "Privatansvar",
      value: "Privat erstatningsansvar er omfattet. Se vilkår for Privatansvar, PGE90020.",
      page: 1,
      section: "1.10 Privatansvar",
    },
    "hus.naturskade.dekning": {
      page: 1,
      section: "1.9 Naturskade",
    },
    "hus.rettshjelp.dekning": {
      page: 1,
      section: "1.11 Rettshjelp",
    },
    "hus.vann.egenandel.terreng_grunnvann": {
      value: "Ved skade som følge av vann fra terreng eller grunn er egenandelen minimum 8 000 kroner.",
      page: 3,
      section: "2.3 Egenandel",
    },
    "hus.vann.egenandel.gjentatt_vann": {
      value:
        "Egenandelen økes med 20 000 kroner når bygningen i løpet av de siste 36 måneder har hatt en tilsvarende skade ved inntrengning fra terreng, inntrengning gjennom flatt tak, balkong eller terrasse, eller utstrømning fra innvendige rør.",
      page: 3,
      section: "2.3 Egenandel",
    },
    "hus.vatrom.folgeskade": {
      value: "Vann fra utett våtrom på tilstøtende og underliggende rom omfattes.",
      page: 3,
      section: "2.3 Følgende er dekket",
      coverageAvailability: "included",
    },
    "hus.vaer.begrensning": {
      value:
        "Skade som skyldes kjæledyr, insekter og bakterier, slitasje og alder, kosmetiske skader, utett våtrom, selve håndverkerfeilen og følgeskade etter eget/ufaglært arbeid eller oppdaget senere enn 10 år er unntatt.",
      page: 4,
      section: "2.6 Unntak",
    },
    "hus.hage.vaer": {
      value:
        "Skade på hageanlegg inklusiv utvendig vannbasseng med ledninger forårsaket av dyr, frost eller andre klimatiske forhold er unntatt. Men skade på hageanlegg som skyldes en flomlignende situasjon dekkes.",
      page: 4,
      section: "2.6 Unntak – hageanlegg",
    },
  },
};

export const overrides = mergeOverrides(nitoOverrides, udfPatch);

export const appendedReferenceFacts = {
  standard: nitoAppended.standard.map((entry) => {
    if (entry.key === "hus.ansvar.dekning") return { ...entry, page: 1, section: "1.8 Privatansvar" };
    if (entry.key === "hus.naturskade.dekning") return { ...entry, page: 1, section: "1.7 Naturskade" };
    if (entry.key === "hus.rettshjelp.dekning") return { ...entry, page: 1, section: "1.9 Rettshjelp" };
    return entry;
  }),
  extra: [
    {
      key: "hus.naturskade.dekning",
      label: "Naturskade",
      value: "Naturskade er omfattet. Se vilkår for Naturskade, PGE90010.",
      page: 1,
      section: "1.9 Naturskade",
    },
    {
      key: "hus.ansvar.dekning",
      label: "Privatansvar",
      value: "Privat erstatningsansvar er omfattet. Se vilkår for Privatansvar, PGE90020.",
      page: 1,
      section: "1.10 Privatansvar",
    },
    {
      key: "hus.rettshjelp.dekning",
      label: "Rettshjelp",
      value: "Rettshjelp er omfattet. Se vilkår for Rettshjelp, PGE91500.",
      page: 1,
      section: "1.11 Rettshjelp",
    },
  ],
};

export const legacyKeys = {
  ...nitoLegacy,
  extra: [
    {
      key: "hus.kunstnerisk_utsmykning",
      label: "Kunstnerisk utsmykning",
      value: "Kunsterisk utsmykning på bygninger nevnt i forsikringsbeviset er omfattet.",
      page: 1,
      section: "1.1 Bygninger",
      coverageAvailability: "included",
    },
  ],
};

export const standardDrop = ["hus.forsikringssum"];
export const extraDrop = ["hus.forsikringsform", "hus.forsikringssum"];