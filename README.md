# 🎵 LastFM MyCharts 📊

> 🌐 **Live Website:** **[https://gentner-adesso.github.io/lastfm-mycharts/](https://gentner-adesso.github.io/lastfm-mycharts/)**

A modern web application delivering in-depth music statistics and high-resolution album cover collages for the Last.fm profile of **[Sebastiangentner](https://www.last.fm/user/Sebastiangentner)**.  
Built with a sleek **dark Neumorphic UI** featuring pitch black, deep gray, crisp white, and Last.fm-crimson red! 🖤⚪🔴

---

## 🚀 Quick Start — Start the App Locally

Open your terminal in this repository and run:

```bash
npm run dev
```

If you haven't installed dependencies yet, run once:

```bash
npm install
```

Once the development server is running, open the app in your browser:

👉 **[http://localhost:5173/](http://localhost:5173/)** 🌐

---

## 📜 Available Commands

| Command | Description |
|---|---|
| `npm run dev` ⚡ | Starts the local development server with instant Hot Module Replacement (HMR) |
| `npm run build` 📦 | Compiles TypeScript and creates an optimized production build in `dist/` |
| `npm run preview` 👀 | Locally previews the production build |

---

## 🔑 Configuration & API Token

The Last.fm API Token is kept safe via environment variables (locally in `.env.local` and in production via GitHub Actions Secrets). It is **never** committed in plain text to the repository:

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Set your credentials in `.env.local`:
   ```env
   VITE_LASTFM_API_KEY=your_api_key_here
   VITE_LASTFM_SHARED_SECRET=your_shared_secret_here
   VITE_LASTFM_USER=Sebastiangentner
   ```

---

## ✨ Features

- 🌐 **Bilingual Support (English Default & German)**:
  - Instant one-click language switcher (`EN` / `DE`) in the navigation bar.
- 🖼️ **Top Albums Collage Generator**:
  - **Custom Time Periods**: 7 Days, 1 Month, 3 Months, 6 Months, 12 Months, Overall (All-Time) ⏳
  - **Grid Formats**: 3×3 (9 albums), 4×4 (16 albums), 5×5 (25 albums), 2×2, 3×4, 4×5 📐
  - **Tile Spacing**: Seamless (0px), Compact (8px), Wide (16px) 🎛️
  - **Custom Overlays**: Toggle album & artist titles, scrobble play counts, and rank badges (`#1`, `#2`...) 🏷️
  - **High-Res PNG Export**: One-click instant high-resolution download rendered on an HTML5 canvas 💾
- 📊 **In-Depth Listening Habits & Charts**:
  - **Veteran Profile**: Scrobbling since December 2003 (over 22 years of music history!) 🏆
  - **Milestone Tracker**: Visual progress gauge towards the next 10,000 scrobble milestone 🎯
  - **Velocity Stats**: Average scrobbles per day, total non-stop listening time in hours and days (~467+ days) ⏱️
  - **Rankings**: Interactive leaderboards for Top Artists and Top Tracks with glowing crimson proportion bars 📈
  - **Dominance Metric**: Percentage of all-time listening concentrated in your Top 10 artists 🎸
- 🔴 **Now Playing & Live Stream**:
  - Real-time indicator with animated equalizer bars when listening, or relative timestamp since last track 🎧
  - Chronological recent scrobbles feed with album covers and direct Last.fm links 📻
- 🌌 **Visual Aesthetics**:
  - Multi-layer GPU-accelerated **parallax background** with drifting vinyl grooves and crimson nebula glows 🪐
  - Tactile Neumorphism with high-contrast shadows, sunken insets, and embossed crimson buttons 🖲️

---

Enjoy exploring your charts! 🎸🔥
