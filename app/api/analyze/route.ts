import { getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
import { runHybridMatching } from "@/lib/hybrid-matching";
import { requestSemanticMatches } from "@/lib/semantic-matcher";
import { finalizeAgreementPricing } from "@/lib/agreement-pricing";
import { ManualAgreementError, normalizeManualAgreement } from "@/lib/manual-agreement";
import { includePdfAddOnTerms } from "@/lib/pdf-addons";

PDFParse.setWorker(getPath());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractInsuranceData(text: string) {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

instructions: `
Du analyserer ett eller flere norske forsikringsdokumenter som til sammen beskriver ÉN forsikringsavtale. Dokumentgrensene er markert i input.

Les hele dokumentet nøye og hent ut relevant forsikringsinformasjon. Dokumentene kan bruke forskjellige navn og formuleringer for samme dekning. Du skal forstå betydningen, ikke bare lete etter bestemte ord.

VIKTIG:
- Ikke gjett eller finn på informasjon.
- Bruk null dersom informasjonen ikke finnes i dokumentet.
- Behold viktige beløp, egenandeler, antall dager, aldersgrenser, kilometergrenser og andre begrensninger.
- Prioriter konkrete opplysninger om forsikringssum, egenandel, leiebil, maskinskade, alder, varighet, geografisk dekning, unntak og andre vilkår i coverageSummary og importantTerms.
- Pris er valgfritt. Manglende premie skal være null og må ikke hindre uttrekk av dekning og vilkår.
- Forstå norske forsikringsuttrykk og synonymer.
- "Erstatningsbil", "leiebil" og tilsvarende formuleringer skal tolkes som samme type dekning.
- "Maskinskade", "motor- og girskade", "maskinskadeforsikring" og tilsvarende formuleringer skal tolkes ut fra innholdet.
- "Veihjelp", "redning", "assistanse" og tilsvarende formuleringer skal tolkes ut fra innholdet.
- Kombiner forsikringer fra alle dokumentene i denne avtalen. Samme forsikring omtalt flere ganger skal ikke telles flere ganger.
- Hold ulike forsikringer og forsikringsobjekter adskilt, også når de har samme type.
- annualPremium gjelder bare den aktuelle forsikringen. Ikke legg annualPremium til en totalAnnualPremium som kan inkludere den allerede.
- totalAnnualPremium skal bare være samlet årspremie for hele avtalen når dokumentene gir sikkert grunnlag for dette. Ikke beregn den ved å summere totalsummer og enkeltpremier.
- Sett totalAnnualPremiumScope til entire_agreement bare når totalsummen uttrykkelig dekker alle forsikringer i dokumentene. Hvis et hoveddokument har en totalpris og et annet dokument beskriver en separat forsikring som ikke klart inngår i denne totalen, bruk partial_or_unclear og null som totalAnnualPremium.
- Hvis det er usikkert om en premie allerede inngår i en annen totalsum, bruk partial_or_unclear og null. Behold likevel den enkelte forsikringens annualPremium.
- Opprett én oppføring i insurances for hvert selvstendig forsikringsobjekt/hovedprodukt i dokumentet, uansett forsikringstype.
- For samme forsikringsobjekt: legg alle eksplisitt avtalte tilleggsdekninger i addOns-listen på hovedforsikringen. Listen kan inneholde 0, 1 eller flere tillegg. Ikke opprett konkurrerende hovedprodukter for disse.
- Legg tilleggsvilkår i det aktuelle tilleggets importantTerms. Ikke kopier dem også til hovedforsikringens importantTerms; systemet samler dem etterpå.
- Behold eventuelle egne premier og egenandeler for tillegg i tilleggets felt. Ikke summer dem med hovedforsikringens premie uten sikkert grunnlag.
- Hvis dokumentene ikke gir sikkert grunnlag for å knytte et tillegg til et bestemt forsikringsobjekt, behold opplysningene adskilt fremfor å gjette.
- deductible skal inneholde egenandeler for den aktuelle forsikringen når de er oppgitt.
- Legg relevante vilkår for hver forsikring i dens importantTerms, med korte og presise navn.
- Ikke konkluder med at en dekning mangler bare fordi et bestemt ord ikke brukes. Vurder formuleringen og betydningen.
- Ikke presenter én forsikring som bedre enn en annen. Hent ut faktainformasjonen slik at systemet kan sammenligne dem.
`,

    input: text,

    text: {
      format: {
        type: "json_schema",
        name: "insurance_data",
        strict: true,

        schema: {
          type: "object",

          properties: {
  customer: {
    type: ["string", "null"],
  },
  customerType: {
    type: ["string", "null"],
  },
  offerNumber: {
    type: ["string", "null"],
  },
  company: {
    type: ["string", "null"],
  },
  totalAnnualPremium: {
    type: ["string", "null"],
  },
  totalAnnualPremiumScope: {
    type: "string",
    enum: ["entire_agreement", "partial_or_unclear"],
  },
  insurances: {
    type: "array",
    items: {
      type: "object",
      properties: {
        type: {
          type: "string",
        },
        productName: {
          type: ["string", "null"],
        },
        annualPremium: {
          type: ["string", "null"],
        },
        deductible: {
          type: ["string", "null"],
        },
        coverageSummary: {
          type: ["string", "null"],
        },
        importantTerms: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              value: {
                type: "string",
              },
            },
            required: ["name", "value"],
            additionalProperties: false,
          },
        },
        addOns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              annualPremium: { type: ["string", "null"] },
              deductible: { type: ["string", "null"] },
              importantTerms: {
                type: "array",
                items: {
                  type: "object",
                  properties: { name: { type: "string" }, value: { type: "string" } },
                  required: ["name", "value"],
                  additionalProperties: false,
                },
              },
            },
            required: ["name", "annualPremium", "deductible", "importantTerms"],
            additionalProperties: false,
          },
        },
      },
      required: [
        "type",
        "productName",
        "annualPremium",
        "deductible",
        "coverageSummary",
        "importantTerms",
        "addOns",
      ],
      additionalProperties: false,
    },
  },
},
required: [
  "customer",
  "customerType",
  "offerNumber",
  "company",
  "totalAnnualPremium",
  "totalAnnualPremiumScope",
  "insurances",
],

          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.output_text);
}

