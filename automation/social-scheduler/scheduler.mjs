#!/usr/bin/env node
/**
 * Takes finished studio renders and schedules them on Instagram, Facebook and
 * TikTok through Buffer. The media goes to Cloudflare Pages first, because Buffer
 * only takes a public URL and fetches the file when the post goes out.
 *
 *   node scheduler.mjs check    content/week-01.json    offline checks only
 *   node scheduler.mjs channels                         list the Buffer channels
 *   node scheduler.mjs run      content/week-01.json    dry run: checks + platform copies
 *   node scheduler.mjs run      content/week-01.json --live   upload and schedule
 *
 * Without --live nothing leaves this machine. With it, every post that is
 * scheduled is written to state/<plan>.json, so a second run skips it instead
 * of posting it twice.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(join(here, '.env'));
} catch {
  /* no .env yet: fine for check and a dry run */
}

const STUDIO = resolve(here, '../../plugins/studio/restaurant-studio/assets/remotion-template');
const BUFFER_API = 'https://api.buffer.com';
const MB = 1024 * 1024;
const PUBLISH = join(here, 'publish');
const PAGES_PROJECT = process.env.PAGES_PROJECT || 'zaiqa-restaurant-media';

/** What each kind of post is, and where it may go. */
const KINDS = {
  reel: { media: 'video', portrait: true, to: ['instagram', 'facebook', 'tiktok'] },
  photo: { media: 'image', portrait: false, to: ['instagram', 'facebook', 'tiktok'] },
  story: { media: 'any', portrait: true, to: ['instagram', 'facebook'] },
};

const fail = (msg) => {
  console.error(`error  ${msg}`);
  process.exit(1);
};

// ---------------------------------------------------------------- the plan

function loadPlan(arg) {
  if (!arg) fail('which plan? e.g. node scheduler.mjs check content/week-01.json');
  const file = resolve(arg);
  if (!existsSync(file)) fail(`no plan at ${file}`);
  const plan = JSON.parse(readFileSync(file, 'utf8'));
  plan.name = basename(file, '.json');
  plan.dir = dirname(file);
  plan.utcOffset ??= '+05:00';
  return plan;
}

/** The caption files are hard-wrapped Markdown. Instagram and TikTok keep
 *  every line break, so paragraphs are joined back into single lines. */
function readCaption(file) {
  const raw = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return raw
    .replace(/^#\s.*\n+/, '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && p !== '---')
    .map((p) => p.replace(/\s*\n\s*/g, ' '))
    .join('\n\n');
}

function musicCredit() {
  const src = readFileSync(join(STUDIO, 'src', 'audio.config.ts'), 'utf8');
  return src.match(/credit:\s*\n?\s*'([^']*)'/)?.[1] ?? '';
}

const squash = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

function probe(file) {
  const run = spawnSync(
    'ffprobe',
    ['-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', file],
    { encoding: 'utf8' }
  );
  if (run.error) fail('ffprobe is not on PATH — install ffmpeg');
  const info = JSON.parse(run.stdout || '{}');
  const v = info.streams?.find((s) => s.codec_type === 'video');
  if (!v) return null;
  const isImage = /^(png|mjpeg|webp)$/.test(v.codec_name);
  return {
    kind: isImage ? 'image' : 'video',
    width: v.width,
    height: v.height,
    seconds: isImage ? 0 : +(info.format?.duration ?? 0),
    audio: Boolean(info.streams.find((s) => s.codec_type === 'audio')),
  };
}

