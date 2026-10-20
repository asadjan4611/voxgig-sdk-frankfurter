# Frankfurter API

Frankfurter is an open-source API for current and historical foreign exchange rates published by central banks.

## Start here

This guide introduces the API, the client libraries, and the companion tools in this repository. Start with the API capabilities, choose a client for your application, and use the linked reference when you need exact request and response details.

The selected API surface contains 4 entities and 9 HTTP routes. There are 1 SDK targets.

An entity groups related API operations. An operation can have several routes with different inputs or authentication requirements. The SDK exposes the entity and its operations using the conventions of the selected language.

## What the API provides

### Coverage

Results: Coverage of the selected rate query.

SDK operations: `load`.

Key fields to recognise:

- `base`: Requested base currency, EUR by default
- `end_date`: Last eligible observation date with a nonempty matching rates query
- `providers`: Selected providers, or null for the default daily blend
- `quotes`: Requested quotes, or null for all
- `start_date`: First eligible observation date with a nonempty matching rates query

### Currency

Results: Available currencies; Currency details.

SDK operations: `list`, `load`.

Key fields to recognise:

- `end_date`: Latest publication coverage date; use /coverage for queryable pairs
- `iso_code`: Currency or accounting unit code
- `iso_numeric`: ISO 4217 numeric code
- `name`: Full currency name
- `peg`: Peg metadata, present only for pegged currencies

### Provider

Results: Available providers; Provider.

SDK operations: `list`, `load`.

Key fields to recognise:

- `country_code`: ISO 3166-1 alpha-2 country code
- `currencies`: Recognised currency codes within their valid date ranges covered by this provider
- `data_url`: Link to the data source
- `end_date`: Latest publication coverage date; use /coverage for queryable pairs
- `frequency`: The period each observation stands for, after SDMX FREQ. A daily value is dated on the day observed. A monthly or quarterly value is dated on the day it takes effect and stands for the period until the next one. Values coarser than daily never enter the blend: query them by provider.

### Rate

Results: Exchange rates; Exchange rate.

SDK operations: `list`, `load`.

Key fields to recognise:

- `base`: Base currency or accounting unit code
- `date`: The date of the rate
- `providers`: Per-provider rates for this pair. Present only when `expand=providers` is set. Each entry has the provider&#39;s observation date and published rate (rebased to the row&#39;s base). Entries with `excluded: true` did not contribute to the blended `rate` , either flagged as outliers by the consensus filter, or overridden by a currency peg. A one-day typo in a provider&#39;s series is left out, so its entry shows the observation before it. Omitted on synthesized peg rows where no provider published the quote.
- `quote`: Quote currency or accounting unit code
- `rate`: Exchange rate value

### Route map

Use this map to locate a capability. Consult the entity reference before supplying request data; routes for the same operation can require different fields.

| Entity | SDK operation | HTTP route | Authentication |
| --- | --- | --- | --- |
| Coverage | `load` | `GET /coverage` | See reference |
| Currency | `list` | `GET /currencies` | See reference |
| Currency | `load` | `GET /currency/{code}` | See reference |
| Provider | `list` | `GET /providers` | See reference |
| Provider | `load` | `GET /providers/{provider}` | See reference |
| Rate | `list` | `GET /providers/{provider}/rates` | See reference |
| Rate | `list` | `GET /rates` | See reference |
| Rate | `load` | `GET /providers/{provider}/rate/{base}/{quote}` | See reference |
| Rate | `load` | `GET /rate/{base}/{quote}` | See reference |

## Connect to the API

- API server: `https://api.frankfurter.dev/v2`

Check authentication for the route you plan to call. A route that declares no authentication can be used without credentials; this does not change the requirements of other routes. Keep credentials in environment variables or a configured secret provider, and keep them out of source control and logs.

## Make a first request

1. Choose the API server and an operation that matches your task.
2. Check the operation’s required input and authentication. Use values valid for your account and environment.
3. Send one request and inspect the returned data before adding retries, concurrency, or a larger batch.

For an SDK call, install or build the chosen client, create a client instance with its documented configuration, and call the required entity operation. Language references describe the argument shape, asynchronous behaviour, and returned values.

## Choose an SDK

Choose the language already used by your application or service. The clients represent the same API model, while package setup, naming, and return types follow each language. Check the selected client’s reference and tests before integrating it into an existing application.

| Client | Repository directory | Distribution |
| --- | --- | --- |
| TypeScript | `ts/` | Build from source |

Build-from-source entries are not marked as published in the project model. Follow the build instructions in that target’s README, then consume the resulting package using your language’s local dependency mechanism. Published entries give the installation command recorded for that client.

## Operational features

Features supply behaviour around API calls, such as request handling, diagnostics, or local testing. Inclusion in this project does not mean a feature is enabled at runtime. Check the selected SDK’s supported features and configuration defaults, then enable the behaviour your application needs.

- `test`: In-memory mock transport for testing without a live server

Start with the default client configuration. Add request limits and diagnostics as needed, test error paths, and review retry behaviour before using operations that change data. A retry can repeat an operation unless the API provides a suitable guarantee.

## Continue with the documentation

- Follow the first-call guide for the setup sequence.
- Read the authentication guide before using protected routes.
- Use the API reference for request schemas, response formats, and status codes.
- Check the chosen SDK or companion tool reference for its configuration and supported operations.