async function readPdf(file: File): Promise<string> {
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });
    const result = await parser.getText();
    return result.text;
  } finally {
    if (parser) await parser.destroy();
  }
}

async function analyzeAgreement(files: File[]) {
  const parts: { filename: string; text: string }[] = [];
  for (const file of files) {
    parts.push({ filename: file.name, text: await readPdf(file) });
  }

  const text = parts.map((part, index) =>
    `--- START DOKUMENT ${index + 1}: ${part.filename} ---\n${part.text}\n--- SLUTT DOKUMENT ${index + 1} ---`
  ).join("\n\n");
  const extracted = await extractInsuranceData(text);
  return {
    source: "pdf" as const,
    filename: parts.map((part) => part.filename).join(", "),
    text,
    insuranceData: finalizeAgreementPricing({
      ...extracted,
      insurances: extracted.insurances.map(includePdfAddOnTerms),
    }),
  };
}

async function agreementFromRequest(formData: FormData, side: "existing" | "offer") {
  const mode = formData.get(`${side}Mode`);
  if (mode === "manual") {
    const raw = formData.get(`${side}Manual`);
    if (typeof raw !== "string") throw new ManualAgreementError("Manuelle opplysninger mangler.");
    try {
      return normalizeManualAgreement(JSON.parse(raw));
    } catch (error) {
      if (error instanceof ManualAgreementError) throw error;
      throw new ManualAgreementError("Ugyldige manuelle opplysninger.");
    }
  }
  if (mode !== "pdf") throw new ManualAgreementError("Velg PDF eller manuell registrering på begge sider.");

  const files = formData.getAll(`${side}Files`).filter((file): file is File => file instanceof File);
  if (files.length === 0) throw new ManualAgreementError("Legg til minst én PDF på hver PDF-side.");
  if (files.some((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
    throw new ManualAgreementError("Alle opplastede filer må være PDF-er.");
  }
  return analyzeAgreement(files);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const documents = [
      await agreementFromRequest(formData, "existing"),
      await agreementFromRequest(formData, "offer"),
    ];
    const matchingPlan = await runHybridMatching(
      documents[0].insuranceData.insurances,
      documents[1].insuranceData.insurances,
      (batch) => requestSemanticMatches(openai, batch),
    );

    return Response.json({ documents, matchingPlan });
  } catch (error) {
    if (error instanceof ManualAgreementError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("AI/PDF-FEIL:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Kunne ikke analysere PDF-filene." },
      { status: 500 },
    );
  }
}
