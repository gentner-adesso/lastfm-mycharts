# 🎵 LastFM MyCharts 📊

> 🌐 **Live Website:** **[https://gentner-adesso.github.io/lastfm-mycharts/](https://gentner-adesso.github.io/lastfm-mycharts/)**

Eine moderne Web-App für detaillierte Musikstatistiken und Album-Cover-Collagen für den Last.fm-Nutzer **[Sebastiangentner](https://www.last.fm/user/Sebastiangentner)**.  
Entwickelt im schicken **Neumorphismus-Stil** in den Farben Schwarz, Grau, Weiß und Last.fm-Crimson-Rot! 🖤⚪🔴

---

## 🚀 Schnellstart — Befehl zum Starten (Lokal)

Öffne ein Terminal in diesem Projektordner und führe folgenden Befehl aus:

```bash
npm run dev
```

Falls die Abhängigkeiten noch nicht installiert sind, führe vorher einmalig aus:

```bash
npm install
```

Sobald der Server läuft, öffne die Seite im Browser:

👉 **[http://localhost:5173/](http://localhost:5173/)** 🌐

---

## 📜 Alle verfügbaren Befehle

| Befehl | Beschreibung |
|---|---|
| `npm run dev` ⚡ | Startet den lokalen Entwicklungs-Server mit Hot-Reloading |
| `npm run build` 📦 | Erstellt den optimierten Production-Build |
| `npm run preview` 👀 | Vorschau des erstellten Production-Builds |

---

## 🔑 Konfiguration & API Token

Das Last.fm API Token wird sicher über Umgebungsvariablen (`.env.local` lokal bzw. GitHub Secrets online) verwaltet und ist **nicht** im Klartext im Code hinterlegt:

- Kopiere `.env.example` zu `.env.local`:
  ```bash
  cp .env.example .env.local
  ```
- Trage dein API Token und deinen Benutzernamen in `.env.local` ein:
  ```env
  VITE_LASTFM_API_KEY=dein_api_key
  VITE_LASTFM_USER=Sebastiangentner
  ```

---

## ✨ Features

- 🖼️ **Top-Alben Collagen-Generator**:
  - Zeiträume: 7 Tage, 1 Monat, 3 Monate, 6 Monate, 12 Monate, Gesamt (All Time) ⏳
  - Raster: 3×3, 4×4, 5×5, 2×2, 3×4, 4×5 📐
  - Optionen für Albumtitel, Scrobble-Counts, Platzierungsnummern und Abstände 🎛️
  - **High-Res PNG-Download** auf Knopfdruck 💾
- 📊 **Detaillierte Statistiken**:
  - Profil-Veteranen-Status (seit Dezember 2003, über 22 Jahre Mitglied!) 🏆
  - Durchschnittliche Scrobbles pro Tag & Meilenstein-Fortschrittsbalken 🎯
  - Ranglisten der Top-Künstler & Top-Tracks mit interaktiven Balken 📈
- 🔴 **Now Playing & Live-Status**:
  - Echtzeit-Anzeige des aktuell laufenden Songs inklusive animiertem Equalizer 🎧
- 🖤 **Design**:
  - Plastischer Neumorphismus mit taktilen Buttons, tiefem Schwarz und intensivem Rot 🖲️

---

Viel Spaß beim Entdecken deiner Charts! 🎸🔥