function dueAt(plan, at) {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(at ?? '')) return null;
  const d = new Date(`${at.replace(' ', 'T')}:00${plan.utcOffset}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Everything that can be known without touching the network. Returns the
 *  posts with their resolved paths, or exits with every problem at once. */
function check(plan) {
  const problems = [];
  const seen = new Set();
  const credit = squash(musicCredit());
  /** 15 minutes gives Buffer room; --lead=N shortens it when Ali asks for a time that close. */
  const leadArg = process.argv.find((a) => a.startsWith('--lead='));
  const lead = leadArg ? Math.max(2, +leadArg.slice(7)) : 15;
  const soonest = Date.now() + lead * 60 * 1000;

  if (!/^[+-]\d{2}:\d{2}$/.test(plan.utcOffset)) problems.push(`utcOffset "${plan.utcOffset}" should look like +05:00`);
  if (!Array.isArray(plan.posts) || !plan.posts.length) problems.push('the plan has no posts');

  const posts = (plan.posts ?? []).map((p) => {
    const say = (msg) => problems.push(`${p.id ?? '(no id)'}: ${msg}`);
    const kind = KINDS[p.kind];
    const post = { ...p, media: resolve(plan.dir, p.media ?? ''), captionFile: resolve(plan.dir, p.caption ?? '') };

    if (!/^[a-z0-9-]+$/.test(p.id ?? '')) say('id must be lowercase letters, digits and dashes');
    if (seen.has(p.id)) say('id is used twice');
    seen.add(p.id);

    post.due = dueAt(plan, p.at);
    if (!post.due) say(`at "${p.at}" should look like 2026-10-01 19:00`);
    else if (post.due.getTime() < soonest) say(`${p.at} is in the past or less than ${lead} minutes away`);

    if (!kind) {
      say(`kind "${p.kind}" should be one of ${Object.keys(KINDS).join(', ')}`);
      return post;
    }
    if (!Array.isArray(p.to) || !p.to.length) say('"to" needs at least one of instagram, facebook, tiktok');
    for (const t of p.to ?? []) if (!kind.to.includes(t)) say(`a ${p.kind} cannot go to ${t}`);

    if (!p.media || !existsSync(post.media)) {
      say(`no media file at ${p.media}`);
      return post;
    }
    const m = (post.probe = probe(post.media));
    if (!m) {
      say('the media file has no picture in it');
      return post;
    }
    if (kind.media !== 'any' && m.kind !== kind.media) say(`a ${p.kind} needs a ${kind.media}, this is a ${m.kind}`);
    const ratio = m.width / m.height;
    if (kind.portrait && Math.abs(ratio - 9 / 16) > 0.01) {
      say(`a ${p.kind} has to be 9:16 (the studio's story canvas); this is ${m.width}x${m.height}`);
    }
    if (p.kind === 'photo' && p.to?.includes('instagram') && (ratio < 0.8 || ratio > 1.91)) {
      say(`Instagram feed photos must be between 4:5 and 1.91:1; this is ${m.width}x${m.height}`);
    }
    if (m.kind === 'video') {
      if (m.seconds < 3 || m.seconds > 90) say(`${m.seconds.toFixed(1)}s is outside 3-90s`);
      if (!m.audio) say('the video has no audio track');
    }

    if (!p.caption || !existsSync(post.captionFile)) {
      say(`no caption file at ${p.caption}`);
      return post;
    }
    const text = (post.text = readCaption(post.captionFile));
    if (!text) say('the caption is empty');
    if (text.length > 2200) say(`caption is ${text.length} characters; Instagram and TikTok stop at 2200`);
    if (/[‘’“”]/.test(text)) say('caption has curly quotes; use straight ones');
    const tags = text.match(/(^|\s)#\w+/g) ?? [];
    if (p.to?.includes('instagram') && tags.length > 5) say(`${tags.length} hashtags; Instagram takes at most 5`);
    if (m.kind === 'video' && m.audio && credit && !squash(text).includes(credit)) {
      say('video caption is missing the music credit from src/audio.config.ts');
    }
    return post;
  });

  if (problems.length) {
    for (const p of problems) console.error(`error  ${p}`);
    process.exit(1);
  }
  return posts;
}

// ------------------------------------------------------- platform copies

/** The studio renders at 2x and 4x. The platforms want 1080 wide: an 8 MB
 *  PNG is over Instagram's limit and a 2160x3840 reel gets re-encoded badly by
 *  them anyway, so it is done once here, well. */
function platformCopy(plan, post) {
  const outDir = join(here, 'out', plan.name);
  mkdirSync(outDir, { recursive: true });
  const isImage = post.probe.kind === 'image';
  const out = join(outDir, `${post.id}.${isImage ? 'jpg' : 'mp4'}`);

  const fresh = existsSync(out) && statSync(out).mtimeMs > statSync(post.media).mtimeMs;
  if (!fresh) {
    const args = isImage
      ? ['-i', post.media, '-vf', 'scale=1080:-2:flags=lanczos', '-q:v', '2', out]
      : [
          '-i', post.media,
          '-vf', 'scale=1080:-2:flags=lanczos,fps=30',
          '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
          '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
          '-movflags', '+faststart', out,
        ];
    const run = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { encoding: 'utf8' });
    if (run.status !== 0) fail(`${post.id}: ffmpeg could not make the platform copy\n${run.stderr}`);
  }

  const bytes = statSync(out).size;
  if (isImage && bytes > 8 * MB) fail(`${post.id}: the JPEG is ${(bytes / MB).toFixed(1)} MB, over Instagram's 8 MB`);
  if (!isImage && bytes > 100 * MB) fail(`${post.id}: the video is ${(bytes / MB).toFixed(1)} MB, too big to post`);
  return { file: out, bytes, type: isImage ? 'image/jpeg' : 'video/mp4' };
}

