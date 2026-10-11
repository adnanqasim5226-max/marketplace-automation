# Zaiqa Lounge & Grill — Restaurant Studio Marketplace

A specialized Claude Code plugin marketplace designed for **Zaiqa Lounge & Grill** (owned by **Adnan Qasim**, Karachi). Renders mouthwatering **culinary food cards** and **sizzling video reels** scored with audio — warm flame amber and saffron gold on deep charcoal stone.

Everything renders locally on this machine using Remotion. Social media distribution to Instagram (`@adnan31272026`) and TikTok (`@adnan__5226`) is handled via Buffer and Cloudflare Pages.

## Install the Plugin

In Claude Code:

```
/plugin marketplace add <path-to-this-folder>
/plugin install restaurant-studio@restaurant-marketplace
```

Initial setup for rendering:

```bash
cd plugins/studio/restaurant-studio/assets/remotion-template
npm install
```

Requires **Node 18+** and **ffmpeg on PATH**.

## Available Commands

```
/menu-post Royal Dum Biryani
/dish-reel Sizzling Shinwari Karahi
/deal-post Weekend Grand Platter Deal
/image Tender Reshmi Malai Boti
/video Charcoal BBQ Experience
```

All commands write outputs to `<project-root>/output/`: Ultra-HD PNG stills at 4x and MP4 reels at 2x, along with ready-to-post captions.

## Canvas Formats & Quality

| Type | Canvas | Scale | Output |
|---|---|---|---|
| **Still** | Square (1080×1080), Portrait (1080×1350), Story (1080×1920) | 4x | ~8 MB Ultra-HD PNG |
| **Reel** | Story (1080×1920 9:16) | 2x | ~5 MB 60fps MP4 with sound |

## Manual Rendering Workflow

```bash
cd plugins/studio/restaurant-studio/assets/remotion-template

# Validate props before rendering
node scripts/validate-props.mjs props.json
node scripts/validate-props.mjs video.props.json --video

# Render image still (4x scale)
npm run image

# Render video reel (2x scale with music)
npm run video

# Verify outputs
node scripts/verify.mjs image out/image.png
node scripts/verify.mjs video out/video.mp4

# Check brand synchronization
npm run brand:check
```

## Social Media Scheduling (Buffer & Cloudflare)

Configured for Adnan Qasim (`adnanqasim5226@gmail.com`):
- **Instagram Channel ID**: `6acb15d4778b240e2fd2d137` (`@adnan31272026`)
- **TikTok Channel ID**: `6acb17e7778b240e2fd2dfe2` (`@adnan__5226`)

To run:
```bash
cd automation/social-scheduler
npm run channels                                 # List connected channels
node scheduler.mjs check content/restaurant-launch.json        # Offline validation
node scheduler.mjs run   content/restaurant-launch.json        # Dry-run staging
node scheduler.mjs run   content/restaurant-launch.json --live # Deploy & schedule live in Buffer
```

## Directory Structure

```
.claude-plugin/marketplace.json        Marketplace manifest
plugins/studio/restaurant-studio/      Restaurant studio plugin
  commands/                            Slash commands (/image, /video, /menu-post, /dish-reel, /deal-post)
  skills/restaurant-studio/            Skill definitions & prompt instructions
  assets/remotion-template/            Remotion React rendering engine
shared/brand/                          Gourmet palette & restaurant profile tokens
automation/social-scheduler/           Buffer & Cloudflare Pages automated publisher
output/                                Generated food cards, reels, and captions
```

MIT Licensed.
