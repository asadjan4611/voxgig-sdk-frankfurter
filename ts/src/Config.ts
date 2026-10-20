
import { BaseFeature } from './feature/base/BaseFeature'
import { TestFeature } from './feature/test/TestFeature'



const FEATURE_CLASS: Record<string, typeof BaseFeature> = {
   test: TestFeature,

}


const FEATURE_PLUGINS: Record<string, any[]> = {
  
}


class Config {

  makeFeature(this: any, fn: string) {
    const fc = FEATURE_CLASS[fn]
    const fi = new fc()
    return fi
  }

  // False for a feature added at runtime via options.extend (station's
  // adopt path) - the constructor uses this to skip makeFeature for names
  // no generated class backs.
  hasFeature(this: any, fn: string) {
    return null != FEATURE_CLASS[fn]
  }


  main = {
    name: 'Frankfurter',
        slug: "frankfurter",
    version: "0.0.1",
    target: "ts",

  }


  feature = {
     test:     {
      "options": {
        "active": false
      },
      "optspec": {
        "entity": "`$MAP`",
        "net": "`$MAP`"
      },
      "strict": false,
      "transport": "base"
    },

  }


  options = {
    base: "https://api.frankfurter.dev/v2",

    headers: {
      "content-type": "application/json"
    },

    entity: {
      
        coverage: {
        },
  
        currency: {
        },
  
        provider: {
        },
  
        rate: {
        },
  
    }
  }


