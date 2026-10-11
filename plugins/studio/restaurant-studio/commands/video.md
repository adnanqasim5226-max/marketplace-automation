---
description: Render a sizzling short video reel with music for Zaiqa Lounge & Grill on a given dish or topic — story 1080x1920 (or square/portrait), 2x — plus an engaging social caption and audio credit.
argument-hint: "<dish or topic>"
---

# /video

Make one short video reel about **$ARGUMENTS**, with music, and write the caption.

The template lives in `${CLAUDE_PLUGIN_ROOT}/assets/remotion-template`. Everything renders locally on this machine.

## Steps

1. **Read `src/brand.profile.json` first.** Check specialties, hours (6 PM - 2 AM), and phone (03072820877).

2. **Write the cut.**
   - An opening headline with `keyPhrase`
   - Two to four punchy highlight points (e.g. fire searing, secret spices, slow dum)
   - A mouthwatering closing CTA line (e.g. "Taste authentic Shinwari heritage tonight.")
   - Story format (1080x1920) is default for Reels and TikTok.

3. **Save props** to `video.props.json`, then validate:

   ```bash
   node scripts/validate-props.mjs video.props.json --video
   ```

4. **Render.** Local rendering with music:

   ```bash
   node scripts/render-video.mjs --props=./video.props.json --out=out/video.mp4
   node scripts/verify.mjs video out/video.mp4
   ```

5. **Deliver.** Copy the file to `<project-root>/output/<name>.mp4`, and write a caption file `<project-root>/output/<name>.caption.md` with table booking / delivery details.
