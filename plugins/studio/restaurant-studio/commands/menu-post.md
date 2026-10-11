---
description: Create a dedicated menu spotlight post for any signature dish of Zaiqa Lounge & Grill (e.g. Royal Dum Biryani, Shinwari Karahi, Malai Boti).
argument-hint: "<dish-name>"
---

# /menu-post

Create a dish spotlight card for **$ARGUMENTS**.

## Process

1. Look up dish details in `src/brand.profile.json` or craft a fresh dish profile.
2. Structure props with `kind: "insight"`, specifying:
   - `eyebrow`: "Chef's Signature Dish"
   - `headline`: Highlighting dish name and key aroma/taste
   - `keyPhrase`: Glowing ember accent phrase
   - `body`: Rich description of marination, live charcoal cooking, and traditional sides
   - `footerTags`: `["Zaiqa Lounge", "<Dish-Name>", "Karachi Food"]`
3. Validate props: `node scripts/validate-props.mjs props.json`
4. Render 4x still: `npx remotion still src/index.ts Image out/image.png --scale=4 --props=./props.json`
5. Save to `output/<dish-name>.png` along with an appetizing caption in `output/<dish-name>.caption.md`.

