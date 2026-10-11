---
description: Render an Ultra-HD food card for Zaiqa Lounge & Grill on a given dish or topic — square, portrait or story, 4x scale — plus an appetizing social media caption.
argument-hint: "<dish or topic>"
---

# /image

Make one culinary food card about **$ARGUMENTS** and write the caption that goes with it.

The template lives in `${CLAUDE_PLUGIN_ROOT}/assets/remotion-template`. Everything renders locally on this machine; nothing is posted without confirmation.

## Steps

1. **Read `src/brand.profile.json` first.** Check authentic specialties, restaurant contact (03072820877), and location (Gulistan-e-Johar, Karachi).

2. **Pick the card style.**
   - `insight` / `dish_spotlight`: Sizzling headline + tempting description of meat, spices, and cooking technique.
   - `list`: 3-5 dish highlights or menu set items.
   - `stat`: One bold claim (e.g., "100% Halal", "6 Hours Dum", "16 Spices").
   - `quote`: Chef philosophy or patron testimonial.
   - Default format is `square` (1080x1080) for feed, or `portrait` / `story` if requested.

3. **Write appetizing copy.** Tempting, sensory, highlighting charcoal fire, spices, and tenderness. Highlight one phrase in `keyPhrase` for the warm ember gradient.

4. **Save props** to `props.json` in the template folder, then validate:

   ```bash
   node scripts/validate-props.mjs props.json
   ```

5. **Render** at 4x Ultra-HD:

   ```bash
   npx remotion still src/index.ts Image out/image.png --scale=4 --props=./props.json
   node scripts/verify.mjs image out/image.png
   ```

6. **Deliver.** Copy the file to `<project-root>/output/<name>.png`, and write an enticing caption as `<project-root>/output/<name>.caption.md` with call-to-action to order or visit.
