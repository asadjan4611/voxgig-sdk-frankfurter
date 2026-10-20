# Voxgig SDK Generator Assessment Report

## Project overview

- **API:** Frankfurter API v2, an open-source, read-only API for current and
  historical foreign-exchange rates from official providers.
- **Official documentation:** <https://frankfurter.dev/>
- **OpenAPI source:** <https://api.frankfurter.dev/v2/openapi.json>
  (OpenAPI 3.1.2, API version 2.1.1). A local copy is retained at
  `.sdk/def/frankfurter-openapi.json` for reproducible generation.
- **Repository:** <https://github.com/asadjan4611/voxgig-sdk-frankfurter>
- **Repository status:** Public GitHub repository, pushed to `main` after the
  owner's explicit approval.
- **Output:** TypeScript SDK, generated version `0.0.1`. No npm publication or
  release is claimed.
- **License:** MIT. The upstream Frankfurter project is also MIT licensed.

## Selection rationale

Frankfurter was selected because its API is small (nine safe GET operations),
its first-party OpenAPI document is public, and it requires no credentials.
This permits meaningful end-to-end testing without creating data, incurring
charges, or expanding the assessment into a production project.

No credentials are required for the selected API. The planned target was one
TypeScript SDK, with reproducible offline tests, a coverage gate, and safe live
GET tests against the public API. This matches the assessment scope without
claiming that every optional parameter combination can be exhausted.

On 20 October 2026, all 804 public repositories returned by the GitHub API for
the `voxgig-sdk` organization were searched case-insensitively for
`frankfurter`; there were no matches. A search-engine query also found no
Frankfurter repository in that organization. Repository names cannot prove
that a differently named SDK does not wrap the API, but this is reasonable
evidence that Frankfurter was absent from the catalogue when selected.

The proposed repository name was also checked through GitHub's public API. It
returned 404 before creation. The repository was created and pushed only after
the owner explicitly approved publication.

## Generator experience

The project was scaffolded with the official initializer:

```bash
npx --yes @voxgig/create-sdkgen@0.30.8 frankfurter \
  -d /tmp/frankfurter-openapi.json -t ts \
  -o ./voxgig-sdk-frankfurter
```

Subsequent generation was run from `.sdk/` with `npm run generate`. The
generator produced four entities (`Coverage`, `Currency`, `Provider`, and
`Rate`), package metadata, documentation, offline tests, and the TypeScript
target.

Scaffolding, dependency installation, model extraction, TypeScript generation,
and the offline test transport were straightforward. The generated project is
substantial and its model/template separation makes output reproducible.

The following issues were observed and addressed without hand-editing generated
`ts/` source:

1. The generated coverage gate initially failed at 82.31% function coverage
   against its own 88% threshold. Focused tests for value objects, entity
   lifecycle helpers, request routing, media handling, GraphQL helpers, and
   response parsing raised function coverage to 88.86%. The threshold was not
   lowered.
2. The README described live testing but the package had no dedicated live
   command. Declarative live hints and a generated `test:live` script now run
   all nine operations plus a safe invalid-currency error case. Offline
   `npm test` remains independent of the network.
3. Generated examples used placeholders such as `/api/resource/{id}`,
   `example_base`, and `currencys`. Generator components were adjusted to use
   real Frankfurter routes/examples and clear list variable names.
4. Standard Redocly recommended lint originally reported nine
   `security-defined` errors and one missing-4XX warning. The local spec now
   explicitly declares `security: []` for this public API and applies the
   existing reusable 4XX response to `GET /providers`. Standard lint passes
   without disabled rules.
5. Live contract testing found that the API currently returns
   `Provider.frequency: "weekly"`, while the downloaded official enum omitted
   `weekly`. The local spec records this observed value and documents the
   deviation.
6. The generated live runner compared operation paths to the full server path
   without accounting for the `/v2` base-path prefix. This caused successful
   HTTP 200 calls to fail with “Entity selected wrong route.” The project-owned
   template now verifies the operation path as the suffix of the server path.
7. Generation continues to emit `flow-step-unreachable` for
   `BasicRateFlow#1 (load)`. The warning is difficult to interpret, but both
   generated `Rate.load` routes pass live tests, so it does not indicate a
   missing public operation in this SDK.

