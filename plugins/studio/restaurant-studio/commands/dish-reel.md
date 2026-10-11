---
description: Create a dynamic 1080x1920 video reel for a signature dish with ambient music and step-by-step flavor notes for Instagram Reels & TikTok.
argument-hint: "<dish-name>"
---

# /dish-reel

Create a 9:16 vertical video reel for **$ARGUMENTS**.

## Process

1. Set `format: "story"` (1080x1920).
2. Write three sensory stages:
   - Searing / marination (e.g., fresh spices, pure butter)
   - The live charcoal cook / slow simmer
   - Sizzling presentation with hot naans and raita
3. Validate props: `node scripts/validate-props.mjs video.props.json --video`
4. Render reel: `node scripts/render-video.mjs --props=./video.props.json --out=out/video.mp4`
5. Verify output: `node scripts/verify.mjs video out/video.mp4`
6. Save to `output/<dish-name>-reel.mp4` and caption in `output/<dish-name>-reel.caption.md`.

