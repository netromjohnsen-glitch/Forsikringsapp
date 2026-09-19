import type OpenAI from "openai";
import type { MatchingBatch } from "./hybrid-matching.ts";

export async function requestSemanticMatches(openai: OpenAI, batch: MatchingBatch): Promise<unknown> {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    instructions: `Du vurderer mulig samsvar mellom opplysninger fra to norske forsikringsdokumenter.
Bare kandidater som ikke allerede er matchet deterministisk er sendt inn.
Returner beslutninger for kandidater du kan vurdere: match, no_match eller uncertain. Du må ikke velge en match.
En falsk match er verre enn en uavklart kandidat. Bruk uncertain når dekning, objekt eller betydning ikke er tydelig den samme.
Forsikringstyper som gjelder ulike objekter skal ikke matches. Kombinert hus og fritidsbolig må ikke automatisk likestilles med vanlig bolig.
Vurder vilkår bare innen termScopes sin forsikringskontekst. En venstreside kan ha flere høyresidevilkår når de beskriver deler av samme hoveddekning, som glasskade ved skifte og reparasjon.
Bruk nøyaktig oppgitte id-er og scopeId. Forsikringstypebeslutninger har scopeId "types" og høyst én rightId. Vilkår bruker scopeId fra termScopes.
Confidence er 0 til 1. Gi en kort faglig begrunnelse. Utelat kandidater du ikke trenger å vurdere.`,
    input: JSON.stringify(batch),
    text: {
      format: {
        type: "json_schema",
        name: "semantic_insurance_matches",
        strict: true,
        schema: {
          type: "object",
          properties: {
            decisions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  kind: { type: "string", enum: ["insurance", "term"] },
                  scopeId: { type: "string" },
                  leftId: { type: "string" },
                  rightIds: { type: "array", items: { type: "string" } },
                  decision: { type: "string", enum: ["match", "no_match", "uncertain"] },
                  confidence: { type: "number" },
                  reason: { type: "string" },
                },
                required: ["kind", "scopeId", "leftId", "rightIds", "decision", "confidence", "reason"],
                additionalProperties: false,
              },
            },
          },
          required: ["decisions"],
          additionalProperties: false,
        },
      },
    },
  });
  return JSON.parse(response.output_text);
}
