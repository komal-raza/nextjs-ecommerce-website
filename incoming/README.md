# Importing listings

1. `cp incoming/listings-template.csv incoming/listings.csv` and replace the example rows (one row per product).
2. Drop photos into `incoming/images/`.
3. Run `npm run import-listings`.

The script regenerates `lib/generated-products.ts` from scratch on every run (safe to re-run) and writes optimized
JPEGs (max 1400px) to `public/images/products/`. Imported products are merged with the demo catalogue; see
`PRODUCTS` in `lib/data.ts` to switch to imported-only.

## Columns (in this order)

| Column | Required | Notes |
| --- | --- | --- |
| `name` | yes | Also used to generate the product id (slug; `-2` suffix on collision) |
| `category` | yes | `women` or `men` |
| `subcategory` | yes | e.g. `Dresses`, `Shirts`. Filter pills are derived from what exists |
| `price` | yes | Number, e.g. `89` or `89.50` |
| `compareAtPrice` | no | Original price — shows a strikethrough and Sale badge |
| `description` | no | Quote it if it contains commas |
| `sizes` | no | `|`-separated, e.g. `S|M|L`. Default `XS,S,M,L,XL` |
| `image1` | yes | Filename inside `incoming/images/` |
| `image2` | no | Hover image; falls back to `image1` |
| `featured` / `isNew` / `trending` | no | `yes` / `no` (default `no`) |

Invalid rows are skipped with a clear error. A missing image file falls back to a neutral placeholder with a warning.
Image optimization uses macOS `sips`; on other systems images are copied unoptimized.

