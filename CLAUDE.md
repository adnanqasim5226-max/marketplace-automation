# Zaiqa Lounge & Grill — Restaurant Studio: rules for this repo

This repository builds two things for **Zaiqa Lounge & Grill** (owned by **Adnan Qasim**, Karachi):
1. Ultra-HD culinary food cards and deal graphics (4x PNG)
2. Sizzling short video reels with ambient sound & music (2x MP4)

All renders are generated locally on this machine using Remotion.

## Brand & Menu Facts

`plugins/studio/restaurant-studio/assets/remotion-template/src/brand.profile.json` is the single source of truth for restaurant details:
- **Restaurant**: Zaiqa Lounge & Grill
- **Owner**: Adnan Qasim (`adnanqasim5226@gmail.com`, `03072820877`)
- **Location**: Gulistan-e-Johar, Block-9, Pehlwan Goth, Karachi
- **Specialties**: Royal Dum Biryani, Peshawari Shinwari Karahi, Reshmi Malai Boti, Charcoal Sizzler Platter, Monster BBQ Smash Burger
- **Timings**: 6:00 PM – 2:00 AM daily
- **Socials**: Instagram `@adnan31272026`, TikTok `@adnan__5226`

Copy should always reflect authentic culinary facts: 100% Halal fresh meat, live charcoal smoke, authentic spices, and true cooking times.

## Brand Voice

Sensory, hospitable, appetizing, and inviting. Highlight aroma, the crackle of live charcoal, tender juiciness, and Karachi's rich barbecue culture. Short, punchy, mouthwatering sentences.

## Rendering

- **Validate first**:
  ```bash
  node scripts/validate-props.mjs props.json
  node scripts/validate-props.mjs video.props.json --video
  ```
- **Verify after rendering**:
  ```bash
  node scripts/verify.mjs image <path>
  node scripts/verify.mjs video <path>
  ```
- Stills render at 4x scale into `output/`.
- Video reels render at 2x scale (1080x1920 9:16) into `output/`.

## Social Media Automation

`automation/social-scheduler` connects directly to Buffer with Adnan Qasim's API key:
- Instagram Channel: `6acb15d4778b240e2fd2d137` (`@adnan31272026`)
- TikTok Channel: `6acb17e7778b240e2fd2dfe2` (`@adnan__5226`)
- Media is hosted via Cloudflare Pages (`zaiqa-restaurant-media.pages.dev`).
- Running without `--live` performs offline validation and staging.
- Running with `--live` deploys media and schedules posts in Buffer.
