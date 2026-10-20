# Voxgig SDK Generator Assessment Report

## Project overview

- **API:** Frankfurter API v2, an open-source API for current and historical
  foreign-exchange rates from central banks and other official sources.
- **Official documentation:** <https://frankfurter.dev/>
- **OpenAPI source:** <https://api.frankfurter.dev/v2/openapi.json>
  (OpenAPI 3.1.2, API version 2.1.1). A copy is retained at
  `.sdk/def/frankfurter-openapi.json` for reproducible generation.
- **Repository:** <https://github.com/asadjan4611/voxgig-sdk-frankfurter>
  (public, published with the repository owner's explicit approval).
- **Output:** One TypeScript SDK target. The generator-created version remains
  `0.0.1`; no npm package or release is claimed.
- **Licensing:** This repository uses the MIT License. The upstream Frankfurter
  specification identifies its project license as MIT.

## Selection rationale

Frankfurter was selected because its API is small (nine read-only paths), its
first-party OpenAPI document is public, it needs no credentials, and meaningful
live tests can be run without creating data or incurring usage charges. These
traits keep the assessment within its intended scope while still testing the
SDK end to end.

On 20 October 2026, I enumerated all 804 public repositories returned by the
GitHub API for the `voxgig-sdk` organization and searched their names
case-insensitively for `frankfurter`; there were no matches. A search-engine
query also found no Frankfurter repository in that organization. This is good
evidence that the API is absent from the catalogue, although repository naming
alone cannot prove that no differently named catalogue entry wraps the same
API.

GitHub's public repository endpoint initially returned HTTP 404 for
`asadjan4611/voxgig-sdk-frankfurter`, indicating no conflicting public
repository existed when checked. GitHub CLI was reauthenticated through its
browser device flow before the repository was created and pushed with explicit
owner approval.

## Generator experience

The project was scaffolded with the official initializer:

```bash
npx --yes @voxgig/create-sdkgen@0.30.8 frankfurter \
  -d /tmp/frankfurter-openapi.json -t ts \
  -o ./voxgig-sdk-frankfurter
```

Generation was then performed from `.sdk/` with `npm run generate`. This
two-stage distinction matters: the `voxgig-sdkgen` CLI scaffolds targets and
features, while the npm script runs model extraction and code generation.

The straightforward parts were CLI help, dependency installation, target
selection, generation, compile-time types, the offline test transport, and the
large generated test suite. The project overlay made it possible to replace
default repository, package, publisher, and author metadata without modifying
the generated `ts/` output. Official documentation/specification links were
likewise set in `.sdk/model/text.aontu`.

Observed issues and limitations:

1. The first generation logged `flow-step-unreachable` for
   `BasicRateFlow#1 (load)` and disabled that step. This warning is difficult to
   interpret without studying the generated model. The available `Rate.load`
   route still worked in a live USD/EUR test, suggesting an alternate or
   duplicate flow was disabled rather than the public operation as a whole.
2. The generated coverage command sets an 88% function threshold, but the
   generated suite reached 82.31%, so `npm run test-coverage` exits 1 even
   though all 22 tests pass. This was not hidden or fixed by lowering the
   threshold.
3. Before the first generation, the scaffold did not yet contain the root
   `AGENTS.md` described in current documentation; it appeared after
   `npm run generate`. This is a sequencing/documentation ambiguity rather
   than a lasting repository defect.
4. The generated prose pluralizes `currency` as `currencys` and includes
   generic `/api/resource/{id}` examples. They compile, but are less polished
   than API-specific examples.
5. The generated README suggests enabling `FRANKFURTER_TEST_LIVE=TRUE` and
   running `npm test`, but this generated package has no dedicated
   `test:live` script. Live calls were therefore executed explicitly through
   the built SDK.

Approximate elapsed automated execution through final verification was 10
minutes. No manual troubleshooting time was required from the repository owner,
so the human contribution requested during this run was 0 minutes and remains
within the assessment's 30-minute limit.

## Testing

Environment:

- Linux 6.8.0-147-generic x86_64
- Node.js 24.18.0; npm 11.16.0; Git 2.43.0
- `@voxgig/create-sdkgen` 0.30.8
- `@voxgig/sdkgen` 4.35.0; `@voxgig/apidef` 8.25.3
- TypeScript 5.9.3; Redocly CLI 2.65.0

Commands and outcomes:

| Command/check | Status | Result |
| --- | --- | --- |
| `npx --yes @redocly/cli@latest lint .sdk/def/frankfurter-openapi.json` | Failed | 9 `security-defined` errors and 1 missing-4XX warning. The API is intentionally unauthenticated; these are recommended-policy findings, not parse errors. |
| Same lint with only `security-defined` and `operation-4xx-response` skipped | Passed | OpenAPI document validated with no remaining findings. |
| Official scaffold command shown above | Passed | Created the generator project and TypeScript target; npm reported 0 vulnerabilities in 106 scaffold dependencies. |
| `cd .sdk && npm run generate` | Passed with warning | Generated four entities and the TypeScript SDK; emitted the documented `BasicRateFlow#1` warning. |
| `cd ts && npm install --no-audit --no-fund` | Passed | Installed three development packages. |
| `cd ts && npm run build` | Passed | TypeScript source and tests compiled. This is the available type check; no lint script was generated. |
| `cd ts && npm test` | Passed | 22 passed, 0 failed, 0 skipped. Includes generated entity, pipeline, transport, and README-example tests. |
| `cd ts && npm run test-coverage` | Failed | 22 tests passed, but function coverage was 82.31%, below the generated 88% threshold. Line coverage was 85.83% and branch coverage 83.20%. |
| `cd .sdk && npm exec -- voxgig-sdkgen doctor` | Passed | `.sdk matches the scaffold (0 additive)`. |
| Generated `direct()` call to `GET /currencies` | Passed | HTTP 200 and 165 records; no credentials used. |
| Generated `Currency.list()` | Passed | Returned 165 entity records from the live API. |
| Generated `Rate.load({ base: 'USD', quote: 'EUR' })` | Passed | Returned a current USD/EUR rate from the live API. |

All live checks were safe, unauthenticated GET operations. No destructive or
billable operation was performed, and no credential was used. Results reflect
the API response on 20 October 2026 and may naturally change.

## Suggestions

- Explain `flow-step-unreachable` warnings with the affected OpenAPI path and
  identify whether another route still implements the public entity method.
- Ensure the generated test suite meets its own default coverage thresholds,
  or derive thresholds from the generated feature set.
- Generate API-specific direct-call examples instead of placeholder resource
  paths when a suitable read-only endpoint is known.
- Apply correct English pluralization in generated prose.
- Generate a working live-test script when the README documents live-test
  configuration, or omit those instructions when no scenario is generated.
- Clarify in the quickstart that the root agent guide is emitted by the first
  generation rather than necessarily being present immediately after scaffold.
- Treat a public API with no authentication as `security: []` during spec
  normalization, or document why an external recommended linter reports it.

## Conclusion

The generator produced a substantial, typed TypeScript SDK with useful offline
tests quickly, and representative live operations worked without credentials.
The developer experience was strongest around scaffolding, reproducibility,
and generated tests. The unexplained flow warning, self-failing coverage gate,
and several generic documentation details are important rough edges, but they
do not prevent the generated SDK's tested read operations from working. The
repository is published and ready for review at the URL above.
