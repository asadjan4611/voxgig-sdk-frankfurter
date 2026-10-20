# Frankfurter TypeScript SDK Reference

Complete API reference for the Frankfurter TypeScript SDK.


## FrankfurterSDK

### Constructor

```ts
new FrankfurterSDK(options?: object)
```

Create a new SDK client instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `options` | `object` | SDK configuration options. |
| `options.base` | `string` | Base URL for API requests. |
| `options.prefix` | `string` | URL prefix appended after base. |
| `options.suffix` | `string` | URL suffix appended after path. |
| `options.headers` | `object` | Custom headers for all requests. |
| `options.feature` | `object` | Feature configuration. |
| `options.system` | `object` | System overrides (e.g. custom fetch). |


### Static Methods

#### `FrankfurterSDK.test(testopts?, sdkopts?)`

Create a test client with mock features active.

```ts
const client = FrankfurterSDK.test()
```

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `testopts` | `object` | Test feature options. |
| `sdkopts` | `object` | Additional SDK options merged with test defaults. |

**Returns:** `FrankfurterSDK` instance in test mode.


### Instance Methods

#### `Coverage(data?: object)`

Create a new `Coverage` entity instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `data` | `object` | Initial entity data. |

**Returns:** `CoverageEntity` instance.

#### `Currency(data?: object)`

Create a new `Currency` entity instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `data` | `object` | Initial entity data. |

**Returns:** `CurrencyEntity` instance.

#### `Provider(data?: object)`

Create a new `Provider` entity instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `data` | `object` | Initial entity data. |

**Returns:** `ProviderEntity` instance.

#### `Rate(data?: object)`

Create a new `Rate` entity instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `data` | `object` | Initial entity data. |

**Returns:** `RateEntity` instance.

#### `options()`

Return a deep copy of the current SDK options.

**Returns:** `object`

#### `utility()`

Return a copy of the SDK utility object.

**Returns:** `object`

#### `direct(fetchargs?: object)`

Make a direct HTTP request to any API endpoint.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `fetchargs.path` | `string` | URL path with optional `{param}` placeholders. |
| `fetchargs.method` | `string` | HTTP method (default: `GET`). |
| `fetchargs.params` | `object` | Path parameter values for `{param}` substitution. |
| `fetchargs.query` | `object` | Query string parameters. |
| `fetchargs.headers` | `object` | Request headers (merged with defaults). |
| `fetchargs.body` | `any` | Request body (objects are JSON-serialized). |
| `fetchargs.ctrl` | `object` | Control options (e.g. `{ explain: true }`). |
| `fetchargs.ctrl.signal` | `AbortSignal` | Aborts the request in flight: `ok` is then `false` and `err.code` is `request_aborted`. |

**Returns:** `Promise<{ ok, status, headers, data }>`. On a failure
`ok` is `false` and `err` holds the error.

#### `prepare(fetchargs?: object)`

Prepare a fetch definition without sending the request. Accepts the
same parameters as `direct()`.

**Returns:** `Promise<{ url, method, headers, body } | Error>`

#### `tester(testopts?, sdkopts?)`

Alias for `FrankfurterSDK.test()`.

**Returns:** `FrankfurterSDK` instance in test mode.

#### Cancelling a call

Every entity operation takes an optional `ctrl` object after its match or
data, and an `AbortSignal` in `ctrl.signal` cancels the request in flight.
The operation then rejects with an error whose `code` is
`request_aborted` and whose `cause` is the signal's reason. A request
whose signal has already aborted is not sent. `stream()` takes the signal
as `callopts.signal`, and ends when it aborts.


---

## CoverageEntity

```ts
const coverage = client.Coverage()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `base` | `string` | Yes | Requested base currency, EUR by default |
| `end_date` | `string | null` | Yes | Last eligible observation date with a nonempty matching rates query |
| `providers` | `any[] | null` | Yes | Selected providers, or null for the default daily blend |
| `quotes` | `any[] | null` | Yes | Requested quotes, or null for all |
| `start_date` | `string | null` | Yes | First eligible observation date with a nonempty matching rates query |

### Operations

#### `load(match: object, ctrl?: object)`

Load a single entity matching the given criteria. Resolves to the entity, whose record `data()` reads.

```ts
const result = await client.Coverage().load()
```

### Common Methods

#### `data(data?: object)`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `match(match?: object)`

Get or set the entity match criteria. Works the same as `data()`.

#### `make()`

Create a new `CoverageEntity` instance with the same client and
options.

#### `client()`

Return the parent `FrankfurterSDK` instance.

#### `entopts()`

Return a copy of the entity options.


---

## CurrencyEntity

```ts
const currency = client.Currency()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `end_date` | `string | null` | No | Latest publication coverage date; use /coverage for queryable pairs |
| `id` | `string` | No |  |
| `iso_code` | `string` | Yes | Currency or accounting unit code |
| `iso_numeric` | `string | null` | No | ISO 4217 numeric code |
| `name` | `string` | Yes | Full currency name |
| `peg` | `Record<string, any>` | No | Peg metadata, present only for pegged currencies |
| `providers` | `any[]` | No | Provider keys that publish this currency |
| `start_date` | `string | null` | No | Earliest publication coverage date; use /coverage for queryable pairs |
| `symbol` | `string | null` | No | Currency symbol |

