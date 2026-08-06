#!/usr/bin/env node
/**
 * Generate Blueprint CDS diamond stress fixtures.
 *
 * Carat ladder: 0.3 → 30.0 step 0.1 (298 distinct values).
 * Measurements ladder: 4.0 → 12.0 step 0.1 (81 distinct values per axis).
 *
 * Usage:
 *   node scripts/generate.mjs --count 5000 --out 5000.json
 *   node scripts/generate.mjs --count 5000000 --out 5000000.json
 */
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';

const SHAPES = [
  'Round',
  'Princess',
  'Cushion',
  'Oval',
  'Emerald',
  'Pear',
  'Marquise',
  'Radiant',
  'Asscher',
  'Heart',
];

const COLOURS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
const CUTS = ['Good', 'Very Good', 'Excellent', "Cupid's Ideal"];
const POLISH = ['Excellent', 'Very Good', 'Good', 'Fair'];
const SYMMETRY = ['Excellent', 'Very Good', 'Good', 'Fair'];
const FLUORESCENCE = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];
const LABS = ['GIA', 'IGI', 'HRD', 'AGS', 'GCAL'];
const GIRDLES = ['Extremely Thin', 'Very Thin', 'Thin', 'Medium', 'Slightly Thick', 'Thick', 'Very Thick'];
const CULETS = ['None', 'Very Small', 'Small', 'Medium'];

const IMAGE_BASE = 'https://raw.githubusercontent.com/JonPurvis/diamonds/main';

const CARAT_START = 0.3;
const CARAT_END = 30.0;
const CARAT_STEP = 0.1;

const MEASUREMENT_START = 4.0;
const MEASUREMENT_END = 12.0;
const MEASUREMENT_STEP = 0.1;

function buildLadder(start, end, step) {
  const values = [];
  for (let tenths = Math.round(start * 10); tenths <= Math.round(end * 10); tenths += Math.round(step * 10)) {
    values.push((tenths / 10).toFixed(1));
  }
  return values;
}

function buildCarats() {
  return buildLadder(CARAT_START, CARAT_END, CARAT_STEP);
}

function buildMeasurementLadder() {
  return buildLadder(MEASUREMENT_START, MEASUREMENT_END, MEASUREMENT_STEP);
}

function parseArgs(argv) {
  let count = null;
  let out = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--count') {
      count = Number(argv[++i]);
    } else if (argv[i] === '--out') {
      out = argv[++i];
    }
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('Usage: node scripts/generate.mjs --count <n> --out <file.json>');
  }
  if (!out) {
    throw new Error('Missing --out');
  }
  return { count, out };
}

function priceForIndex(i) {
  return (100 + (i * 490) / 300).toFixed(2);
}

function certificateNumberForIndex(i) {
  return String(1000000000 + i + 1);
}

function tablePercentForIndex(i) {
  return (52 + (i % 21)).toFixed(1);
}

function depthPercentForIndex(i) {
  return (58 + (i % 21)).toFixed(1);
}

function measurementsForIndex(i, shape, measurementLadder) {
  const len = measurementLadder.length;
  const length = measurementLadder[i % len];
  const width = shape === 'Round' ? length : measurementLadder[(i + 1) % len];
  const depth = measurementLadder[(i + 2) % len];
  return `${length} x ${width} x ${depth}`;
}

async function generate({ count, out }) {
  const carats = buildCarats();
  const measurementLadder = buildMeasurementLadder();
  if (carats.length !== 298) {
    throw new Error(`Expected 298 carats, got ${carats.length}`);
  }
  if (measurementLadder.length !== 81) {
    throw new Error(`Expected 81 measurement values, got ${measurementLadder.length}`);
  }

  // Match historical padding: 6 digits through 1M, 7 digits for 5M.
  const skuWidth = count > 1_000_000 ? 7 : 6;
  const stream = createWriteStream(out, { encoding: 'utf8' });
  stream.write('[\n');

  const logEvery = Math.max(100_000, Math.floor(count / 20));

  for (let i = 0; i < count; i++) {
    const shape = SHAPES[i % SHAPES.length];
    const colour = COLOURS[i % COLOURS.length];
    const clarity = CLARITIES[i % CLARITIES.length];
    const cut = CUTS[i % CUTS.length];
    const carat = carats[i % carats.length];
    const sku = `DIA-${String(i + 1).padStart(skuWidth, '0')}`;
    const title = `${shape} ${carat}ct ${colour} ${clarity}`;
    const image = `${IMAGE_BASE}/shape-${shape.toLowerCase()}.png`;
    const price = priceForIndex(i);

    const row = JSON.stringify({
      sku,
      title,
      carat,
      shape,
      colour,
      clarity,
      cut,
      price,
      image,
      polish: POLISH[i % POLISH.length],
      symmetry: SYMMETRY[i % SYMMETRY.length],
      fluorescence: FLUORESCENCE[i % FLUORESCENCE.length],
      lab: LABS[i % LABS.length],
      certificate_number: certificateNumberForIndex(i),
      measurements: measurementsForIndex(i, shape, measurementLadder),
      table_percent: tablePercentForIndex(i),
      depth_percent: depthPercentForIndex(i),
      girdle: GIRDLES[i % GIRDLES.length],
      culet: CULETS[i % CULETS.length],
    });

    stream.write(i === 0 ? row : `,\n${row}`);

    if ((i + 1) % logEvery === 0 || i + 1 === count) {
      process.stderr.write(`  ${out}: ${i + 1}/${count}\n`);
    }

    if (stream.writableNeedDrain) {
      await once(stream, 'drain');
    }
  }

  stream.write('\n]\n');
  stream.end();
  await once(stream, 'finish');
}

const args = parseArgs(process.argv);
console.error(`Generating ${args.count} rows → ${args.out} (carats: ${buildCarats().length})`);
await generate(args);
console.error('Done.');