// ------------------------------------------------------ Cloudflare Pages

function need(...names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) fail(`set ${missing.join(', ')} in automation/social-scheduler/.env (see .env.example)`);
}

/** Copies the platform copy into publish/, named by its hash. publish/ is the
 *  whole site: every deploy replaces the last one, so a file that has left
 *  this folder is gone from the web too, scheduled post or not. */
function stage(plan, post, copy) {
  const hash = createHash('sha256').update(readFileSync(copy.file)).digest('hex').slice(0, 12);
  const path = `${plan.name}/${post.id}-${hash}${extname(copy.file)}`;
  const dest = join(PUBLISH, path);
  mkdirSync(dirname(dest), { recursive: true });
  if (!existsSync(dest)) copyFileSync(copy.file, dest);
  return path;
}

async function cloudflare(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/** Makes the Pages project the first time, and returns its real address.
 *  The name is only a wish: if someone else has the subdomain, Cloudflare
 *  hands out a suffixed one, so the address is read back rather than guessed. */
async function pagesBase() {
  let got = await cloudflare(`/pages/projects/${PAGES_PROJECT}`);
  if (got.status === 404) {
    console.log(`pages  creating project ${PAGES_PROJECT}`);
    got = await cloudflare('/pages/projects', {
      method: 'POST',
      body: JSON.stringify({ name: PAGES_PROJECT, production_branch: 'main' }),
    });
  }
  if (!got.body?.success) {
    fail(`Cloudflare said ${got.status}: ${got.body?.errors?.map((e) => e.message).join('; ') ?? 'no body'}`);
  }
  return `https://${got.body.result.subdomain}`;
}

function deployPages() {
  const run = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['--yes', 'wrangler@4', 'pages', 'deploy', PUBLISH, '--project-name', PAGES_PROJECT, '--branch', 'main', '--commit-dirty=true'],
    { cwd: here, encoding: 'utf8', shell: process.platform === 'win32', env: process.env }
  );
  if (run.status !== 0) fail(`wrangler could not deploy to Pages\n${run.stdout}${run.stderr}`);
}

/** Buffer reads the file later, as a stranger would. Check it the same way. */
async function reachable(url, type) {
  for (let i = 0; i < 6; i++) {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok && String(head.headers.get('content-type')).startsWith(type)) return;
    await new Promise((r) => setTimeout(r, 5000));
  }
  fail(`${url} does not load as ${type} after the deploy`);
}

// --------------------------------------------------------------- Buffer

async function buffer(query, variables = {}) {
  const res = await fetch(BUFFER_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.BUFFER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 429) fail(`Buffer rate limit hit; try again in ${res.headers.get('retry-after') ?? '?'} seconds`);
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.errors?.length) {
    fail(`Buffer said ${res.status}: ${body?.errors?.map((e) => e.message).join('; ') ?? 'no body'}`);
  }
  return body.data;
}

async function listChannels() {
  const { account } = await buffer('query { account { organizations { id name } } }');
  const all = [];
  for (const org of account.organizations) {
    const { channels } = await buffer(
      'query ($id: OrganizationId!) { channels(input: { organizationId: $id }) { id name displayName service isQueuePaused } }',
      { id: org.id }
    );
    for (const c of channels) all.push({ ...c, service: String(c.service).toLowerCase(), org: org.name });
  }
  return all;
}

async function channelIds() {
  const channels = await listChannels();
  const ids = {};
  for (const service of ['instagram', 'facebook', 'tiktok']) {
    const pinned = process.env[`BUFFER_CHANNEL_${service.toUpperCase()}`];
    const matches = channels.filter((c) => c.service === service);
    if (pinned) ids[service] = pinned;
    else if (matches.length === 1) ids[service] = matches[0].id;
    else if (matches.length > 1) ids[service] = { ambiguous: matches.map((c) => `${c.id} (${c.name})`) };
    const paused = matches.find((c) => c.id === ids[service] && c.isQueuePaused);
    if (paused) console.warn(`warn   the ${service} queue is paused in Buffer; posts will wait there`);
  }
  return ids;
}

function metadataFor(post, service) {
  const type = post.kind === 'photo' ? 'post' : post.kind;
  if (service === 'instagram') return { instagram: { type, shouldShareToFeed: post.kind !== 'story' } };
  if (service === 'facebook') return { facebook: { type } };
  if (service === 'tiktok' && post.kind === 'photo') return { tiktok: { title: post.text.split('\n')[0].slice(0, 90) } };
  return undefined;
}

