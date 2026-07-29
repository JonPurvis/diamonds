# Blueprint CDS — diamonds stress fixtures

JSON option feeds for connected-data-source ingest stress tests.

| File | Rows | Notes |
|------|------|--------|
| `5000.json` | 5,000 | Small / quick |
| `50000.json` | 50,000 | Medium |
| `500000.json` | 500,000 | Large (Git LFS) |
| `1000000.json` | 1,000,000 | Large (Git LFS) |
| `5000000.json` | 5,000,000 | Large (Git LFS); SKUs unique |

Schema (every row): `sku`, `title`, `carat`, `shape`, `colour`, `clarity`, `cut`, `price`, `image`.

**Carat ladder:** `"0.3"` … `"30.0"` in **0.1** steps → **298** distinct values (not 0.01 / ~3000). Other facets stay low-cardinality (~10 / 8 / 8 / 4). Attribute tuples may repeat across rows; `connected_option_attribute_raw_values` stores one row per distinct value with `occurrence_count`.

## Regenerate

```bash
node scripts/generate.mjs --count 5000 --out 5000.json
node scripts/generate.mjs --count 50000 --out 50000.json
node scripts/generate.mjs --count 500000 --out 500000.json
node scripts/generate.mjs --count 1000000 --out 1000000.json
node scripts/generate.mjs --count 5000000 --out 5000000.json
```

Large files use Git LFS (see `.gitattributes`).

## Ingest URLs

- 5k: https://raw.githubusercontent.com/JonPurvis/diamonds/main/5000.json
- 50k: https://raw.githubusercontent.com/JonPurvis/diamonds/main/50000.json
- 500k: https://media.githubusercontent.com/media/JonPurvis/diamonds/main/500000.json
- 1M: https://media.githubusercontent.com/media/JonPurvis/diamonds/main/1000000.json
- 5M: https://media.githubusercontent.com/media/JonPurvis/diamonds/main/5000000.json
