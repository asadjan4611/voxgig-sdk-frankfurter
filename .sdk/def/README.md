# API Definition
 
API definition (OpenAPI etc) files live here.

`frankfurter-openapi.json` is copied from the official Frankfurter v2
definition. This assessment adds three local clarifications: top-level
`security: []` records that the public API requires no authentication; a
`4XX` response on `GET /providers` applies the upstream reusable client-error
response to the one operation that omitted it; and `Provider.frequency`
includes `weekly`, a value returned by the live API but missing from the
downloaded enum. All other API content remains from the upstream document.