  entity = {
    "coverage": {
      "fields": [
        {
          "name": "base",
          "title": "Base",
          "type": "`$STRING`",
          "req": true,
          "short": "Requested base currency, EUR by default"
        },
        {
          "name": "end_date",
          "title": "End Date",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "req": true,
          "short": "Last eligible observation date with a nonempty matching rates query",
          "format": "date"
        },
        {
          "name": "providers",
          "title": "Providers",
          "type": [
            "`$ONE`",
            [
              "`$ARRAY`",
              "`$NULL`"
            ]
          ],
          "req": true,
          "short": "Selected providers, or null for the default daily blend"
        },
        {
          "name": "quotes",
          "title": "Quotes",
          "type": [
            "`$ONE`",
            [
              "`$ARRAY`",
              "`$NULL`"
            ]
          ],
          "req": true,
          "short": "Requested quotes, or null for all"
        },
        {
          "name": "start_date",
          "title": "Start Date",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "req": true,
          "short": "First eligible observation date with a nonempty matching rates query",
          "format": "date"
        }
      ],
      "name": "coverage",
      "op": {
        "load": {
          "input": "data",
          "name": "load",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/coverage",
              "segments": [
                {
                  "lit": "coverage"
                }
              ],
              "parts": [
                "coverage"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "query": [
                  {
                    "name": "base",
                    "orig": "base",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "USD",
                    "field": true
                  },
                  {
                    "name": "provider",
                    "orig": "providers",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "ECB,TCMB"
                  },
                  {
                    "name": "quote",
                    "orig": "quotes",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "USD,GBP,JPY"
                  }
                ]
              },
              "select": {},
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    },
    "currency": {
      "fields": [
        {
          "name": "end_date",
          "title": "End Date",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Latest publication coverage date; use /coverage for queryable pairs",
          "format": "date"
        },
        {
          "name": "id",
          "title": "Id",
          "type": "`$STRING`"
        },
        {
          "name": "iso_code",
          "title": "Iso Code",
          "type": "`$STRING`",
          "req": true,
          "short": "Currency or accounting unit code"
        },
        {
          "name": "iso_numeric",
          "title": "Iso Numeric",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "ISO 4217 numeric code"
        },
        {
          "name": "name",
          "title": "Name",
          "type": "`$STRING`",
          "req": true,
          "short": "Full currency name"
        },
        {
          "name": "peg",
          "title": "Peg",
          "type": "`$OBJECT`",
          "short": "Peg metadata, present only for pegged currencies"
        },
        {
          "name": "providers",
          "title": "Providers",
          "type": "`$ARRAY`",
          "short": "Provider keys that publish this currency"
        },
        {
          "name": "start_date",
          "title": "Start Date",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Earliest publication coverage date; use /coverage for queryable pairs",
          "format": "date"
        },
        {
          "name": "symbol",
          "title": "Symbol",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Currency symbol"
        }
      ],
      "id": {
        "field": "id",
        "name": "id"
      },
      "name": "currency",
      "op": {
        "list": {
          "input": "data",
          "name": "list",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/currencies",
              "segments": [
                {
                  "lit": "currencies"
                }
              ],
              "parts": [
                "currencies"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "query": [
                  {
                    "name": "provider",
                    "orig": "providers",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "ECB,TCMB"
                  },
                  {
                    "name": "scope",
                    "orig": "scope",
                    "type": "`$STRING`",
                    "kind": "query"
                  }
                ]
              },
              "select": {},
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        },
        "load": {
          "input": "data",
          "name": "load",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/currency/{code}",
              "segments": [
                {
                  "lit": "currency"
                },
                {
                  "var": "id"
                }
              ],
              "parts": [
                "currency",
                "{id}"
              ],
              "rename": {
                "param": {
                  "code": "id"
                }
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "params": [
                  {
                    "name": "id",
                    "orig": "code",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true,
                    "example": "USD"
                  }
                ]
              },
              "select": {
                "exist": [
                  "id"
                ]
              },
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    },
    "provider": {
      "fields": [
        {
          "name": "country_code",
          "title": "Country Code",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "ISO 3166-1 alpha-2 country code"
        },
        {
          "name": "currencies",
          "title": "Currencies",
          "type": "`$ARRAY`",
          "req": true,
          "short": "Recognised currency codes within their valid date ranges covered by this provider"
        },
        {
          "name": "data_url",
          "title": "Data Url",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Link to the data source",
          "format": "uri"
        },
        {
          "name": "end_date",
          "title": "End Date",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Latest publication coverage date; use /coverage for queryable pairs",
          "format": "date"
        },
        {
          "name": "frequency",
          "title": "Frequency",
          "type": "`$STRING`",
          "short": "The period each observation stands for, after SDMX FREQ."
        },
        {
          "name": "id",
          "title": "Id",
          "type": "`$STRING`"
        },
        {
          "name": "key",
          "title": "Key",
          "type": "`$STRING`",
          "req": true,
          "short": "Provider identifier"
        },
        {
          "name": "name",
          "title": "Name",
          "type": "`$STRING`",
          "req": true,
          "short": "Full provider name"
        },
        {
          "name": "pivot_currency",
          "title": "Pivot Currency",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Base currency for published rates"
        },
        {
          "name": "publish_cadence",
          "title": "Publish Cadence",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "How often the provider publishes rates."
        },
        {
          "name": "publishes_missed",
          "title": "Publishes Missed",
          "type": [
            "`$ONE`",
            [
              "`$INTEGER`",
              "`$NULL`"
            ]
          ],
          "short": "Number of expected publishes missed since end_date, in units of publish_cadence."
        },
        {
          "name": "rate_type",
          "title": "Rate Type",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Official rate type as used by the source"
        },
        {
          "name": "start_date",
          "title": "Start Date",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Earliest publication coverage date; use /coverage for queryable pairs",
          "format": "date"
        },
        {
          "name": "terms_url",
          "title": "Terms Url",
          "type": [
            "`$ONE`",
            [
              "`$STRING`",
              "`$NULL`"
            ]
          ],
          "short": "Link to terms of use",
          "format": "uri"
        },
        {
          "name": "unknown_currencies",
          "title": "Unknown Currencies",
          "type": "`$ARRAY`",
          "short": "Unreviewed published codes absent from the currency registry."
        }
      ],
      "id": {
        "field": "id",
        "name": "id"
      },
      "name": "provider",
      "op": {
        "list": {
          "input": "data",
          "name": "list",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/providers",
              "segments": [
                {
                  "lit": "providers"
                }
              ],
              "parts": [
                "providers"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {},
              "select": {},
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        },
        "load": {
          "input": "data",
          "name": "load",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/providers/{provider}",
              "segments": [
                {
                  "lit": "providers"
                },
                {
                  "var": "id"
                }
              ],
              "parts": [
                "providers",
                "{id}"
              ],
              "rename": {
                "param": {
                  "provider": "id"
                }
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "params": [
                  {
                    "name": "id",
                    "orig": "provider",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true,
                    "example": "ECB"
                  }
                ]
              },
              "select": {
                "exist": [
                  "id"
                ]
              },
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    },
    "rate": {
      "fields": [
        {
          "name": "base",
          "title": "Base",
          "type": "`$STRING`",
          "req": true,
          "short": "Base currency or accounting unit code"
        },
        {
          "name": "date",
          "title": "Date",
          "type": "`$STRING`",
          "req": true,
          "short": "The date of the rate",
          "format": "date"
        },
        {
          "name": "id",
          "title": "Id",
          "type": "`$STRING`"
        },
        {
          "name": "providers",
          "title": "Providers",
          "type": "`$ARRAY`",
          "short": "Per-provider rates for this pair."
        },
        {
          "name": "quote",
          "title": "Quote",
          "type": "`$STRING`",
          "req": true,
          "short": "Quote currency or accounting unit code"
        },
        {
          "name": "rate",
          "title": "Rate",
          "type": "`$NUMBER`",
          "req": true,
          "short": "Exchange rate value"
        }
      ],
      "id": {
        "field": "id",
        "from": {
          "base": "base",
          "quote": "quote"
        },
        "name": "id",
        "parts": [
          "base",
          "quote"
        ],
        "sep": "/"
      },
      "name": "rate",
      "op": {
        "list": {
          "input": "data",
          "name": "list",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/providers/{provider}/rates",
              "segments": [
                {
                  "lit": "providers"
                },
                {
                  "var": "provider"
                },
                {
                  "lit": "rates"
                }
              ],
              "parts": [
                "providers",
                "{provider}",
                "rates"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "params": [
                  {
                    "name": "provider",
                    "orig": "provider",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true,
                    "example": "ECB"
                  }
                ],
                "query": [
                  {
                    "name": "base",
                    "orig": "base",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "USD",
                    "field": true
                  },
                  {
                    "name": "date",
                    "orig": "date",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "2024-01-15",
                    "field": true
                  },
                  {
                    "name": "expand",
                    "orig": "expand",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "providers"
                  },
                  {
                    "name": "from",
                    "orig": "from",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "2024-01-01"
                  },
                  {
                    "name": "group",
                    "orig": "group",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "month"
                  },
                  {
                    "name": "quote",
                    "orig": "quotes",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "USD,GBP,JPY",
                    "field": true
                  },
                  {
                    "name": "to",
                    "orig": "to",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "2024-01-31"
                  }
                ]
              },
              "select": {
                "exist": [
                  "provider"
                ]
              },
              "response": {
                "alternatives": [
                  {
                    "binary": true,
                    "kind": "raw",
                    "media": "application/x-ndjson"
                  }
                ],
                "kind": "json",
                "media": "application/json"
              }
            },
            {
              "kind": "http",
              "method": "GET",
              "orig": "/rates",
              "segments": [
                {
                  "lit": "rates"
                }
              ],
              "parts": [
                "rates"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "query": [
                  {
                    "name": "base",
                    "orig": "base",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "USD",
                    "field": true
                  },
                  {
                    "name": "date",
                    "orig": "date",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "2024-01-15",
                    "field": true
                  },
                  {
                    "name": "expand",
                    "orig": "expand",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "providers"
                  },
                  {
                    "name": "from",
                    "orig": "from",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "2024-01-01"
                  },
                  {
                    "name": "group",
                    "orig": "group",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "month"
                  },
                  {
                    "name": "provider",
                    "orig": "providers",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "ECB,TCMB"
                  },
                  {
                    "name": "quote",
                    "orig": "quotes",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "USD,GBP,JPY",
                    "field": true
                  },
                  {
                    "name": "to",
                    "orig": "to",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "2024-01-31"
                  }
                ]
              },
              "select": {},
              "response": {
                "alternatives": [
                  {
                    "binary": true,
                    "kind": "raw",
                    "media": "application/x-ndjson"
                  }
                ],
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        },
        "load": {
          "input": "data",
          "name": "load",
          "points": [
            {
              "kind": "http",
              "method": "GET",
              "orig": "/providers/{provider}/rate/{base}/{quote}",
              "segments": [
                {
                  "lit": "providers"
                },
                {
                  "var": "provider"
                },
                {
                  "lit": "rate"
                },
                {
                  "var": "base"
                },
                {
                  "var": "quote"
                }
              ],
              "parts": [
                "providers",
                "{provider}",
                "rate",
                "{base}",
                "{quote}"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "params": [
                  {
                    "name": "base",
                    "orig": "base",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true,
                    "example": "EUR"
                  },
                  {
                    "name": "provider",
                    "orig": "provider",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true,
                    "example": "ECB"
                  },
                  {
                    "name": "quote",
                    "orig": "quote",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true,
                    "example": "USD"
                  }
                ],
                "query": [
                  {
                    "name": "date",
                    "orig": "date",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "2024-01-15",
                    "field": true
                  }
                ]
              },
              "select": {
                "exist": [
                  "base",
                  "provider",
                  "quote"
                ]
              },
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            },
            {
              "kind": "http",
              "method": "GET",
              "orig": "/rate/{base}/{quote}",
              "segments": [
                {
                  "lit": "rate"
                },
                {
                  "var": "base"
                },
                {
                  "var": "quote"
                }
              ],
              "parts": [
                "rate",
                "{base}",
                "{quote}"
              ],
              "rename": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              },
              "args": {
                "params": [
                  {
                    "name": "base",
                    "orig": "base",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true,
                    "example": "EUR"
                  },
                  {
                    "name": "quote",
                    "orig": "quote",
                    "type": "`$STRING`",
                    "kind": "param",
                    "reqd": true,
                    "example": "USD"
                  }
                ],
                "query": [
                  {
                    "name": "date",
                    "orig": "date",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "2024-01-15",
                    "field": true
                  },
                  {
                    "name": "provider",
                    "orig": "providers",
                    "type": "`$STRING`",
                    "kind": "query",
                    "example": "ECB,TCMB"
                  }
                ]
              },
              "select": {
                "exist": [
                  "base",
                  "quote"
                ]
              },
              "response": {
                "kind": "json",
                "media": "application/json"
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": [
          [
            "$.main.kit.entity.provider"
          ],
          [
            "$.main.kit.entity.provider"
          ]
        ]
      }
    }
  }
}


const config = new Config()

export {
  config,
  FEATURE_PLUGINS,
}

