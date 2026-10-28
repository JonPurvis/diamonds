#!/usr/bin/env node
/**
 * Blueprint option-values CSV — ~300 sandwich veg toppings (bulk CSV import).
 *
 * Edit ../sandwich-salad-vegetables.txt (one name per line), then:
 *   node scripts/generate-sandwich-salad-options.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'sandwich-salad-options.csv');
const NAMES_FILE = resolve(ROOT, 'sandwich-salad-vegetables.txt');
const TARGET_ROWS = 300;

/** @param {string} value */
function csvEscape(value) {
  if (/[",\n\r]/.test(value) === true) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/** @param {string} name */
function slugForSeed(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** @param {string} slug */
function hueFromSlug(slug) {
  let hash = 0;

  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }

  const hue = hash % 360;

  return hue;
}

/**
 * Picsum "seeds" only pick a fixed stock photo — the slug does not affect subject matter.
 * Labelled 1000×1000 placeholders keep each URL unique and show the option name in QA.
 *
 * @param {string} name */
function imageUrl(name) {
  const slug = slugForSeed(name);
  const hue = hueFromSlug(slug);
  const bg = `hsl(${hue}%2045%25%2032%25)`;
  const text = encodeURIComponent(name);

  return `https://placehold.co/1000x1000/${bg}/ffffff/png?text=${text}`;
}

function loadNames() {
  const raw = readFileSync(NAMES_FILE, 'utf8');
  const names = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  /** @type {string[]} */
  const unique = [];
  /** @type {Set<string>} */
  const seen = new Set();

  for (const name of names) {
    const key = name.toLowerCase();

    if (seen.has(key) === true) {
      continue;
    }

    seen.add(key);
    unique.push(name);
  }

  if (unique.length !== TARGET_ROWS) {
    throw new Error(`Expected ${TARGET_ROWS} unique lines in sandwich-salad-vegetables.txt, got ${unique.length}.`);
  }

  return unique;
}

function main() {
  const names = loadNames();
  const lines = ['value,active,tag_orders,additional_price,image_url'];

  for (const name of names) {
    lines.push([
      csvEscape(name),
      '1',
      '0',
      '0',
      csvEscape(imageUrl(name)),
    ].join(','));
  }

  writeFileSync(OUT, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${names.length} rows to ${OUT}`);
}

main();
