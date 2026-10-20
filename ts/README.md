# Frankfurter TypeScript SDK



The TypeScript SDK for the Frankfurter API — a type-safe, entity-oriented client with full async/await support.

The API is exposed as capitalised, semantic **Entities** — e.g.
`client.Coverage()` — each with a small set of operations (`list`, `load`)
instead of raw URL paths and query parameters. This keeps the surface
predictable and low-friction for both humans and AI agents.


## Install
This package is not yet published to npm. Install it from the GitHub
release tag (`ts/vX.Y.Z`, see [Tags](https://github.com/asadjan4611/voxgig-sdk-frankfurter/tags)), or from a
clone, which carries the compiled `dist/`:

```bash
git clone https://github.com/asadjan4611/voxgig-sdk-frankfurter
npm install ./voxgig-sdk-frankfurter/ts
```


## Tutorial: your first API call

This tutorial walks through creating a client, listing entities, and
loading a specific record.

### 1. Create a client

```ts
import { FrankfurterSDK } from 'voxgig-sdk-frankfurter'

const client = new FrankfurterSDK()
```

### 2. Load a rate

Rate is nested under base, so provide the `base`.
`load()` returns the entity and throws on failure; `.data()` reads its record:

```ts
try {
  const rate = await client.Rate().load({
    base: 'EUR',
    quote: 'USD',
  })
  console.log(rate.data())
} catch (err) {
  console.error('load failed:', err)
}
```


## Error handling

Entity operations reject on failure, so wrap them in `try` / `catch`:

```ts
try {
  const currencyList = await client.Currency().list()
  console.log(currencyList.map((item) => item.data()))
} catch (err) {
  console.error('list failed:', err)
}
```

The low-level `direct()` method does **not** throw — it returns the
result envelope. Branch on `ok`; on failure `status` holds the HTTP status
and `err` holds a transport error:

```ts
const result = await client.direct({
  path: '/currency/{code}',
  method: 'GET',
  params: { code: 'NOT_A_CURRENCY' },
})

if (!result.ok) {
  console.error('request failed:', result.status, result.err)
}
```


## How-to guides

### Make a direct HTTP request

For endpoints not covered by entity methods:

```ts
const result = await client.direct({
  path: '/currencies',
  method: 'GET',
})

if (result.ok) {
  console.log(result.status)  // 200
  console.log(result.data)    // response body
}
```

### Prepare a request without sending it

```ts
const fetchdef = await client.prepare({
  path: '/currencies',
  method: 'GET',
})

// Inspect before sending
console.log(fetchdef.url)
console.log(fetchdef.method)
console.log(fetchdef.headers)
```

### Use test mode

Create a mock client for unit testing — no server required:

```ts
const client = FrankfurterSDK.test()

const currencyList = await client.Currency().list()
// currencyList is an array of Currency entities, one per mock record
console.log(currencyList.map((currency) => currency.data()))
```

You can also use the instance method:

```ts
const client = new FrankfurterSDK()
const testClient = client.tester()
```

### Retain entity state across calls

Entity instances remember their last match and data:

```ts
const entity = client.Currency()

// First call runs the operation and stores its result
await entity.list()

// Subsequent calls reuse the stored state
const data = entity.data()
console.log(data.id)
```

### Add custom middleware

Pass features via the `extend` option:

```ts
const logger = {
  hooks: {
    PreRequest: (ctx: any) => {
      console.log('Requesting:', ctx.spec.method, ctx.spec.path)
    },
    PreResponse: (ctx: any) => {
      console.log('Status:', ctx.out.request?.status)
    },
  },
}

const client = new FrankfurterSDK({
  extend: [logger],
})
```

### Run live tests

Live tests are opt-in and separate from the offline suite. Run:

```bash
cd ts && npm run test:live
```

This sets `FRANKFURTER_TEST_LIVE=TRUE` for the dedicated live process.
The normal `npm test` command remains fully offline. The live suite checks
all nine documented GET operations plus one invalid-currency response; it does
not claim exhaustive coverage of every optional-parameter combination.


## Reference

### FrankfurterSDK

#### Constructor

```ts
new FrankfurterSDK(options?: {
  base?: string
  prefix?: string
  suffix?: string
  feature?: Record<string, { active: boolean }>
  extend?: Feature[]
})
```

| Option | Type | Description |
| --- | --- | --- |
| `base` | `string` | Base URL of the API server. |
| `prefix` | `string` | URL path prefix prepended to all requests. |
| `suffix` | `string` | URL path suffix appended to all requests. |
| `feature` | `object` | Feature activation flags (e.g. `{ test: { active: true } }`). |
| `extend` | `Feature[]` | Additional feature instances to load. |

#### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `options()` | `object` | Deep copy of current SDK options. |
| `utility()` | `Utility` | Deep copy of the SDK utility object. |
| `prepare(fetchargs?)` | `Promise<FetchDef>` | Build an HTTP request definition without sending it. |
| `direct(fetchargs?)` | `Promise<DirectResult>` | Build and send an HTTP request. |
| `Coverage(data?)` | `CoverageEntity` | Create a Coverage entity instance. |
| `Currency(data?)` | `CurrencyEntity` | Create a Currency entity instance. |
| `Provider(data?)` | `ProviderEntity` | Create a Provider entity instance. |
| `Rate(data?)` | `RateEntity` | Create a Rate entity instance. |
| `tester(testopts?, sdkopts?)` | `FrankfurterSDK` | Create a test-mode client instance. |

#### Static methods

| Method | Returns | Description |
| --- | --- | --- |
| `FrankfurterSDK.test(testopts?, sdkopts?)` | `FrankfurterSDK` | Create a test-mode client. |

### Entity interface

All entities share the same interface.

#### Methods

| Method | Signature | Description |
| --- | --- | --- |
| `load` | `load(reqmatch?, ctrl?): Promise<Entity>` | Load a single entity by match criteria, and return it. |
| `list` | `list(reqmatch?, ctrl?): Promise<Entity[]>` | List entities matching the criteria, one per record. |
| `data` | `data(data?: Partial<Entity>): Entity` | Get or set entity data. |
| `match` | `match(match?: Partial<Entity>): Partial<Entity>` | Get or set entity match criteria. |
| `make` | `make(): Entity` | Create a new instance with the same options. |
| `client` | `client(): FrankfurterSDK` | Return the parent SDK client. |
| `entopts` | `entopts(): object` | Return a copy of the entity options. |

#### Return values

Entity operations resolve to the entity itself — there is no result
envelope, and an entity's `data()` reads its record:

- `load` resolves to a single entity object.
- `list` resolves to an **array** of entity objects (iterate it directly;
  there is no `.data` and no `.ok`).

On a failed request these methods **throw**, so wrap calls in
`try`/`catch` to handle errors. Only `direct()` returns the result
envelope described below.

### DirectResult shape

The `direct()` method returns:

```ts
{
  ok: boolean
  status: number
  headers: object
  data: any
}
```

On error, `ok` is `false` and an `err` property contains the error.

### FetchDef shape

The `prepare()` method returns:

```ts
{
  url: string
  method: string
  headers: Record<string, string>
  body?: any
}
```

### Entities

#### Coverage

| Field | Description |
| --- | --- |
| `base` | Requested base currency, EUR by default |
| `end_date` | Last eligible observation date with a nonempty matching rates query |
| `providers` | Selected providers, or null for the default daily blend |
| `quotes` | Requested quotes, or null for all |
| `start_date` | First eligible observation date with a nonempty matching rates query |

Operations: load.

API path: `/coverage`

#### Currency

| Field | Description |
| --- | --- |
| `end_date` | Latest publication coverage date; use /coverage for queryable pairs |
| `id` |  |
| `iso_code` | Currency or accounting unit code |
| `iso_numeric` | ISO 4217 numeric code |
| `name` | Full currency name |
| `peg` | Peg metadata, present only for pegged currencies |
| `providers` | Provider keys that publish this currency |
| `start_date` | Earliest publication coverage date; use /coverage for queryable pairs |
| `symbol` | Currency symbol |

Operations: list, load.

API path: `/currencies`

#### Provider

| Field | Description |
| --- | --- |
| `country_code` | ISO 3166-1 alpha-2 country code |
| `currencies` | Recognised currency codes within their valid date ranges covered by this provider |
| `data_url` | Link to the data source |
| `end_date` | Latest publication coverage date; use /coverage for queryable pairs |
| `frequency` | The period each observation stands for, after SDMX FREQ. |
| `id` |  |
| `key` | Provider identifier |
| `name` | Full provider name |
| `pivot_currency` | Base currency for published rates |
| `publish_cadence` | How often the provider publishes rates. |
| `publishes_missed` | Number of expected publishes missed since end_date, in units of publish_cadence. |
| `rate_type` | Official rate type as used by the source |
| `start_date` | Earliest publication coverage date; use /coverage for queryable pairs |
| `terms_url` | Link to terms of use |
| `unknown_currencies` | Unreviewed published codes absent from the currency registry. |

Operations: list, load.

API path: `/providers`

#### Rate

| Field | Description |
| --- | --- |
| `base` | Base currency or accounting unit code |
| `date` | The date of the rate |
| `id` |  |
| `providers` | Per-provider rates for this pair. |
| `quote` | Quote currency or accounting unit code |
| `rate` | Exchange rate value |

Operations: list, load.

API path: `/providers/{provider}/rates`



## Entities


### Coverage

Create an instance: `const coverage = client.Coverage()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `base` | `string` | Requested base currency, EUR by default |
| `end_date` | `string | null` | Last eligible observation date with a nonempty matching rates query |
| `providers` | `any[] | null` | Selected providers, or null for the default daily blend |
| `quotes` | `any[] | null` | Requested quotes, or null for all |
| `start_date` | `string | null` | First eligible observation date with a nonempty matching rates query |

#### Example: Load

```ts
const coverage = await client.Coverage().load()
```


### Currency

Create an instance: `const currency = client.Currency()`

#### Operations

| Method | Description |
| --- | --- |
| `list(match)` | List entities matching the criteria. |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `end_date` | `string | null` | Latest publication coverage date; use /coverage for queryable pairs |
| `id` | `string` |  |
| `iso_code` | `string` | Currency or accounting unit code |
| `iso_numeric` | `string | null` | ISO 4217 numeric code |
| `name` | `string` | Full currency name |
| `peg` | `Record<string, any>` | Peg metadata, present only for pegged currencies |
| `providers` | `any[]` | Provider keys that publish this currency |
| `start_date` | `string | null` | Earliest publication coverage date; use /coverage for queryable pairs |
| `symbol` | `string | null` | Currency symbol |

#### Example: Load

```ts
const currency = await client.Currency().load({ id: 'USD' })
```

#### Example: List

```ts
const currencyList = await client.Currency().list()
```


### Provider

Create an instance: `const provider = client.Provider()`

#### Operations

| Method | Description |
| --- | --- |
| `list(match)` | List entities matching the criteria. |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `country_code` | `string | null` | ISO 3166-1 alpha-2 country code |
| `currencies` | `any[]` | Recognised currency codes within their valid date ranges covered by this provider |
| `data_url` | `string | null` | Link to the data source |
| `end_date` | `string | null` | Latest publication coverage date; use /coverage for queryable pairs |
| `frequency` | `string` | The period each observation stands for, after SDMX FREQ. |
| `id` | `string` |  |
| `key` | `string` | Provider identifier |
| `name` | `string` | Full provider name |
| `pivot_currency` | `string | null` | Base currency for published rates |
| `publish_cadence` | `string | null` | How often the provider publishes rates. |
| `publishes_missed` | `number | null` | Number of expected publishes missed since end_date, in units of publish_cadence. |
| `rate_type` | `string | null` | Official rate type as used by the source |
| `start_date` | `string | null` | Earliest publication coverage date; use /coverage for queryable pairs |
| `terms_url` | `string | null` | Link to terms of use |
| `unknown_currencies` | `any[]` | Unreviewed published codes absent from the currency registry. |

#### Example: Load

```ts
const provider = await client.Provider().load({ id: 'ECB' })
```

#### Example: List

```ts
const providerList = await client.Provider().list()
```


### Rate

Create an instance: `const rate = client.Rate()`

#### Operations

| Method | Description |
| --- | --- |
| `list(match)` | List entities matching the criteria. |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `base` | `string` | Base currency or accounting unit code |
| `date` | `string` | The date of the rate |
| `id` | `string` |  |
| `providers` | `any[]` | Per-provider rates for this pair. |
| `quote` | `string` | Quote currency or accounting unit code |
| `rate` | `number` | Exchange rate value |

#### Example: Load

```ts
const rate = await client.Rate().load({ base: 'EUR', quote: 'USD' })
```

#### Example: List

```ts
const rateList = await client.Rate().list()
```

## Features

This SDK ships 1 optional features. Each is **inactive until you
switch it on**, so an SDK you have not configured behaves exactly as if none of
them existed — no retries, no cache, no logging, no measurable overhead.

Activate a feature by name in the client options, alongside the options shown
above:

| Feature | What it does |
|---|---|
| [`test`](#test) | Test transport |

### test

Test transport.

| Option | Default |
|---|---|
| `active` | `false` |

Set `feature.test.active` to enable it, then override any of the options above.


## Advanced

> The sections above cover everyday use. The material below explains the
> SDK's internals — useful when extending it with custom features, but not
> needed for normal use.

### The operation pipeline

Every entity operation follows a six-stage pipeline. Each stage fires a
feature hook before executing:

```
PrePoint → PreSpec → PreRequest → PreResponse → PreResult → PreDone
```

- **PrePoint**: Resolves which API endpoint to call based on the
  operation name and entity configuration.
- **PreSpec**: Builds the HTTP spec — URL, method, headers, body —
  from the resolved point and the caller's parameters.
- **PreRequest**: Sends the HTTP request. Features can intercept here
  to replace the transport (as TestFeature does with mocks).
- **PreResponse**: Parses the raw HTTP response.
- **PreResult**: Extracts the business data from the parsed response.
- **PreDone**: Final stage before returning to the caller. Entity
  state (match, data) is updated here.

If any stage errors, the pipeline short-circuits and the error surfaces
to the caller — see [Error handling](#error-handling) for how that looks
in this language.

### Features and hooks

Features are the extension mechanism. A feature is an object with a
`hooks` map. Each hook key is a pipeline stage name, and the value is
a function that receives the context.

The SDK ships with built-in features:

- **TestFeature**: Test transport

Features are initialized in order. Hooks fire in the order features
were added, so later features can override earlier ones.

### Module structure

```
frankfurter/
├── src/
│   ├── FrankfurterSDK.ts        # Main SDK class
│   ├── entity/             # Entity implementations
│   ├── feature/            # Built-in features (Base, Test, Log)
│   └── utility/            # Utility functions
├── test/                   # Test suites
└── dist/                   # Compiled output
```

Import the SDK from the package root:

```ts
import { FrankfurterSDK } from 'voxgig-sdk-frankfurter'
```

### Entity state

Entity instances are stateful. After a successful `list`, the entity
stores the returned data and match criteria internally. Subsequent
calls on the same instance can rely on this state.

```ts
const currency = client.Currency()
await currency.list()

// currency.data() now returns the currency data from the last `list`
// currency.match() returns the last match criteria
```

Call `make()` to create a fresh instance with the same configuration
but no stored state.

### Direct vs entity access

The entity interface handles URL construction, parameter placement,
and response parsing automatically. Use it for standard CRUD operations.

The `direct` method gives full control over the HTTP request. Use it
for non-standard endpoints, bulk operations, or any path not modelled
as an entity. The `prepare` method is useful for debugging — it
shows exactly what `direct` would send.


## Full Reference

See [REFERENCE.md](REFERENCE.md) for complete API reference
documentation including all method signatures, entity field schemas,
and detailed usage examples.
