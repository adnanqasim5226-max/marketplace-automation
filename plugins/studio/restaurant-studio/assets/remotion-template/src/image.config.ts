/**
 * The image still — the default culinary card for Zaiqa Lounge & Grill.
 *
 * Every field here can also be passed at render time without touching the
 * file, which is how the /image and /menu-post commands work:
 *   npx remotion still src/index.ts Image out/image.png --scale=4 --props=./props.json
 * Input props are merged over these defaults.
 *
 * kind:
 *   'insight'  headline + subhead + a short mouthwatering paragraph
 *   'list'     headline + 3-5 dish features or menu items
 *   'stat'     one highlight (e.g. "100% Halal", "16 Spices", "6 Hours")
 *   'quote'    chef philosophy or guest testimonial
 *   'showcase' signature dish specialty spotlight
 *
 * format: square 1080x1080 · portrait 1080x1350 · story 1080x1920
 */
export const IMAGE = {
  kind: 'insight' as 'insight' | 'list' | 'stat' | 'quote' | 'showcase',
  format: 'square' as 'square' | 'portrait' | 'story',

  eyebrow: "Chef's Signature Dum",
  headline: 'Real Dum Biryani needs six hours of charcoal patience',
  keyPhrase: 'six hours of charcoal patience',
  subhead: 'No shortcuts, no premixed essences. Pure saffron and tender meat.',
  subheadAccent: 'Pure saffron and tender meat',

  body:
    'Every grain of long sella basmati is layered with meat marinated overnight in fresh yogurt, fried golden onions, and freshly ground whole garam masala. Sealed airtight with dough over glowing coals until the steam perfumes the entire street.',

  points: [
    'Aromatic long sella basmati infused with pure saffron',
    'Tender meat marinated overnight in hand-ground spices',
    'Airtight dough-sealed clay pot dum over live coals',
    'Served steaming hot with refreshing mint zeera raita',
  ] as string[],

  stat: { value: '100%', label: 'fresh hand-slaughtered Halal meat cooked daily over live coals' },

  quote:
    'Great food is never rushed. When the smoke from burning charcoal meets tender meat and ground spices, magic happens on your plate.',

  showcase: {
    project: 'Royal-Dum-Biryani',
    what: 'Aromatic saffron sella basmati with overnight spiced tender meat.',
    built: 'Clay pot dum-pukht sealed with wheat dough over live charcoal embers.',
    learned: 'Authentic rich flavor comes only from gentle, slow charcoal heat.',
  },

  footerTags: ['Zaiqa Lounge', 'Dum Biryani', 'Karachi BBQ'] as string[],
};
