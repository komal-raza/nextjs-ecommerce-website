I am providing my own product images and a listings CSV for my VELOUR fashion eCommerce site (Next.js + TypeScript, App Router). Wire them into the website as real products through the project's existing listings pipeline — do not rebuild or redesign anything.

THE PIPELINE (already built into this project — read `incoming/README.md` for the full rules):
- `incoming/listings.csv` — one row per product, columns in order: name, category, subcategory, price, compareAtPrice, description, sizes, image1, image2, featured, isNew, trending.
- `incoming/images/` — flat folder of product photos referenced by the CSV; filenames must match the CSV exactly (case-sensitive).
- `npm run import-listings` — validates the CSV, optimizes images into `public/images/products/`, and regenerates `lib/generated-products.ts`, which `lib/data.ts` merges into the catalogue. Never edit `lib/generated-products.ts` by hand.

WHAT TO DO:
1. Locate the assets and CSV I provided — they may be anywhere in the working directory, possibly nested in subfolders. Restructure them into the pipeline layout: the CSV goes to `incoming/listings.csv` and every image goes flat into `incoming/images/`. If `incoming/listings.csv` already contains rows from a previous import, merge my new rows in (keep the existing ones) unless I explicitly say to replace the file.
2. Reconcile the CSV with the actual files:
   - Normalize the CSV to the exact column set above. Keep my product names, prices, and descriptions as provided; fill defaults only where fields are empty (sizes → XS-XL default, i.e. leave empty; flags → no).
   - Every `image1`/`image2` value must point at a real file in `incoming/images/`. Fix mismatches by renaming files to match the CSV. If a product has only one image, leave `image2` empty (the pipeline falls back to `image1`).
   - If something is unresolvable (CSV row with no image anywhere, duplicate product), tell me in the final report instead of silently dropping it.
3. Run `npm run import-listings`. If rows are skipped or images are reported missing, fix the cause and re-run until the import is clean.
4. Switch the site to real products only: in `lib/data.ts`, set the exported `PRODUCTS` to `GENERATED_PRODUCTS` (there is a comment at that exact line documenting the change — keep the demo `BASE_PRODUCTS` array in place, just disconnected). After this, only my products should appear anywhere on the site — listings, search, homepage rails, and the subcategory filter pills (which derive from the active catalogue, so empty pills must not appear).
5. Verify before finishing:
   - `npm run build` succeeds with no type errors.
   - Start the production server on a free port and confirm HTTP 200 for `/`, `/women`, `/men`, `/search?q=<one product name>`, `/product/<one new slug>`, and one new file under `/images/products/`. Stop the server afterward.
   - If headless Chrome is available (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`), take a screenshot of the homepage and one listing page; confirm only my products render, with their images, and the homepage featured/new/trending rails are populated from my flags. Delete the screenshots afterward.
6. Report: products added (name, slug, price, flags), anything renamed or fixed, any rows skipped, and anything that needs my attention.

GUARDRAILS: the only things that may change are the `incoming/` folder, `public/images/products/`, `lib/generated-products.ts` (via the script), and the single documented `PRODUCTS` line in `lib/data.ts`. Do not touch any other site code, styles, or the demo data itself.