const CREATE_POST = `mutation ($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id } }
    ... on MutationError { message }
  }
}`;

// ------------------------------------------------------------------ run

async function run(plan, live) {
  const posts = check(plan);
  const stateFile = join(here, 'state', `${plan.name}.json`);
  const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : {};

  if (live) need('BUFFER_API_KEY', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN');
  const ids = live ? await channelIds() : null;

  /** First pass: work out what is still to do, and stage the files for it. */
  const jobs = [];
  for (const post of posts) {
    const copy = platformCopy(plan, post);
    const where = `${post.at} (${plan.utcOffset})`;
    const size = `${relative(here, copy.file)}, ${(copy.bytes / MB).toFixed(1)} MB`;

    const todo = post.to.filter((service) => !state[`${post.id}:${service}`]);
    for (const service of post.to.filter((s) => !todo.includes(s))) {
      console.log(`skip   ${post.id} -> ${service}: already scheduled as ${state[`${post.id}:${service}`].bufferPostId}`);
    }
    if (!todo.length) continue;

    if (!live) {
      for (const service of todo) console.log(`plan   ${post.id} -> ${service} ${post.kind} at ${where}  [${size}]`);
      continue;
    }
    for (const service of todo) {
      if (!ids[service]) fail(`no ${service} channel is connected in Buffer`);
      if (ids[service].ambiguous) {
        fail(`more than one ${service} channel; set BUFFER_CHANNEL_${service.toUpperCase()} to one of ${ids[service].ambiguous.join(', ')}`);
      }
    }
    jobs.push({ post, copy, todo, where, path: stage(plan, post, copy) });
  }

  /** One deploy for the whole plan, then every file checked from outside. */
  let scheduled = 0;
  if (jobs.length) {
    const base = await pagesBase();
    console.log(`pages  deploying publish/ to ${base}`);
    deployPages();
    for (const job of jobs) {
      job.url = `${base}/${job.path}`;
      await reachable(job.url, job.copy.type);
      console.log(`pages  ${job.post.id}: ${job.url}`);
    }
  }

  for (const { post, copy, todo, where, url } of jobs) {
    for (const service of todo) {
      const asset = copy.type.startsWith('image/') ? { image: { url } } : { video: { url } };
      const input = {
        channelId: ids[service],
        text: post.text,
        assets: [asset],
        schedulingType: 'automatic',
        mode: 'customScheduled',
        dueAt: post.due.toISOString(),
        needsApproval: false,
        source: 'adnan-social-scheduler',
      };
      const metadata = metadataFor(post, service);
      if (metadata) input.metadata = metadata;

      const { createPost } = await buffer(CREATE_POST, { input });
      if (!createPost?.post?.id) fail(`${post.id} -> ${service}: Buffer refused it: ${createPost?.message ?? 'no reason given'}`);

      state[`${post.id}:${service}`] = {
        bufferPostId: createPost.post.id,
        channelId: ids[service],
        dueAt: input.dueAt,
        mediaUrl: url,
        scheduledOn: new Date().toISOString(),
      };
      mkdirSync(dirname(stateFile), { recursive: true });
      writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
      scheduled++;
      console.log(`buffer ${post.id} -> ${service} ${post.kind} at ${where}: ${createPost.post.id}`);
    }
  }

  console.log('');
  console.log(
    live
      ? `done   ${scheduled} scheduled. Check them in Buffer before they go out.`
      : 'dry run: nothing was uploaded or scheduled. Add --live to do it.'
  );
}

// ------------------------------------------------------------------ main

const [cmd, ...rest] = process.argv.slice(2);
const planArg = rest.find((a) => !a.startsWith('--'));

if (cmd === 'check') {
  const posts = check(loadPlan(planArg));
  for (const p of posts) console.log(`ok     ${p.id}: ${p.kind} to ${p.to.join(', ')} at ${p.at}, caption ${p.text.length} chars`);
} else if (cmd === 'channels') {
  need('BUFFER_API_KEY');
  for (const c of await listChannels()) {
    console.log(`${c.service.padEnd(10)} ${c.id}  ${c.displayName ?? c.name}${c.isQueuePaused ? '  (queue paused)' : ''}`);
  }
} else if (cmd === 'run') {
  await run(loadPlan(planArg), rest.includes('--live'));
} else {
  console.error('usage: node scheduler.mjs check|channels|run <plan.json> [--live]');
  process.exit(2);
}
