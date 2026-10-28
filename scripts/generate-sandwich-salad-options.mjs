#!/usr/bin/env node
/**
 * Blueprint option-values CSV for local image stress tests (bulk CSV import).
 *
 * Usage: node scripts/generate-sandwich-salad-options.mjs
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'sandwich-salad-options.csv');
const TARGET_ROWS = 298;

const SEED_NAMES = [
  'Lettuce',
  'Tomatoes',
  'Cucumber',
  'Red Onion',
  'Green Peppers',
  'Sweetcorn',
  'Olives',
  'Carrots',
];

const GREENS = [
  'Romaine', 'Iceberg', 'Spinach', 'Kale', 'Arugula', 'Mixed Greens', 'Radicchio',
  'Frisée', 'Butter Lettuce', 'Little Gem', 'Watercress', 'Endive', 'Chard', 'Bok Choy',
];

const VEG = [
  'Cherry Tomatoes', 'Beefsteak Tomato', 'Sun-Dried Tomatoes', 'Avocado', 'Red Cabbage',
  'Shredded Cabbage', 'Coleslaw Mix', 'Beetroot', 'Radish', 'Spring Onion', 'Scallions',
  'White Onion', 'Pickled Onion', 'Caramelised Onion', 'Jalapeños', 'Banana Peppers',
  'Roasted Peppers', 'Artichoke Hearts', 'Mushrooms', 'Celery', 'Broccoli Florets',
  'Cauliflower', 'Edamame', 'Peas', 'Green Beans', 'Asparagus Tips', 'Zucchini',
  'Aubergine', 'Fennel', 'Parsnip', 'Turnip', 'Swede', 'Leeks', 'Garlic Crisps',
];

const PROTEINS = [
  'Grilled Chicken', 'Crispy Chicken', 'Turkey Breast', 'Ham', 'Roast Beef', 'Pastrami',
  'Salami', 'Pepperoni', 'Prosciutto', 'Bacon', 'Smoked Salmon', 'Tuna', 'Egg',
  'Boiled Egg', 'Falafel', 'Tofu', 'Halloumi', 'Mozzarella', 'Feta', 'Cheddar',
  'Swiss Cheese', 'Blue Cheese', 'Goat Cheese', 'Parmesan Shavings', 'Black Beans',
  'Chickpeas', 'Lentils', 'Pulled Pork', 'Meatballs', 'Anchovies',
];

const CRUNCH = [
  'Croutons', 'Pita Chips', 'Tortilla Strips', 'Sesame Seeds', 'Sunflower Seeds',
  'Pumpkin Seeds', 'Almonds', 'Walnuts', 'Pecans', 'Cashews', 'Pine Nuts',
  'Chow Mein Noodles', 'Wonton Strips', 'Pretzel Crunch', 'Granola', 'Corn Nuts',
];

const DRESSINGS = [
  'Ranch Drizzle', 'Caesar Dressing', 'Balsamic Glaze', 'Italian Dressing',
  'Honey Mustard', 'Blue Cheese Dressing', 'Thousand Island', 'French Dressing',
  'Lemon Vinaigrette', 'Red Wine Vinaigrette', 'Tahini Dressing', 'Yogurt Ranch',
  'Sriracha Mayo', 'Chipotle Mayo', 'Garlic Aioli', 'Pesto Drizzle',
];

const EXTRAS = [
  'Capers', 'Pickles', 'Gherkins', 'Kimchi', 'Sauerkraut', 'Hummus', 'Guacamole',
  'Salsa', 'Pico de Gallo', 'Chutney', 'Apple Slices', 'Dried Cranberries',
  'Raisins', 'Fresh Herbs', 'Basil', 'Cilantro', 'Dill', 'Mint', 'Chives',
  'Parsley', 'Microgreens', 'Sprouts', 'Quinoa', 'Couscous', 'Wild Rice',
  'Orzo', 'Pasta Salad', 'Macaroni', 'Potato Salad', 'Beet Slaw', 'Apple Slaw',
];

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

/** @param {string} name */
function imageUrl(name) {
  const slug = slugForSeed(name);
  return `https://picsum.photos/seed/sandwich-salad-${slug}/128/128.jpg`;
}

function buildUniqueNames() {
  /** @type {string[]} */
  const names = [...SEED_NAMES];
  /** @type {Set<string>} */
  const seen = new Set(names.map((n) => n.toLowerCase()));

  const pools = [GREENS, VEG, PROTEINS, CRUNCH, DRESSINGS, EXTRAS];

  for (const pool of pools) {
    for (const name of pool) {
      if (names.length >= TARGET_ROWS) {
        break;
      }

      const key = name.toLowerCase();

      if (seen.has(key) === true) {
        continue;
      }

      seen.add(key);
      names.push(name);
    }
  }

  let suffix = 2;

  while (names.length < TARGET_ROWS) {
    const synthetic = `House Topping ${suffix}`;
    suffix += 1;
    names.push(synthetic);
  }

  return names.slice(0, TARGET_ROWS);
}

function main() {
  const names = buildUniqueNames();
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
