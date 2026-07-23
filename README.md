# Blueprint CDS — diamonds stress fixtures

- `diamonds-stress-500k.json` — top-level array of 500,000 options (Git LFS)
- `shape-*.png` — images referenced by each row

## Ingest URL

Use the **LFS media** URL (`raw.githubusercontent.com` only returns a pointer file):

https://media.githubusercontent.com/media/JonPurvis/diamonds/m/diamonds-stress-500k.json

## Schema

`sku`, `title`, `carat`, `shape`, `colour`, `clarity`, `cut`, `price`, `image`

## Price

Linear carat map: **0.30ct = £100** → **30.29ct = £5000**.