These corrections intentionally customize generator components and one target
template. Consequently, `voxgig-sdkgen doctor` exits 1 and reports 10 forked
components, one edited template, and three project-owned additive components.
This is recorded rather than concealed: running `target add ts` would overwrite
the forked fixes. Normal generation, build, offline tests, coverage, and live
tests all pass.

Approximate automated execution was 10 minutes for the original assessment and
about 18 minutes for this verification/remediation pass. The repository owner
provided publication authorization but was not asked to troubleshoot manually.
Automated runtime is distinguished from human hands-on work; the remediation
required no additional human troubleshooting and remains within the
assessment's 30-minute human-work limit.

## Testing

Environment:

- Linux 6.8.0-147-generic x86_64
- Node.js 24.18.0; npm 11.16.0; Git 2.43.0
- `@voxgig/create-sdkgen` 0.30.8
- `@voxgig/sdkgen` 4.35.0; `@voxgig/apidef` 8.25.3
- TypeScript 5.9.3; Redocly CLI 2.65.0

Commands and final outcomes:

| Command/check | Status | Result |
| --- | --- | --- |
| `npx --yes @redocly/cli@2.65.0 lint .sdk/def/frankfurter-openapi.json` | Passed | Standard recommended configuration; no ignored rules or remaining findings. |
| `cd .sdk && npm run generate` | Passed with warning | Generated all four entities and the TypeScript target; retained the documented `BasicRateFlow#1` warning. |
| `cd ts && npm install --no-audit --no-fund` | Passed | Installed the generated target's development dependencies. |
| `cd ts && npm run build` | Passed | TypeScript source and tests compiled. No separate lint script is generated. |
| `cd ts && npm test` | Passed | 246 passed, 0 failed, 14 intentionally skipped (unconfigured optional features and opt-in live tests). |
| `cd ts && npm run test-coverage` | Passed | 246 passed, 0 failed, 14 skipped. Coverage: 88.51% lines, 84.53% branches, 88.86% functions; all configured gates passed. |
| `cd ts && npm run test:live` | Passed | Both live test files passed. The operation harness attempted and passed all 9 documented GET operations; the separate invalid-currency request returned a verified 4xx response. |
| README example checks | Passed | Generated README/reference examples were type-checked or executed by the test suite. |
| Secret/configuration scan and `git diff --check` | Passed | No credential patterns, private keys, or local `.env` files were found; no whitespace errors. |
| GitHub Actions `ci` and `Documentation` | Passed | Both post-push workflows completed successfully for commit `51ff558`. |
| `cd .sdk && npm exec -- voxgig-sdkgen doctor` | Failed (expected/customization) | Reports 10 forked components, 1 edited template, and 3 additive project components used for the documented corrections. |

The live operation suite verifies the generated method/route, required example
parameters, a successful 2xx response, response parsing, and the response
contract for:

- `GET /coverage`
- `GET /currencies`
- `GET /currency/{code}`
- `GET /providers`
- `GET /providers/{provider}`
- `GET /providers/{provider}/rates`
- `GET /rates`
- `GET /providers/{provider}/rate/{base}/{quote}`
- `GET /rate/{base}/{quote}`

It also verifies a representative invalid currency response. This is useful
operation coverage, not a claim that every optional parameter combination,
date boundary, provider, media type, or upstream failure mode was exhaustively
tested. All calls were unauthenticated GET requests; no secret, destructive
operation, or billable request was used.

## Suggestions

- Generate a dedicated live-test script whenever live instructions are emitted,
  and keep it serial by default for public APIs.
- Include a server base-path prefix when validating a generated route in the
  live harness.
- Derive examples from OpenAPI parameter examples and known read-only paths
  instead of generic placeholders.
- Ensure the generated baseline tests satisfy generated coverage gates, or make
  the relationship between feature selection and thresholds explicit.
- Explain `flow-step-unreachable` with the affected path and whether an
  alternate point still implements the operation.
- Provide a supported project-override mechanism for targeted generator fixes
  that does not make `doctor` classify intentional changes as scaffold drift.
- Consider validating the upstream spec against representative live responses;
  this run found the missing `weekly` enum value immediately.

## Conclusion

The official generator produced a useful typed SDK quickly. After targeted,
documented generator-level corrections, the project builds, its offline and
coverage gates pass, its documentation examples are API-specific, standard
OpenAPI lint passes, and all nine public operations plus an error path pass live
verification. The remaining caveats are the persistent flow warning, intentional
generator-template drift reported by `doctor`, and the deliberately limited
scope of optional-parameter testing.
