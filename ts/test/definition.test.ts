import { describe, test } from 'node:test'
import { SDK } from '..'
import { runDefinitionPoint } from './definition-runner'
import { isControlSkipped } from './utility'


// Generated from the API definition, not from the model this SDK was built
// from: the route, the declared query parameters, the credential the security
// scheme names, and the definition's own response example.
const PLAN: any[] = [
  {
    "entity": "coverage",
    "accessor": "Coverage",
    "op": "load",
    "method": "GET",
    "path": "/coverage",
    "args": [],
    "select": {
      "base": "USD",
      "provider": "ECB,TCMB",
      "quote": "USD,GBP,JPY"
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [
      "base",
      "quotes",
      "providers"
    ],
    "queryArgs": [
      {
        "name": "base",
        "wire": "base"
      },
      {
        "name": "provider",
        "wire": "providers"
      },
      {
        "name": "quote",
        "wire": "quotes"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": {
      "base": "x",
      "quotes": [
        "x"
      ],
      "providers": [
        "x"
      ],
      "start_date": "2026-01-01",
      "end_date": "2026-01-01"
    },
    "idField": "id"
  },
  {
    "entity": "currency",
    "accessor": "Currency",
    "op": "list",
    "method": "GET",
    "path": "/currencies",
    "args": [],
    "select": {
      "provider": "ECB,TCMB",
      "scope": "v1"
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [
      "scope",
      "providers"
    ],
    "queryArgs": [
      {
        "name": "provider",
        "wire": "providers"
      },
      {
        "name": "scope",
        "wire": "scope"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": [
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
    ],
    "idField": "id"
  },
  {
    "entity": "currency",
    "accessor": "Currency",
    "op": "load",
    "method": "GET",
    "path": "/currency/{code}",
    "args": [
      {
        "name": "id",
        "wire": "code",
        "value": "USD"
      }
    ],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": {
      "iso_code": "USD",
      "iso_numeric": "840",
      "name": "United States Dollar",
      "symbol": "$",
      "providers": [
        "ECB",
        "BOC",
        "FED"
      ]
    },
    "idField": "id"
  },
  {
    "entity": "provider",
    "accessor": "Provider",
    "op": "list",
    "method": "GET",
    "path": "/providers",
    "args": [],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": [
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
    ],
    "idField": "id"
  },
  {
    "entity": "provider",
    "accessor": "Provider",
    "op": "load",
    "method": "GET",
    "path": "/providers/{provider}",
    "args": [
      {
        "name": "id",
        "wire": "provider",
        "value": "ECB"
      }
    ],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": {
      "key": "x",
      "name": "x",
      "country_code": "x",
      "rate_type": "x",
      "pivot_currency": "x",
      "data_url": "x",
      "terms_url": "x",
      "start_date": "2026-01-01",
      "end_date": "2026-01-01",
      "publish_cadence": "daily",
      "frequency": "daily",
      "publishes_missed": 1,
      "currencies": [
        "x"
      ],
      "unknown_currencies": [
        "x"
      ]
    },
    "idField": "id"
  },
  {
    "entity": "rate",
    "accessor": "Rate",
    "op": "list",
    "method": "GET",
    "path": "/providers/{provider}/rates",
    "args": [
      {
        "name": "provider",
        "wire": "provider",
        "value": "ECB"
      }
    ],
    "select": {
      "base": "USD",
      "date": "2024-01-15",
      "expand": "providers",
      "from": "2024-01-01",
      "group": "month",
      "quote": "USD,GBP,JPY",
      "to": "2024-01-31"
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json",
      "application/x-ndjson"
    ],
    "query": [
      "date",
      "from",
      "to",
      "base",
      "quotes",
      "group",
      "expand"
    ],
    "queryArgs": [
      {
        "name": "base",
        "wire": "base"
      },
      {
        "name": "date",
        "wire": "date"
      },
      {
        "name": "expand",
        "wire": "expand"
      },
      {
        "name": "from",
        "wire": "from"
      },
      {
        "name": "group",
        "wire": "group"
      },
      {
        "name": "quote",
        "wire": "quotes"
      },
      {
        "name": "to",
        "wire": "to"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": [
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
    ],
    "idField": "id"
  },
  {
    "entity": "rate",
    "accessor": "Rate",
    "op": "list",
    "method": "GET",
    "path": "/rates",
    "args": [],
    "select": {
      "base": "USD",
      "date": "2024-01-15",
      "expand": "providers",
      "from": "2024-01-01",
      "group": "month",
      "quote": "USD,GBP,JPY",
      "to": "2024-01-31"
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json",
      "application/x-ndjson"
    ],
    "query": [
      "date",
      "from",
      "to",
      "base",
      "quotes",
      "providers",
      "group",
      "expand"
    ],
    "queryArgs": [
      {
        "name": "base",
        "wire": "base"
      },
      {
        "name": "date",
        "wire": "date"
      },
      {
        "name": "expand",
        "wire": "expand"
      },
      {
        "name": "from",
        "wire": "from"
      },
      {
        "name": "group",
        "wire": "group"
      },
      {
        "name": "quote",
        "wire": "quotes"
      },
      {
        "name": "to",
        "wire": "to"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": [
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
    ],
    "idField": "id"
  },
  {
    "entity": "rate",
    "accessor": "Rate",
    "op": "load",
    "method": "GET",
    "path": "/providers/{provider}/rate/{base}/{quote}",
    "args": [
      {
        "name": "base",
        "wire": "base",
        "value": "EUR"
      },
      {
        "name": "provider",
        "wire": "provider",
        "value": "ECB"
      },
      {
        "name": "quote",
        "wire": "quote",
        "value": "USD"
      }
    ],
    "select": {
      "date": "2024-01-15"
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [
      "date"
    ],
    "queryArgs": [
      {
        "name": "date",
        "wire": "date"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": {
      "date": "2026-03-25",
      "base": "EUR",
      "quote": "USD",
      "rate": 1.1568
    },
    "idField": "id"
  },
  {
    "entity": "rate",
    "accessor": "Rate",
    "op": "load",
    "method": "GET",
    "path": "/rate/{base}/{quote}",
    "args": [
      {
        "name": "base",
        "wire": "base",
        "value": "EUR"
      },
      {
        "name": "quote",
        "wire": "quote",
        "value": "USD"
      }
    ],
    "select": {
      "date": "2024-01-15"
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [
      "date",
      "providers"
    ],
    "queryArgs": [
      {
        "name": "date",
        "wire": "date"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": {
      "date": "2026-03-25",
      "base": "EUR",
      "quote": "USD",
      "rate": 1.1568
    },
    "idField": "id"
  }
]


describe('definition', () => {
  for (const point of PLAN) {
    test(point.entity + '.' + point.op + ' ' + point.method + ' ' + point.path, async (t) => {
      const control = isControlSkipped('entityOp', point.entity + '.' + point.op, 'definition')
      if (control.skip) {
        t.skip(control.reason || 'skipped via sdk-test-control.json')
        return
      }
      await runDefinitionPoint(SDK, point)
    })
  }
})
