---
description: Create a high-converting promotional deal or family platter graphic for Zaiqa Lounge & Grill (e.g. Midnight BBQ Deal, Family Platter, Lunch Box).
argument-hint: "<deal-name>"
---

# /deal-post

Render a promotional deal graphic for **$ARGUMENTS**.

## Process

1. Choose card kind `list` or `stat`.
2. Format: `square` (1080x1080) or `portrait` (1080x1350).
3. Specify items included in the deal (kebabs, karahi, naans, drinks) and special discount price.
4. Validate: `node scripts/validate-props.mjs props.json`
5. Render 4x still: `npx remotion still src/index.ts Image out/image.png --scale=4 --props=./props.json`
6. Output to `output/<deal-name>.png` and caption to `output/<deal-name>.caption.md`.

