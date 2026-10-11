# Naye Computer Par (Pehle Yeh Parhein)

Yeh marketplace **Zaiqa Lounge & Grill** restaurant (Owner: **Adnan Qasim**, Karachi) ke liye banayi gayi hai.

1. Folder ko kahin bhi extract karein.
2. `setup.cmd` par double-click karein. Yeh Node.js aur ffmpeg check karega, Remotion packages install karega, aur Buffer se aapke channels verify karega.
3. Claude Code me install karne ke liye:
   ```
   /plugin marketplace add <is-folder-ka-path>
   /plugin install restaurant-studio@restaurant-marketplace
   ```

## Buffer & Social Media Integration

- **Email**: `adnanqasim5226@gmail.com`
- **Buffer API Key**: `automation/social-scheduler/.env` me pehle se set hai.
- **Instagram**: `@adnan31272026` (Connected)
- **TikTok**: `@adnan__5226` (Connected)
- Channels check karne ke liye:
  ```bash
  cd automation/social-scheduler
  npm run channels
  ```

## Restaurant Content & Commands

- `/menu-post Royal Dum Biryani` — Lazeez Dum Biryani ka 4x Ultra-HD food card aur caption banaye ga.
- `/dish-reel Sizzling Shinwari Karahi` — 1080x1920 vertical video reel music ke sath banaye ga.
- `/deal-post Weekend Platter Deal` — Family combo aur discount platter ka graphic banaye ga.
- `/image <dish-name>` — Kisi bhi dish ka Ultra-HD food card banaye ga.
- `/video <dish-name>` — Kisi bhi dish ki reel banaye ga.

Tamam images aur videos aapke computer par locally Remotion ke zariye render hoti hain aur `output/` folder me save hoti hain.
