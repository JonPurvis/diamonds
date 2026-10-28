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
const CDN_MANIFEST = resolve(ROOT, 'sandwich-salad-cdn-urls.json');
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
function hashSlug(slug) {
  let hash = 0;

  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }

  return hash;
}

/**
 * @param {number} h 0–360
 * @param {number} s 0–100
 * @param {number} l 0–100
 */
function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const chroma = sat * Math.min(light, 1 - light);

  const channel = (n) => {
    const k = (n + h / 30) % 12;
    const raw = light - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    return Math.round(255 * raw).toString(16).padStart(2, '0');
  };

  return `${channel(0)}${channel(8)}${channel(4)}`;
}

/** Dark, readable backgrounds — hue/sat/light all derived from the slug. */
function bgHexFromSlug(slug) {
  const hash = hashSlug(slug);
  const hue = Math.floor((hash * 137.508) % 360);
  const sat = 52 + ((hash >> 8) % 38);
  const light = 30 + ((hash >> 16) % 22);

  return hslToHex(hue, sat, light);
}

function loadCdnUrlsByValue() {
  try {
    const parsed = JSON.parse(readFileSync(CDN_MANIFEST, 'utf8'));
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Labelled placehold.co URL until mirrored to Shopify CDN (see blueprint:mirror-csv-option-images-to-cdn).
 *
 * @param {string} name
 * @param {Record<string, string>} cdnByValue
 */
function imageUrl(name, cdnByValue) {
  const cdn = cdnByValue[name];
  if (typeof cdn === 'string' && cdn.includes('cdn.shopify.com') === true) {
    return cdn;
  }

  const slug = slugForSeed(name);
  const bg = bgHexFromSlug(slug);
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
  const cdnByValue = loadCdnUrlsByValue();
  const lines = ['value,active,tag_orders,additional_price,image_url'];

  for (const name of names) {
    lines.push([
      csvEscape(name),
      '1',
      '0',
      '0',
      csvEscape(imageUrl(name, cdnByValue)),
    ].join(','));
  }

  writeFileSync(OUT, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${names.length} rows to ${OUT}`);
}

main();
