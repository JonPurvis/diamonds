# Blueprint CDS — diamonds stress fixtures

Shared shape images (`shape-*.png`) plus three fixture sizes for connected-data-source ingest.

## Ingest URLs

| File | Options | URL |
|------|--------:|-----|
| `5000.json` | 5,000 | https://raw.githubusercontent.com/JonPurvis/diamonds/main/5000.json |
| `50000.json` | 50,000 | https://raw.githubusercontent.com/JonPurvis/diamonds/main/50000.json |
| `500000.json` | 500,000 | https://media.githubusercontent.com/media/JonPurvis/diamonds/main/500000.json |

`500000.json` is stored with Git LFS — use the **media** URL above. `raw.githubusercontent.com` only returns an LFS pointer for that file.

## Schema

Top-level JSON array. Each row:

`sku`, `title`, `carat`, `shape`, `colour`, `clarity`, `cut`, `price`, `image`

## Filters

- **carat** — `0.30` … `30.29` (0.01 steps, cycling)
- **shape** — Round, Princess, Cushion, Oval, Emerald, Pear, Marquise, Radiant, Asscher, Heart
- **colour** — D … K
- **clarity** — FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2
- **cut** — Good, Very Good, Excellent, Cupid's Ideal

## Price

Linear carat map: **0.30ct = £100** → **30.29ct = £5000**.
