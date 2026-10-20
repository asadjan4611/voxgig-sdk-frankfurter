import { test } from 'node:test'
import { SDK } from '..'
import { runLiveScenarios } from './live-scenarios'
import { loadEnvLocal } from './utility'
loadEnvLocal(__dirname + '/../.env.local')
// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
test('live operation coverage', { skip: process.env.FRANKFURTER_TEST_LIVE !== 'TRUE' }, async (t) => {
  await runLiveScenarios(SDK, [
  {
    "entity": "coverage",
    "accessor": "Coverage",
    "op": "load",
    "id": "GET /coverage",
    "contractVersion": 1,
    "kind": "http",
    "path": "/coverage",
    "method": "GET",
    "rename": {},
    "args": {
      "query": [
        {
          "a": true,
          "ex": "USD",
          "k": "query",
          "n": "base",
          "or": "base",
          "r": false,
          "t": "`$STRING`",
          "index$": 0
        },
        {
          "a": true,
          "ex": "ECB,TCMB",
          "k": "query",
          "n": "provider",
          "or": "providers",
          "r": false,
          "t": "`$STRING`",
          "index$": 1
        },
        {
          "a": true,
          "ex": "USD,GBP,JPY",
          "k": "query",
          "n": "quote",
          "or": "quotes",
          "r": false,
          "t": "`$STRING`",
          "index$": 2
        }
      ]
    },
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Coverage of the selected rate query",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "base": {
                    "type": "string",
                    "description": "Requested base currency, EUR by default",
                    "key$": "base"
                  },
                  "quotes": {
                    "type": [
                      "array",
                      "null"
                    ],
                    "items": {
                      "type": "string"
                    },
                    "description": "Requested quotes, or null for all",
                    "key$": "quotes"
                  },
                  "providers": {
                    "type": [
                      "array",
                      "null"
                    ],
                    "items": {
                      "type": "string"
                    },
                    "description": "Selected providers, or null for the default daily blend",
                    "key$": "providers"
                  },
                  "start_date": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date",
                    "description": "First eligible observation date with a nonempty matching rates query",
                    "key$": "start_date"
                  },
                  "end_date": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date",
                    "description": "Last eligible observation date with a nonempty matching rates query",
                    "key$": "end_date"
                  }
                },
                "required": [
                  "base",
                  "quotes",
                  "providers",
                  "start_date",
                  "end_date"
                ],
                "x-ref": "#/components/schemas/Coverage",
                "index$": 0
              }
            }
          }
        },
        "422": {
          "description": "Invalid request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/UnprocessableEntity"
        },
        "503": {
          "description": "The request deadline expired before the response could be computed, or the worker process is already running its limit of concurrent live daily-range computes (any daily range served live: with providers, with expand=providers, or before the precomputed blend is ready). In the second case a Retry-After header says how many seconds to wait before retrying. Otherwise retry with a narrower request: filter with quotes, aggregate with group, or split the range into shorter requests.",
          "headers": {
            "Retry-After": {
              "description": "Seconds to wait before retrying. Sent when the server is at its limit of concurrent daily range computes.",
              "schema": {
                "type": "integer"
              }
            }
          },
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/ServiceUnavailable"
        }
      }
    },
    "reachable": true
  },
  {
    "entity": "currency",
    "accessor": "Currency",
    "op": "list",
    "id": "GET /currencies",
    "contractVersion": 1,
    "kind": "http",
    "path": "/currencies",
    "method": "GET",
    "rename": {},
    "args": {
      "query": [
        {
          "a": true,
          "ex": "ECB,TCMB",
          "k": "query",
          "n": "provider",
          "or": "providers",
          "r": false,
          "t": "`$STRING`",
          "index$": 0
        },
        {
          "a": true,
          "k": "query",
          "n": "scope",
          "or": "scope",
          "r": false,
          "t": "`$STRING`",
          "index$": 1
        }
      ]
    },
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Available currencies",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "iso_code": {
                      "type": "string",
                      "description": "Currency or accounting unit code",
                      "key$": "iso_code"
                    },
                    "iso_numeric": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "description": "ISO 4217 numeric code",
                      "key$": "iso_numeric"
                    },
                    "name": {
                      "type": "string",
                      "description": "Full currency name",
                      "key$": "name"
                    },
                    "symbol": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "description": "Currency symbol",
                      "key$": "symbol"
                    },
                    "start_date": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date",
                      "description": "Earliest publication coverage date; use /coverage for queryable pairs",
                      "key$": "start_date"
                    },
                    "end_date": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date",
                      "description": "Latest publication coverage date; use /coverage for queryable pairs",
                      "key$": "end_date"
                    }
                  },
                  "required": [
                    "iso_code",
                    "name"
                  ],
                  "x-ref": "#/components/schemas/Currency",
                  "index$": 0
                }
              },
              "example": [
                {
                  "iso_code": "EUR",
                  "iso_numeric": "978",
                  "name": "Euro",
                  "symbol": "€",
                  "start_date": "1999-01-04",
                  "end_date": "2026-03-17"
                },
                {
                  "iso_code": "USD",
                  "iso_numeric": "840",
                  "name": "United States Dollar",
                  "symbol": "$",
                  "start_date": "1999-01-04",
                  "end_date": "2026-03-17"
                }
              ]
            }
          }
        },
        "422": {
          "description": "Invalid request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/UnprocessableEntity"
        }
      }
    },
    "reachable": true
  },
  {
    "entity": "currency",
    "accessor": "Currency",
    "op": "load",
    "id": "GET /currency/{code}",
    "contractVersion": 1,
    "kind": "http",
    "path": "/currency/{code}",
    "method": "GET",
    "rename": {
      "param": {
        "code": "id"
      }
    },
    "args": {
      "params": [
        {
          "a": true,
          "ex": "USD",
          "k": "param",
          "n": "id",
          "or": "code",
          "r": true,
          "t": "`$STRING`",
          "index$": 0
        }
      ]
    },
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Currency details",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "iso_code": {
                    "type": "string",
                    "description": "Currency or accounting unit code",
                    "key$": "iso_code"
                  },
                  "iso_numeric": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "ISO 4217 numeric code",
                    "key$": "iso_numeric"
                  },
                  "name": {
                    "type": "string",
                    "description": "Full currency name",
                    "key$": "name"
                  },
                  "symbol": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "Currency symbol",
                    "key$": "symbol"
                  },
                  "providers": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Provider keys that publish this currency",
                    "key$": "providers"
                  },
                  "peg": {
                    "type": "object",
                    "properties": {
                      "base": {
                        "type": "string"
                      },
                      "rate": {
                        "type": "number"
                      },
                      "authority": {
                        "type": "string"
                      },
                      "source": {
                        "type": "string",
                        "format": "uri"
                      }
                    },
                    "description": "Peg metadata, present only for pegged currencies",
                    "key$": "peg"
                  }
                },
                "required": [
                  "iso_code",
                  "name"
                ],
                "x-ref": "#/components/schemas/CurrencyDetail",
                "index$": 0
              },
              "example": {
                "iso_code": "USD",
                "iso_numeric": "840",
                "name": "United States Dollar",
                "symbol": "$",
                "providers": [
                  "ECB",
                  "BOC",
                  "FED"
                ]
              }
            }
          }
        },
        "404": {
          "description": "No data found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/NotFound"
        }
      }
    },
    "reachable": true
  },
  {
    "entity": "provider",
    "accessor": "Provider",
    "op": "list",
    "id": "GET /providers",
    "contractVersion": 1,
    "kind": "http",
    "path": "/providers",
    "method": "GET",
    "rename": {},
    "args": {},
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Available providers",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "key": {
                      "type": "string",
                      "description": "Provider identifier",
                      "key$": "key"
                    },
                    "name": {
                      "type": "string",
                      "description": "Full provider name",
                      "key$": "name"
                    },
                    "country_code": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "description": "ISO 3166-1 alpha-2 country code",
                      "key$": "country_code"
                    },
                    "rate_type": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "description": "Official rate type as used by the source",
                      "key$": "rate_type"
                    },
                    "pivot_currency": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "description": "Base currency for published rates",
                      "key$": "pivot_currency"
                    },
                    "data_url": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "uri",
                      "description": "Link to the data source",
                      "key$": "data_url"
                    },
                    "terms_url": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "uri",
                      "description": "Link to terms of use",
                      "key$": "terms_url"
                    },
                    "start_date": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date",
                      "description": "Earliest publication coverage date; use /coverage for queryable pairs",
                      "key$": "start_date"
                    },
                    "end_date": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "date",
                      "description": "Latest publication coverage date; use /coverage for queryable pairs",
                      "key$": "end_date"
                    },
                    "publish_cadence": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "enum": [
                        "daily",
                        "weekly",
                        "monthly",
                        "quarterly",
                        null
                      ],
                      "description": "How often the provider publishes rates. Determines the unit of publishes_missed: a count of days, ISO weeks, calendar months, or calendar quarters. Null for historical-only providers with no scheduled cadence.",
                      "key$": "publish_cadence"
                    },
                    "frequency": {
                      "type": "string",
                      "enum": [
                        "daily",
                        "weekly",
                        "monthly",
                        "quarterly"
                      ],
                      "description": "The period each observation stands for, after SDMX FREQ. A daily value is dated on the day observed. A monthly or quarterly value is dated on the day it takes effect and stands for the period until the next one. Values coarser than daily never enter the blend: query them by provider.",
                      "key$": "frequency"
                    },
                    "publishes_missed": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "minimum": 0,
                      "description": "Number of expected publishes missed since end_date, in units of publish_cadence. For daily providers, counts scheduled publish days strictly between end_date and today. For weekly, monthly and quarterly providers, counts ISO weeks, calendar months or calendar quarters between the latest imported bucket and the bucket whose publish window has already started. Null when the provider has no scheduled cadence or no imported data.",
                      "key$": "publishes_missed"
                    },
                    "currencies": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "Recognised currency codes within their valid date ranges covered by this provider",
                      "key$": "currencies"
                    },
                    "unknown_currencies": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "Unreviewed published codes absent from the currency registry. Available through single-provider rates but excluded from blends and the currency catalogue. Known non-currency series do not trigger this alert.",
                      "key$": "unknown_currencies"
                    }
                  },
                  "required": [
                    "key",
                    "name",
                    "currencies"
                  ],
                  "x-ref": "#/components/schemas/Provider",
                  "index$": 0
                }
              },
              "example": [
                {
                  "key": "ECB",
                  "name": "European Central Bank",
                  "country_code": "EU",
                  "rate_type": "reference",
                  "pivot_currency": "EUR",
                  "data_url": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
                  "terms_url": "https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html",
                  "start_date": "1999-01-04",
                  "end_date": "2026-03-17",
                  "currencies": [
                    "USD",
                    "GBP"
                  ]
                }
              ]
            }
          }
        },
        "4XX": {
          "description": "Invalid request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/UnprocessableEntity"
        }
      }
    },
    "reachable": true
  },
  {
    "entity": "provider",
    "accessor": "Provider",
    "op": "load",
    "id": "GET /providers/{provider}",
    "contractVersion": 1,
    "kind": "http",
    "path": "/providers/{provider}",
    "method": "GET",
    "rename": {
      "param": {
        "provider": "id"
      }
    },
    "args": {
      "params": [
        {
          "a": true,
          "ex": "ECB",
          "k": "param",
          "n": "id",
          "or": "provider",
          "r": true,
          "t": "`$STRING`",
          "index$": 0
        }
      ]
    },
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Provider",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "key": {
                    "type": "string",
                    "description": "Provider identifier",
                    "key$": "key"
                  },
                  "name": {
                    "type": "string",
                    "description": "Full provider name",
                    "key$": "name"
                  },
                  "country_code": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "ISO 3166-1 alpha-2 country code",
                    "key$": "country_code"
                  },
                  "rate_type": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "Official rate type as used by the source",
                    "key$": "rate_type"
                  },
                  "pivot_currency": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "Base currency for published rates",
                    "key$": "pivot_currency"
                  },
                  "data_url": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "uri",
                    "description": "Link to the data source",
                    "key$": "data_url"
                  },
                  "terms_url": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "uri",
                    "description": "Link to terms of use",
                    "key$": "terms_url"
                  },
                  "start_date": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date",
                    "description": "Earliest publication coverage date; use /coverage for queryable pairs",
                    "key$": "start_date"
                  },
                  "end_date": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date",
                    "description": "Latest publication coverage date; use /coverage for queryable pairs",
                    "key$": "end_date"
                  },
                  "publish_cadence": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "enum": [
                      "daily",
                      "weekly",
                      "monthly",
                      "quarterly",
                      null
                    ],
                    "description": "How often the provider publishes rates. Determines the unit of publishes_missed: a count of days, ISO weeks, calendar months, or calendar quarters. Null for historical-only providers with no scheduled cadence.",
                    "key$": "publish_cadence"
                  },
                  "frequency": {
                    "type": "string",
                    "enum": [
                      "daily",
                      "weekly",
                      "monthly",
                      "quarterly"
                    ],
                    "description": "The period each observation stands for, after SDMX FREQ. A daily value is dated on the day observed. A monthly or quarterly value is dated on the day it takes effect and stands for the period until the next one. Values coarser than daily never enter the blend: query them by provider.",
                    "key$": "frequency"
                  },
                  "publishes_missed": {
                    "type": [
                      "integer",
                      "null"
                    ],
                    "minimum": 0,
                    "description": "Number of expected publishes missed since end_date, in units of publish_cadence. For daily providers, counts scheduled publish days strictly between end_date and today. For weekly, monthly and quarterly providers, counts ISO weeks, calendar months or calendar quarters between the latest imported bucket and the bucket whose publish window has already started. Null when the provider has no scheduled cadence or no imported data.",
                    "key$": "publishes_missed"
                  },
                  "currencies": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Recognised currency codes within their valid date ranges covered by this provider",
                    "key$": "currencies"
                  },
                  "unknown_currencies": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Unreviewed published codes absent from the currency registry. Available through single-provider rates but excluded from blends and the currency catalogue. Known non-currency series do not trigger this alert.",
                    "key$": "unknown_currencies"
                  }
                },
                "required": [
                  "key",
                  "name",
                  "currencies"
                ],
                "x-ref": "#/components/schemas/Provider",
                "index$": 0
              }
            }
          }
        },
        "404": {
          "description": "No data found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/NotFound"
        }
      }
    },
    "reachable": true
  },
  {
    "entity": "rate",
    "accessor": "Rate",
    "op": "list",
    "id": "GET /providers/{provider}/rates",
    "contractVersion": 1,
    "kind": "http",
    "path": "/providers/{provider}/rates",
    "method": "GET",
    "rename": {},
    "args": {
      "params": [
        {
          "a": true,
          "ex": "ECB",
          "k": "param",
          "n": "provider",
          "or": "provider",
          "r": true,
          "t": "`$STRING`",
          "index$": 0
        }
      ],
      "query": [
        {
          "a": true,
          "ex": "USD",
          "k": "query",
          "n": "base",
          "or": "base",
          "r": false,
          "t": "`$STRING`",
          "index$": 0
        },
        {
          "a": true,
          "ex": "2024-01-15",
          "k": "query",
          "n": "date",
          "or": "date",
          "r": false,
          "t": "`$STRING`",
          "index$": 1
        },
        {
          "a": true,
          "ex": "providers",
          "k": "query",
          "n": "expand",
          "or": "expand",
          "r": false,
          "t": "`$STRING`",
          "index$": 2
        },
        {
          "a": true,
          "ex": "2024-01-01",
          "k": "query",
          "n": "from",
          "or": "from",
          "r": false,
          "t": "`$STRING`",
          "index$": 3
        },
        {
          "a": true,
          "ex": "month",
          "k": "query",
          "n": "group",
          "or": "group",
          "r": false,
          "t": "`$STRING`",
          "index$": 4
        },
        {
          "a": true,
          "ex": "USD,GBP,JPY",
          "k": "query",
          "n": "quote",
          "or": "quotes",
          "r": false,
          "t": "`$STRING`",
          "index$": 5
        },
        {
          "a": true,
          "ex": "2024-01-31",
          "k": "query",
          "n": "to",
          "or": "to",
          "r": false,
          "t": "`$STRING`",
          "index$": 6
        }
      ]
    },
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Exchange rates",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "date": {
                      "type": "string",
                      "format": "date",
                      "description": "The date of the rate",
                      "key$": "date"
                    },
                    "base": {
                      "type": "string",
                      "description": "Base currency or accounting unit code",
                      "key$": "base"
                    },
                    "quote": {
                      "type": "string",
                      "description": "Quote currency or accounting unit code",
                      "key$": "quote"
                    },
                    "rate": {
                      "type": "number",
                      "description": "Exchange rate value",
                      "exclusiveMinimum": 0,
                      "key$": "rate"
                    },
                    "providers": {
                      "type": "array",
                      "description": "Per-provider rates for this pair. Present only when `expand=providers` is set. Each entry has the provider's observation date and published rate (rebased to the row's base). Entries with `excluded: true` did not contribute to the blended `rate` — either flagged as outliers by the consensus filter, or overridden by a currency peg. A one-day typo in a provider's series is left out, so its entry shows the observation before it. Omitted on synthesized peg rows where no provider published the quote.",
                      "items": {
                        "type": "object",
                        "properties": {
                          "key": {
                            "type": "string",
                            "description": "Provider key"
                          },
                          "date": {
                            "type": "string",
                            "format": "date",
                            "description": "Provider observation date used for this entry"
                          },
                          "rate": {
                            "type": "number",
                            "exclusiveMinimum": 0,
                            "description": "Provider's rate, rebased to the row's base"
                          },
                          "excluded": {
                            "type": "boolean",
                            "description": "Present and true when this entry did not contribute to the blended rate"
                          }
                        },
                        "required": [
                          "key",
                          "date",
                          "rate"
                        ]
                      },
                      "key$": "providers"
                    }
                  },
                  "required": [
                    "date",
                    "base",
                    "quote",
                    "rate"
                  ],
                  "x-ref": "#/components/schemas/Rate",
                  "index$": 0
                }
              },
              "example": [
                {
                  "date": "2024-01-15",
                  "base": "EUR",
                  "quote": "EUR",
                  "rate": 1
                },
                {
                  "date": "2024-01-15",
                  "base": "EUR",
                  "quote": "GBP",
                  "rate": 0.8623
                },
                {
                  "date": "2024-01-15",
                  "base": "EUR",
                  "quote": "USD",
                  "rate": 1.089
                }
              ]
            },
            "application/x-ndjson": {
              "schema": {
                "type": "string",
                "description": "NDJSON stream of Rate objects, one JSON object per line"
              },
              "example": "{ \"date\": \"2024-01-15\", \"base\": \"EUR\", \"quote\": \"USD\", \"rate\": 1.089 }\n{ \"date\": \"2024-01-15\", \"base\": \"EUR\", \"quote\": \"GBP\", \"rate\": 0.8623 }\n"
            }
          }
        },
        "404": {
          "description": "No data found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/NotFound"
        },
        "422": {
          "description": "Invalid request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/UnprocessableEntity"
        },
        "503": {
          "description": "The request deadline expired before the response could be computed, or the worker process is already running its limit of concurrent live daily-range computes (any daily range served live: with providers, with expand=providers, or before the precomputed blend is ready). In the second case a Retry-After header says how many seconds to wait before retrying. Otherwise retry with a narrower request: filter with quotes, aggregate with group, or split the range into shorter requests.",
          "headers": {
            "Retry-After": {
              "description": "Seconds to wait before retrying. Sent when the server is at its limit of concurrent daily range computes.",
              "schema": {
                "type": "integer"
              }
            }
          },
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/ServiceUnavailable"
        }
      }
    },
    "reachable": true
  },
  {
    "entity": "rate",
    "accessor": "Rate",
    "op": "list",
    "id": "GET /rates",
    "contractVersion": 1,
    "kind": "http",
    "path": "/rates",
    "method": "GET",
    "rename": {},
    "args": {
      "query": [
        {
          "a": true,
          "ex": "USD",
          "k": "query",
          "n": "base",
          "or": "base",
          "r": false,
          "t": "`$STRING`",
          "index$": 0
        },
        {
          "a": true,
          "ex": "2024-01-15",
          "k": "query",
          "n": "date",
          "or": "date",
          "r": false,
          "t": "`$STRING`",
          "index$": 1
        },
        {
          "a": true,
          "ex": "providers",
          "k": "query",
          "n": "expand",
          "or": "expand",
          "r": false,
          "t": "`$STRING`",
          "index$": 2
        },
        {
          "a": true,
          "ex": "2024-01-01",
          "k": "query",
          "n": "from",
          "or": "from",
          "r": false,
          "t": "`$STRING`",
          "index$": 3
        },
        {
          "a": true,
          "ex": "month",
          "k": "query",
          "n": "group",
          "or": "group",
          "r": false,
          "t": "`$STRING`",
          "index$": 4
        },
        {
          "a": true,
          "ex": "ECB,TCMB",
          "k": "query",
          "n": "provider",
          "or": "providers",
          "r": false,
          "t": "`$STRING`",
          "index$": 5
        },
        {
          "a": true,
          "ex": "USD,GBP,JPY",
          "k": "query",
          "n": "quote",
          "or": "quotes",
          "r": false,
          "t": "`$STRING`",
          "index$": 6
        },
        {
          "a": true,
          "ex": "2024-01-31",
          "k": "query",
          "n": "to",
          "or": "to",
          "r": false,
          "t": "`$STRING`",
          "index$": 7
        }
      ]
    },
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Exchange rates",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "date": {
                      "type": "string",
                      "format": "date",
                      "description": "The date of the rate",
                      "key$": "date"
                    },
                    "base": {
                      "type": "string",
                      "description": "Base currency or accounting unit code",
                      "key$": "base"
                    },
                    "quote": {
                      "type": "string",
                      "description": "Quote currency or accounting unit code",
                      "key$": "quote"
                    },
                    "rate": {
                      "type": "number",
                      "description": "Exchange rate value",
                      "exclusiveMinimum": 0,
                      "key$": "rate"
                    },
                    "providers": {
                      "type": "array",
                      "description": "Per-provider rates for this pair. Present only when `expand=providers` is set. Each entry has the provider's observation date and published rate (rebased to the row's base). Entries with `excluded: true` did not contribute to the blended `rate` — either flagged as outliers by the consensus filter, or overridden by a currency peg. A one-day typo in a provider's series is left out, so its entry shows the observation before it. Omitted on synthesized peg rows where no provider published the quote.",
                      "items": {
                        "type": "object",
                        "properties": {
                          "key": {
                            "type": "string",
                            "description": "Provider key"
                          },
                          "date": {
                            "type": "string",
                            "format": "date",
                            "description": "Provider observation date used for this entry"
                          },
                          "rate": {
                            "type": "number",
                            "exclusiveMinimum": 0,
                            "description": "Provider's rate, rebased to the row's base"
                          },
                          "excluded": {
                            "type": "boolean",
                            "description": "Present and true when this entry did not contribute to the blended rate"
                          }
                        },
                        "required": [
                          "key",
                          "date",
                          "rate"
                        ]
                      },
                      "key$": "providers"
                    }
                  },
                  "required": [
                    "date",
                    "base",
                    "quote",
                    "rate"
                  ],
                  "x-ref": "#/components/schemas/Rate",
                  "index$": 0
                }
              },
              "example": [
                {
                  "date": "2024-01-15",
                  "base": "EUR",
                  "quote": "EUR",
                  "rate": 1
                },
                {
                  "date": "2024-01-15",
                  "base": "EUR",
                  "quote": "GBP",
                  "rate": 0.8623
                },
                {
                  "date": "2024-01-15",
                  "base": "EUR",
                  "quote": "USD",
                  "rate": 1.089
                }
              ]
            },
            "application/x-ndjson": {
              "schema": {
                "type": "string",
                "description": "NDJSON stream of Rate objects, one JSON object per line"
              },
              "example": "{ \"date\": \"2024-01-15\", \"base\": \"EUR\", \"quote\": \"USD\", \"rate\": 1.089 }\n{ \"date\": \"2024-01-15\", \"base\": \"EUR\", \"quote\": \"GBP\", \"rate\": 0.8623 }\n"
            }
          }
        },
        "404": {
          "description": "No data found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/NotFound"
        },
        "422": {
          "description": "Invalid request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/UnprocessableEntity"
        },
        "503": {
          "description": "The request deadline expired before the response could be computed, or the worker process is already running its limit of concurrent live daily-range computes (any daily range served live: with providers, with expand=providers, or before the precomputed blend is ready). In the second case a Retry-After header says how many seconds to wait before retrying. Otherwise retry with a narrower request: filter with quotes, aggregate with group, or split the range into shorter requests.",
          "headers": {
            "Retry-After": {
              "description": "Seconds to wait before retrying. Sent when the server is at its limit of concurrent daily range computes.",
              "schema": {
                "type": "integer"
              }
            }
          },
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/ServiceUnavailable"
        }
      }
    },
    "reachable": true
  },
  {
    "entity": "rate",
    "accessor": "Rate",
    "op": "load",
    "id": "GET /providers/{provider}/rate/{base}/{quote}",
    "contractVersion": 1,
    "kind": "http",
    "path": "/providers/{provider}/rate/{base}/{quote}",
    "method": "GET",
    "rename": {},
    "args": {
      "params": [
        {
          "a": true,
          "ex": "EUR",
          "k": "param",
          "n": "base",
          "or": "base",
          "r": true,
          "t": "`$STRING`",
          "index$": 0
        },
        {
          "a": true,
          "ex": "ECB",
          "k": "param",
          "n": "provider",
          "or": "provider",
          "r": true,
          "t": "`$STRING`",
          "index$": 1
        },
        {
          "a": true,
          "ex": "USD",
          "k": "param",
          "n": "quote",
          "or": "quote",
          "r": true,
          "t": "`$STRING`",
          "index$": 2
        }
      ],
      "query": [
        {
          "a": true,
          "ex": "2024-01-15",
          "k": "query",
          "n": "date",
          "or": "date",
          "r": false,
          "t": "`$STRING`",
          "index$": 0
        }
      ]
    },
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Exchange rate",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "date": {
                    "type": "string",
                    "format": "date",
                    "description": "The date of the rate",
                    "key$": "date"
                  },
                  "base": {
                    "type": "string",
                    "description": "Base currency or accounting unit code",
                    "key$": "base"
                  },
                  "quote": {
                    "type": "string",
                    "description": "Quote currency or accounting unit code",
                    "key$": "quote"
                  },
                  "rate": {
                    "type": "number",
                    "description": "Exchange rate value",
                    "exclusiveMinimum": 0,
                    "key$": "rate"
                  },
                  "providers": {
                    "type": "array",
                    "description": "Per-provider rates for this pair. Present only when `expand=providers` is set. Each entry has the provider's observation date and published rate (rebased to the row's base). Entries with `excluded: true` did not contribute to the blended `rate` — either flagged as outliers by the consensus filter, or overridden by a currency peg. A one-day typo in a provider's series is left out, so its entry shows the observation before it. Omitted on synthesized peg rows where no provider published the quote.",
                    "items": {
                      "type": "object",
                      "properties": {
                        "key": {
                          "type": "string",
                          "description": "Provider key"
                        },
                        "date": {
                          "type": "string",
                          "format": "date",
                          "description": "Provider observation date used for this entry"
                        },
                        "rate": {
                          "type": "number",
                          "exclusiveMinimum": 0,
                          "description": "Provider's rate, rebased to the row's base"
                        },
                        "excluded": {
                          "type": "boolean",
                          "description": "Present and true when this entry did not contribute to the blended rate"
                        }
                      },
                      "required": [
                        "key",
                        "date",
                        "rate"
                      ]
                    },
                    "key$": "providers"
                  }
                },
                "required": [
                  "date",
                  "base",
                  "quote",
                  "rate"
                ],
                "x-ref": "#/components/schemas/Rate",
                "index$": 0
              },
              "example": {
                "date": "2026-03-25",
                "base": "EUR",
                "quote": "USD",
                "rate": 1.1568
              }
            }
          }
        },
        "404": {
          "description": "No data found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/NotFound"
        },
        "422": {
          "description": "Invalid request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/UnprocessableEntity"
        },
        "503": {
          "description": "The request deadline expired before the response could be computed, or the worker process is already running its limit of concurrent live daily-range computes (any daily range served live: with providers, with expand=providers, or before the precomputed blend is ready). In the second case a Retry-After header says how many seconds to wait before retrying. Otherwise retry with a narrower request: filter with quotes, aggregate with group, or split the range into shorter requests.",
          "headers": {
            "Retry-After": {
              "description": "Seconds to wait before retrying. Sent when the server is at its limit of concurrent daily range computes.",
              "schema": {
                "type": "integer"
              }
            }
          },
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/ServiceUnavailable"
        }
      }
    },
    "reachable": true
  },
  {
    "entity": "rate",
    "accessor": "Rate",
    "op": "load",
    "id": "GET /rate/{base}/{quote}",
    "contractVersion": 1,
    "kind": "http",
    "path": "/rate/{base}/{quote}",
    "method": "GET",
    "rename": {},
    "args": {
      "params": [
        {
          "a": true,
          "ex": "EUR",
          "k": "param",
          "n": "base",
          "or": "base",
          "r": true,
          "t": "`$STRING`",
          "index$": 0
        },
        {
          "a": true,
          "ex": "USD",
          "k": "param",
          "n": "quote",
          "or": "quote",
          "r": true,
          "t": "`$STRING`",
          "index$": 1
        }
      ],
      "query": [
        {
          "a": true,
          "ex": "2024-01-15",
          "k": "query",
          "n": "date",
          "or": "date",
          "r": false,
          "t": "`$STRING`",
          "index$": 0
        },
        {
          "a": true,
          "ex": "ECB,TCMB",
          "k": "query",
          "n": "provider",
          "or": "providers",
          "r": false,
          "t": "`$STRING`",
          "index$": 1
        }
      ]
    },
    "facts": {
      "live": true,
      "security": [],
      "securitySource": "definition",
      "responses": {
        "200": {
          "description": "Exchange rate",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "date": {
                    "type": "string",
                    "format": "date",
                    "description": "The date of the rate",
                    "key$": "date"
                  },
                  "base": {
                    "type": "string",
                    "description": "Base currency or accounting unit code",
                    "key$": "base"
                  },
                  "quote": {
                    "type": "string",
                    "description": "Quote currency or accounting unit code",
                    "key$": "quote"
                  },
                  "rate": {
                    "type": "number",
                    "description": "Exchange rate value",
                    "exclusiveMinimum": 0,
                    "key$": "rate"
                  },
                  "providers": {
                    "type": "array",
                    "description": "Per-provider rates for this pair. Present only when `expand=providers` is set. Each entry has the provider's observation date and published rate (rebased to the row's base). Entries with `excluded: true` did not contribute to the blended `rate` — either flagged as outliers by the consensus filter, or overridden by a currency peg. A one-day typo in a provider's series is left out, so its entry shows the observation before it. Omitted on synthesized peg rows where no provider published the quote.",
                    "items": {
                      "type": "object",
                      "properties": {
                        "key": {
                          "type": "string",
                          "description": "Provider key"
                        },
                        "date": {
                          "type": "string",
                          "format": "date",
                          "description": "Provider observation date used for this entry"
                        },
                        "rate": {
                          "type": "number",
                          "exclusiveMinimum": 0,
                          "description": "Provider's rate, rebased to the row's base"
                        },
                        "excluded": {
                          "type": "boolean",
                          "description": "Present and true when this entry did not contribute to the blended rate"
                        }
                      },
                      "required": [
                        "key",
                        "date",
                        "rate"
                      ]
                    },
                    "key$": "providers"
                  }
                },
                "required": [
                  "date",
                  "base",
                  "quote",
                  "rate"
                ],
                "x-ref": "#/components/schemas/Rate",
                "index$": 0
              },
              "example": {
                "date": "2026-03-25",
                "base": "EUR",
                "quote": "USD",
                "rate": 1.1568
              }
            }
          }
        },
        "404": {
          "description": "No data found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/NotFound"
        },
        "422": {
          "description": "Invalid request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/UnprocessableEntity"
        },
        "503": {
          "description": "The request deadline expired before the response could be computed, or the worker process is already running its limit of concurrent live daily-range computes (any daily range served live: with providers, with expand=providers, or before the precomputed blend is ready). In the second case a Retry-After header says how many seconds to wait before retrying. Otherwise retry with a narrower request: filter with quotes, aggregate with group, or split the range into shorter requests.",
          "headers": {
            "Retry-After": {
              "description": "Seconds to wait before retrying. Sent when the server is at its limit of concurrent daily range computes.",
              "schema": {
                "type": "integer"
              }
            }
          },
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "x-ref": "#/components/responses/ServiceUnavailable"
        }
      }
    },
    "reachable": true
  }
], 'FRANKFURTER', { server: {  }, secret: process.env.FRANKFURTER_SECRET }, { strict: true, t })
})
