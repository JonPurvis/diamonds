# Blueprint CDS — diamonds stress fixtures

JSON option feeds for connected-data-source ingest stress tests.

| File | Rows | Notes |
|------|------|--------|
| `5000.json` | 5,000 | Small / quick |
| `50000.json` | 50,000 | Medium |
| `500000.json` | 500,000 | Large (Git LFS) |
| `1000000.json` | 1,000,000 | Large (Git LFS) |
| `5000000.json` | 5,000,000 | Large (Git LFS); **5M unique** `(shape, colour, clarity, cut, carat)` tuples; SKUs unique |

Schema (every row): `sku`, `title`, `carat`, `shape`, `colour`, `clarity`, `cut`, `price`, `image`.

Filter cardinalities on the 5M file stay bounded (~10 / 8 / 8 / 4 / ~2k) so raw-value rebuild and filter seeding stay realistic. Repeated carat strings across options are expected — `connected_option_attribute_raw_values` stores one row per distinct value with `occurrence_count`.

## Ingest URLs

- 5k: https://raw.githubusercontent.com/JonPurvis/diamonds/main/5000.json
- 50k: https://raw.githubusercontent.com/JonPurvis/diamonds/main/50000.json
- 500k: https://media.githubusercontent.com/media/JonPurvis/diamonds/main/500000.json
- 1M: https://media.githubusercontent.com/media/JonPurvis/diamonds/main/1000000.json
- 5M: https://media.githubusercontent.com/media/JonPurvis/diamonds/main/5000000.json
