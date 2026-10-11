#!/usr/bin/env node
/**
 * Checks a props file before a render spends minutes on it.
 *
 *   node scripts/validate-props.mjs props.json
 *   node scripts/validate-props.mjs video.props.json --video
 *
 * Enforces: valid kind, headline limits, keyPhrase existence,
 * body/points character limits, and dishes from brand profile.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const templateRoot = resolve(here, '..');
const profile = JSON.parse(readFileSync(resolve(templateRoot, 'src', 'brand.profile.json'), 'utf8'));
const tokens = JSON.parse(readFileSync(resolve(templateRoot, 'src', 'brand.tokens.json'), 'utf8'));

const args = process.argv.slice(2);
const isVideo = args.includes('--video');
const target = args.find((a) => !a.startsWith('--'));

if (!target) {
  console.error('usage: node scripts/validate-props.mjs <props.json> [--video]');
  process.exit(2);
}

const file = resolve(target);
if (!existsSync(file)) {
  console.error(`error  no props file at ${file}`);
  process.exit(1);
}

let props;
try {
  props = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`error  ${target} is not valid JSON — ${e.message}`);
  process.exit(1);
}

const problems = [];
const warn = [];
const KINDS = [
  'insight',
  'list',
  'stat',
  'quote',
  'showcase',
  'dish_spotlight',
  'chef_special',
  'flash_deal',
  'customer_review',
  'story_announcement',
];
const FORMATS = Object.keys(tokens.canvas);

if (props.format && !FORMATS.includes(props.format)) {
  problems.push(`format "${props.format}" is not one of ${FORMATS.join(', ')}`);
}

const hasPhrase = (line, phrase) =>
  !phrase || (typeof line === 'string' && line.toLowerCase().includes(phrase.toLowerCase()));

if (!isVideo) {
  const kind = props.kind ?? 'insight';
  if (!KINDS.includes(kind)) problems.push(`kind "${kind}" is not one of ${KINDS.join(', ')}`);

  if (kind !== 'quote') {
    if (!props.headline) problems.push('headline is required');
    if (props.headline && props.headline.length > 110)
      problems.push(`headline is ${props.headline.length} characters — keep it under 110`);
    if (!hasPhrase(props.headline, props.keyPhrase))
      problems.push(`keyPhrase "${props.keyPhrase}" is not inside the headline`);
    if (props.subhead && !hasPhrase(props.subhead, props.subheadAccent))
      problems.push(`subheadAccent "${props.subheadAccent}" is not inside the subhead`);
  }

  if (['insight', 'dish_spotlight'].includes(kind) && !props.body) {
    problems.push('the insight/dish_spotlight card needs a body description');
  }
  if (props.body && props.body.length > 460) {
    problems.push(`body is ${props.body.length} characters — keep it under 460`);
  }
  if (['list', 'flash_deal'].includes(kind)) {
    const points = props.points ?? [];
    if (points.length < 2 || points.length > 5)
      problems.push(`the list/deal card needs 2-5 points, got ${points.length}`);
    points.forEach((p, i) => {
      if (p.length > 84) problems.push(`point ${i + 1} is ${p.length} characters — keep it under 84`);
    });
  }
  if (kind === 'stat' && (!props.stat?.value || !props.stat?.label)) {
    problems.push('the stat card needs stat.value and stat.label');
  }
  if (kind === 'quote' && !props.quote) problems.push('the quote card needs quote');
  if (kind === 'showcase') {
    for (const field of ['project', 'what', 'built', 'learned']) {
      if (!props.showcase?.[field]) problems.push(`the showcase card needs showcase.${field}`);
    }
  }
} else {
  if (!props.headline) problems.push('headline is required');
  if (!hasPhrase(props.headline, props.keyPhrase))
    problems.push(`keyPhrase "${props.keyPhrase}" is not inside the headline`);
  const points = props.points ?? [];
  if (points.length < 2 || points.length > 4)
    problems.push(`the video needs 2-4 points, got ${points.length} — keep it punchy for social attention`);
  points.forEach((p, i) => {
    if (p.length > 84) problems.push(`point ${i + 1} is ${p.length} characters — keep it under 84`);
  });
  if (!props.closingLine) problems.push('closingLine is required');
  if (props.hold) {
    for (const [name, sec] of Object.entries(props.hold)) {
      if (typeof sec !== 'number' || sec < 1.5)
        problems.push(`hold.${name} is ${sec}s — under 1.5s is unreadable`);
    }
  }
}

for (const w of warn) console.warn(`warn   ${w}`);
if (problems.length) {
  for (const p of problems) console.error(`error  ${p}`);
  process.exit(1);
}
console.log(`ok     ${target} is ready to render`);