### Operations

#### `list(match: object, ctrl?: object)`

List entities matching the given criteria. Resolves to an array of entities, one per record.

```ts
const results = await client.Currency().list()
```

#### `load(match: object, ctrl?: object)`

Load a single entity matching the given criteria. Resolves to the entity, whose record `data()` reads.

```ts
const result = await client.Currency().load({ id: 'currency_id' })
```

### Common Methods

#### `data(data?: object)`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `match(match?: object)`

Get or set the entity match criteria. Works the same as `data()`.

#### `make()`

Create a new `CurrencyEntity` instance with the same client and
options.

#### `client()`

Return the parent `FrankfurterSDK` instance.

#### `entopts()`

Return a copy of the entity options.


---

## ProviderEntity

```ts
const provider = client.Provider()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `country_code` | `string | null` | No | ISO 3166-1 alpha-2 country code |
| `currencies` | `any[]` | Yes | Recognised currency codes within their valid date ranges covered by this provider |
| `data_url` | `string | null` | No | Link to the data source |
| `end_date` | `string | null` | No | Latest publication coverage date; use /coverage for queryable pairs |
| `frequency` | `string` | No | The period each observation stands for, after SDMX FREQ. |
| `id` | `string` | No |  |
| `key` | `string` | Yes | Provider identifier |
| `name` | `string` | Yes | Full provider name |
| `pivot_currency` | `string | null` | No | Base currency for published rates |
| `publish_cadence` | `string | null` | No | How often the provider publishes rates. |
| `publishes_missed` | `number | null` | No | Number of expected publishes missed since end_date, in units of publish_cadence. |
| `rate_type` | `string | null` | No | Official rate type as used by the source |
| `start_date` | `string | null` | No | Earliest publication coverage date; use /coverage for queryable pairs |
| `terms_url` | `string | null` | No | Link to terms of use |
| `unknown_currencies` | `any[]` | No | Unreviewed published codes absent from the currency registry. |

### Operations

#### `list(match: object, ctrl?: object)`

List entities matching the given criteria. Resolves to an array of entities, one per record.

```ts
const results = await client.Provider().list()
```

#### `load(match: object, ctrl?: object)`

Load a single entity matching the given criteria. Resolves to the entity, whose record `data()` reads.

```ts
const result = await client.Provider().load({ id: 'provider_id' })
```

### Common Methods

#### `data(data?: object)`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `match(match?: object)`

Get or set the entity match criteria. Works the same as `data()`.

#### `make()`

Create a new `ProviderEntity` instance with the same client and
options.

#### `client()`

Return the parent `FrankfurterSDK` instance.

#### `entopts()`

Return a copy of the entity options.


---

## RateEntity

```ts
const rate = client.Rate()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `base` | `string` | Yes | Base currency or accounting unit code |
| `date` | `string` | Yes | The date of the rate |
| `id` | `string` | No |  |
| `providers` | `any[]` | No | Per-provider rates for this pair. |
| `quote` | `string` | Yes | Quote currency or accounting unit code |
| `rate` | `number` | Yes | Exchange rate value |

### Operations

#### `list(match: object, ctrl?: object)`

List entities matching the given criteria. Resolves to an array of entities, one per record.

```ts
const results = await client.Rate().list()
```

#### `load(match: object, ctrl?: object)`

Load a single entity matching the given criteria. Resolves to the entity, whose record `data()` reads.

```ts
const result = await client.Rate().load({ base: 'base', quote: 'quote' })
```

### Common Methods

#### `data(data?: object)`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `match(match?: object)`

Get or set the entity match criteria. Works the same as `data()`.

#### `make()`

Create a new `RateEntity` instance with the same client and
options.

#### `client()`

Return the parent `FrankfurterSDK` instance.

#### `entopts()`

Return a copy of the entity options.


---

## Features

| Feature | Version | Description |
| --- | --- | --- |
| `test` | 0.0.1 | Test transport |


Features are activated via the `feature` option:

```ts
const client = new FrankfurterSDK({
  feature: {
    test: { active: true },
  }
})
```


### Configuring features

Each feature is inactive until switched on, and an SDK with no feature
configured does no feature work at all. Every option below keeps its default
unless you name it.

The array form of \`feature\` is significant: several features wrap the
transport, and the order you list them in is the order they nest.

#### `test`

Test transport.

**Configuration**

| Option | Default |
|---|---|
| `active` | `false` |

| Option | Type |
|---|---|
| `entity` | map |
| `net` | map |

These take no default: the feature behaves one way when you supply them and
another when you do not.

**Usage**

Set `feature.test.active` to true in the client options, and override any option above in the same entry. Every option keeps
its default unless you name it.

**Considerations**

- Attaches to pipeline hooks, not the transport, so activation order does
  not change what it observes.
- Installs the BASE transport that the wrapping features wrap, so it must be
  activated before them.
- Inactive by default: leaving it out costs nothing at runtime.

