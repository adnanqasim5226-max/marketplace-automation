# Zaiqa Lounge & Grill — Social Scheduler

Takes finished restaurant studio renders from `output/` and schedules them on Instagram and TikTok through Buffer. Buffer accepts media by public URL, so each file is hosted on Cloudflare Pages (free, fast CDN).

```
restaurant render (output/) -> platform copy (out/) -> publish/ -> Cloudflare Pages -> Buffer -> Instagram & TikTok
```

## Setup & Channels

1. **Buffer API**: Key and channels for Adnan Qasim (`adnanqasim5226@gmail.com`) are configured in `.env`.
2. **Connected Channels**:
   - **Instagram**: `@adnan31272026` (`6acb15d4778b240e2fd2d137`)
   - **TikTok**: `@adnan__5226` (`6acb17e7778b240e2fd2dfe2`)
3. Test channels anytime:
   ```bash
   node scheduler.mjs channels
   ```

## Weekly / Campaign Scheduling

Write a plan in `content/`, e.g. `content/restaurant-campaign.json`:

```json
{
  "utcOffset": "+05:00",
  "posts": [
    {
      "id": "dum-biryani-photo",
      "at": "2026-10-15 13:00",
      "kind": "photo",
      "media": "../../../output/dum-biryani.png",
      "caption": "../../../output/dum-biryani.caption.md",
      "to": ["instagram"]
    },
    {
      "id": "shinwari-karahi-reel",
      "at": "2026-10-15 20:00",
      "kind": "reel",
      "media": "../../../output/shinwari-karahi.mp4",
      "caption": "../../../output/shinwari-karahi.caption.md",
      "to": ["instagram", "tiktok"]
    }
  ]
}
```

```bash
node scheduler.mjs check content/restaurant-campaign.json        # offline checks
node scheduler.mjs run   content/restaurant-campaign.json        # dry run, scales copies
node scheduler.mjs run   content/restaurant-campaign.json --live # deploys to Pages and schedules in Buffer
```
