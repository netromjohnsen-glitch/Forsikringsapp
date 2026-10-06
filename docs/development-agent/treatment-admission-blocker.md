# Behandling preflight — BLOCKED_SOURCE_IDENTITY_COLLISION

Observed 2026-10-06 on repository `netromjohnsen-glitch/Forsikringsapp`.
HEAD, origin/main and GitHub refs/heads/main were freshly verified equal to
`16bfc4bd5db0b9dbfa9b8646f4aae902ba5d8d90`. Initial working tree and index were clean.
This is a blocker report, not a completion receipt or authorization for another identity.

## Authorized scope and conflicting identity

The user's current authorization covers only:

| Signature | Binding |
| --- | --- |
| 4165f79344a7d572 | GAP-2868/SF-4017 |
| fbe23495ae09afb3 | GAP-2875/SF-4025 |
| 48393aac0a200fe5 | GAP-2880/SF-4031 |
| c5ccc4f26fd475ae | GAP-2907/SF-4060 |

Bindings were checked against
`docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv`.
The authorization requires admitting the treatment PDF as
`boat-pet:gjensidige:hund`, full_terms, Gjensidige/Hund/ordinary.
That exact ID already identifies `gjensidige-dog-ipid.pdf`, sourceType ipid,
termsNumber EAP32, SHA-256
`aa39107d5777e4f0a342918ef9e4ceba8828793665a3dc2eb41172107d1404ba`.

`lib/boat-pet-catalog.ts` assigns that default ID to the existing IPID seed.
Its Object.fromEntries source registry cannot hold two different documents under
the same ID: a second seed would overwrite one entry. Replacing the seed would
instead change existing source identity and downstream provenance.

Read-only resolveCatalogFacts on the current Gjensidige Hund Behandling product,
with its Liv and Bruk components, found five established references to this IPID:

- dyr.veterinar.dekning: primary reference.
- dyr.veterinar.sum.valgbar: supplemental reference; primary remains product_page.
- dyr.veterinar.egenandel.fast: primary reference.
- dyr.rehabilitering.grense: primary reference.
- dyr.allergi.grense: primary reference.

The product's sourceId also uses this identity. Existing R-050-SUM-PRODUCT
asserts the exact source type sequence product_page, ipid; the validated sum
receipt must be preserved. Registering full_terms at the same ID would change
this legitimate contract, including provenance outside the authorized packet.
No such migration was performed or implicitly authorized.

## Frozen source checks

The treatment PDF was rehashed directly:
`catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf`, SHA-256
`8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6` — PASS.
The frozen manifest identifies full_terms, Gjensidige/Hund/ordinary and URL
`https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring`.

Original PDF pages 1–3 (printed 5–7) were read with pdftotext -layout:
page 1 safety requirements, page 2 period ceiling/medicines/dental clauses,
page 3 same-illness/accident, healthy-animal and discovery-time definitions.
Page 1 is headed Hund / FORSIKRINGSBEVIS. This review did not establish a
documented treatment termsNumber; a descriptive website title must not be used
as a fabricated number. Version/effectiveFrom remain unknown. Title/number
verification must be completed before any future admission.
No source bytes were changed or fetched.

## Checks actually run and preserved state

- git status, rev-parse HEAD/origin/main, remote URL and ls-remote main.
- `python docs/audit/checkpoints/b050-liv-completion-04534f8/verify.py`: PASS.
- `python docs/audit/checkpoints/development-agent-ef5b0bc/verify.py`: PASS.
- Original registry bindings, frozen manifest and treatment SHA-256 checked.
- Read-only native catalog source lookup and resolveCatalogFacts inspection.
- Existing source/provenance assertions inspected; no assertions changed.

The verification scripts checked durable prior receipts and their integrity;
they do not represent a fresh run of the application suite. No application
fullgate/build/runtime was run because admission is blocked before implementation.
Production, tests, original sources, prior receipts, checkpoint and root ledger
are unchanged. No completion signatures were credited and no roots consumed.
This packet uses 0/3 mechanical roots; campaign remains 6/12. Historical reported
19/16 mechanical and 10/8 semantic remain unchanged and not fully reconstructed.
The documented campaign set remains eight exact signatures. Global current
resolved/open accounting remains UNKNOWN.

## Minimum decision required

Recommend explicitly authorizing the separate unused identity
`boat-pet:gjensidige:hund:treatment`, as proposed in
[next-treatment-proposal.md](next-treatment-proposal.md), while preserving the
existing root ID for the IPID and all established references. Preserve the user's
new restriction that descriptive title is not an undocumented termsNumber.

This recommendation is NOT_AUTHORIZED until the user changes the precise ID
instruction. All four implementation contracts depend on admission, so none
can be completed independently at this stop. Do not migrate IPID references,
implement the packet, close signatures, commit a failed packet or start a later
scope without resolving this conflict. This report is retained uncommitted.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
