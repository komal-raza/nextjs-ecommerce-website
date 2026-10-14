#!/usr/bin/env node
/**
 * Listings importer — dependency-free.
 *
 *   cp incoming/listings-template.csv incoming/listings.csv   (fill it in)
 *   drop photos into incoming/images/
 *   npm run import-listings
 *
 * Reads incoming/listings.csv, validates rows, optimizes images into
 * public/images/products/<id>-1.jpg / -2.jpg (macOS `sips`, max 1400px JPEG;
 * falls back to a plain copy with a warning where `sips` is unavailable) and
 * regenerates lib/generated-products.ts wholesale — idempotent, safe to re-run.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSV_PATH = path.join(ROOT, "incoming/listings.csv");
const IMAGES_IN = path.join(ROOT, "incoming/images");
const IMAGES_OUT = path.join(ROOT, "public/images/products");
const OUT_TS = path.join(ROOT, "lib/generated-products.ts");
const PLACEHOLDER = "/images/placeholder.svg";
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];
const COLUMNS = ["name", "category", "subcategory", "price", "compareAtPrice", "description", "sizes", "image1", "image2", "featured", "isNew", "trending"];

let hasSips = true;
try { execFileSync("sips", ["--version"], { stdio: "ignore" }); } catch { hasSips = false; }

/** Quote-aware CSV parser (handles "", commas and newlines inside quotes, BOM, CRLF). */
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const yes = (v) => ["yes", "y", "true", "1"].includes(String(v ?? "").trim().toLowerCase());
const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function optimizeImage(file, outName, label) {
  if (!file) return null;
  const src = path.join(IMAGES_IN, file);
  if (!existsSync(src)) {
    console.warn(`  ⚠ ${label}: image "${file}" not found in incoming/images/ — using placeholder`);
    return null;
  }
  const dest = path.join(IMAGES_OUT, outName);
  if (hasSips) {
    try {
      execFileSync("sips", ["-s", "format", "jpeg", "-Z", "1400", src, "--out", dest], { stdio: "ignore" });
      return `/images/products/${outName}`;
    } catch {
      console.warn(`  ⚠ ${label}: sips failed on "${file}" — copying unoptimized`);
    }
  } else {
    console.warn(`  ⚠ ${label}: \`sips\` not available on this system — copying "${file}" unoptimized`);
  }
  copyFileSync(src, dest);
  return `/images/products/${outName}`;
}

function main() {
  // Always clear previously generated product images so the output is exactly this run.
  rmSync(IMAGES_OUT, { recursive: true, force: true });
  mkdirSync(IMAGES_OUT, { recursive: true });

  let products = [];
  if (!existsSync(CSV_PATH)) {
    console.log("No incoming/listings.csv found — emitting an empty generated catalogue.");
  } else {
    const rows = parseCsv(readFileSync(CSV_PATH, "utf8"));
    const header = rows.shift()?.map((h) => h.trim()) ?? [];
    const missingCols = COLUMNS.filter((c) => !header.includes(c));
    if (missingCols.length) {
      console.error(`✖ listings.csv is missing column(s): ${missingCols.join(", ")}`);
      process.exit(1);
    }
    const used = new Set();
    let skipped = 0;

    rows.forEach((cells, idx) => {
      const line = idx + 2; // 1-based, + header
      const r = Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? "").trim()]));
      const errors = [];
      for (const k of ["name", "category", "price", "subcategory", "image1"]) if (!r[k]) errors.push(`"${k}" is required`);
      const category = r.category.toLowerCase();
      if (r.category && !["women", "men"].includes(category)) errors.push(`category must be "women" or "men" (got "${r.category}")`);
      const price = Number(r.price);
      if (r.price && (!Number.isFinite(price) || price <= 0)) errors.push(`price must be a positive number (got "${r.price}")`);
      const compare = r.compareAtPrice ? Number(r.compareAtPrice) : undefined;
      if (r.compareAtPrice && !Number.isFinite(compare)) errors.push(`compareAtPrice must be a number (got "${r.compareAtPrice}")`);
      if (errors.length) {
        skipped++;
        console.error(`✖ Row ${line}${r.name ? ` ("${r.name}")` : ""} skipped: ${errors.join("; ")}`);
        return;
      }

      let id = slugify(r.name) || `product-${line}`;
      if (used.has(id)) { let n = 2; while (used.has(`${id}-${n}`)) n++; id = `${id}-${n}`; }
      used.add(id);

      console.log(`• ${id}`);
      const img1 = optimizeImage(r.image1, `${id}-1.jpg`, id) ?? PLACEHOLDER;
      const img2 = (r.image2 ? optimizeImage(r.image2, `${id}-2.jpg`, id) : null) ?? img1;
      const sizes = r.sizes ? r.sizes.split("|").map((s) => s.trim()).filter(Boolean) : DEFAULT_SIZES;

      const product = {
        id, name: r.name, category, subcategory: r.subcategory, price,
        ...(compare ? { compareAtPrice: compare } : {}),
        description: r.description, sizes: sizes.length ? sizes : DEFAULT_SIZES,
        images: [img1, img2],
        ...(yes(r.featured) ? { featured: true } : {}),
        ...(yes(r.isNew) ? { isNew: true } : {}),
        ...(yes(r.trending) ? { trending: true } : {}),
      };
      products.push(product);
    });
    console.log(`\nImported ${products.length} product(s)${skipped ? `, skipped ${skipped}` : ""}.`);
  }

  writeFileSync(
    OUT_TS,
    `// AUTO-GENERATED by scripts/import-listings.mjs — do not edit by hand.\n` +
      `import type { Product } from "./data";\n\n` +
      `export const GENERATED_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};\n`,
  );
  console.log(`Wrote ${path.relative(ROOT, OUT_TS)}`);
}

main();

