/**
 * The video — a sizzling, sensory cut for Zaiqa Lounge & Grill:
 * opening card, two or three mouthwatering highlights, and a closing invitation.
 *
 * Rendered by scripts/render-video.mjs:
 *   npm run video -- --props=./video.props.json --out=out/video.mp4
 */
import { FPS } from './theme';

export const VIDEO = {
  format: 'story' as 'square' | 'portrait' | 'story',

  eyebrow: 'Live From Charcoal Grill',
  headline: 'Sizzling Shinwari Karahi cooked fresh in pure butter',
  keyPhrase: 'cooked fresh in pure butter',

  points: [
    'Fresh cuts seared over roaring high flames',
    'Ripened tomatoes, julienne ginger and mountain salt',
    'Simmered to rich aromatic perfection in twenty minutes',
  ] as string[],

  /** The closing line invitation / CTA */
  closingLine: 'Taste the authentic Shinwari heritage tonight.',

  /** Seconds each scene holds before the cross-dissolve. */
  hold: { intro: 3.0, point: 3.0, outro: 3.2 },
};

/** Total frames: simply every scene, because they run one after another. */
export const totalDuration = (v = VIDEO) => {
  const scenes = [v.hold.intro, ...v.points.map(() => v.hold.point), v.hold.outro];
  return scenes.reduce((n, sec) => n + Math.round(sec * FPS), 0);
};
