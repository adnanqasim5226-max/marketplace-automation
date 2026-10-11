---
name: restaurant-studio
description: Render mouthwatering culinary visuals for Zaiqa Lounge & Grill — appetizing food cards (dish spotlight / chef special / flash deal / customer review) or sizzling video reels with audio, via the local Remotion template. One brief, three canvases (square / portrait / story). Ultra-HD stills at 4x. Auto-triggers on "make a menu post", "render food card", "dish reel", "restaurant video", "biryani post", "deal graphic", "bbq reel".
invoke: restaurant-studio
---

# Zaiqa Lounge & Grill — Restaurant Studio

This plugin crafts high-impact culinary social media content for **Zaiqa Lounge & Grill** (Karachi):
1. **Food Stills & Menu Cards** (4x Ultra-HD PNG)
2. **Sizzling Video Reels** (2x 60fps MP4 with ambient sound & music)

All assets render 100% locally on this machine using Remotion, styled with warm flame amber and saffron gold on charcoal iron.

## Directory Structure

```
assets/remotion-template/
  src/brand.profile.json       Restaurant details, specialties, hours, owner (Adnan Qasim)
  src/brand.tokens.json        Flame orange, saffron gold, charcoal palette & typography
  src/image.config.ts          Default culinary card copy
  src/video.config.ts          Default video reel copy
  src/audio.config.ts          Local audio bed and license attribution
  scripts/validate-props.mjs   Validates briefs & copy before rendering
  scripts/verify.mjs           Verifies canvas resolution, file integrity, and audio
  scripts/render-video.mjs     Renders MP4 reels locally with audio
```

## The Food & Brand Rules

1. **Authentic culinary facts.** Everything comes from `brand.profile.json` — 100% Halal fresh meats, live charcoal barbecue, authentic Peshawari shinwari, and slow-cooked royal dum biryani.
2. **Appetizing, sensory voice.** Highlight aroma, tenderness, sizzling live charcoal fire, and fresh spices. Keep sentences punchy, tempting, and authentic.
3. **Multi-Canvas support.** Every brief works across:
   - `square` (1080×1080) for Instagram feed
   - `portrait` (1080×1350) for high-engagement vertical feed
   - `story` (1080×1920) for Instagram Stories, Reels, and TikTok
4. **Verified renders.** Run `validate-props.mjs` before rendering and `verify.mjs` afterwards.

## Commands

- `/image <dish or topic>` — Renders an Ultra-HD food card + engaging caption.
- `/menu-post <dish-name>` — Renders a dedicated dish spotlight card.
- `/deal-post <deal-title>` — Renders a promotional combo / family platter deal graphic.
- `/video <dish or topic>` — Renders a short video reel with music + caption.
- `/dish-reel <dish-name>` — Renders a full sizzling reel with culinary highlights.

All renders save into `<project-root>/output/`.
Scheduling to Instagram & TikTok is handled via `automation/social-scheduler` using Buffer.
