# Daily Micro Games 🎮

Ein neues Micro-Game jeden Tag — spielen, bewerten, genießen.

**Live:** https://games.lab.gogerl.com

## Projektstruktur

```
daily-games/
├── dashboard/          # Node.js Server + Dashboard UI
│   ├── app.js          # HTTP Server (API + statische Files)
│   ├── server.js       # Entry point (port 3000)
│   ├── store.js        # Game-Daten lesen/schreiben (JSON)
│   ├── data.json       # Spiele-Datenbank (lokal + Source of Truth)
│   ├── public/         # Dashboard HTML/CSS/JS
│   └── test/           # Dashboard Tests
├── games/              # Alle Spiele
│   └── day-NNN-name/   # Ein Spiel pro Ordner
│       ├── index.html  # Spiel (single-file, inline CSS/JS)
│       ├── logic.js    # Spiellogik (ES module, testbar)
│       └── logic.test.js
├── shared/             # Geteilte Module
│   └── i18n.js         # Mehrsprachigkeit (de/en/it/es/fr)
├── Dockerfile
└── package.json
```

## Neues Spiel erstellen & deployen

### 1. Spielordner anlegen

```bash
mkdir games/day-NNN-name
```

Nächste Day-Nummer vergeben (aufsteigend). Name: kurz, kebab-case.

### 2. Spiel bauen

Jedes Spiel besteht aus:
- **`logic.js`** — Reine Spiellogik (ES module exports, keine DOM-Abhängigkeiten)
- **`logic.test.js`** — Tests für die Logik (bun:test)
- **`index.html`** — Komplettes Spiel (inline CSS + JS, importiert logic.js)

#### Regeln:
- Single-file HTML, keine externen Dependencies
- Dark Theme: `--bg: #0a0a1a`, `--surface: #151530`, `--border: #2a2a4a`
- Accent-Gradients: `#ff4444`, `#ff8c00`, `#ffd700`
- `<script src="/shared/i18n.js">` für Mehrsprachigkeit (5 Sprachen)
- Back-Link zu `/` oben links
- Mobile-friendly, Touch-Support
- TDD: Tests zuerst schreiben!

### 3. Tests laufen lassen

```bash
bun test games/day-NNN-name/
```

### 4. In data.json eintragen

`dashboard/data.json` ist die Spiele-Datenbank. Neues Spiel **vorne** einfügen (neueste zuerst):

```json
{
  "id": "day-NNN-name",
  "name": "Anzeigename",
  "date": "2026-MM-DD",
  "tags": ["puzzle", "single-player"],
  "ratings": [],
  "name_de": "Deutscher Name",
  "name_en": "English Name",
  "name_it": "Nome Italiano",
  "name_es": "Nombre Español",
  "name_fr": "Nom Français",
  "description": "Kurzbeschreibung (deutsch)",
  "description_de": "...",
  "description_en": "...",
  "description_it": "...",
  "description_es": "...",
  "description_fr": "...",
  "howToPlay": "Spielanleitung",
  "whyFun": "Was macht es spaßig?"
}
```

### 5. Auf den Server deployen

```bash
# Spiel-Dateien hochladen

# data.json hochladen (Server liest aus Volume)

# Container neustarten
```

### 6. Committen

```bash
git add -A && git commit -m "Add Day NNN - Name"
```

## Lokal entwickeln

```bash
bun dashboard/server.js
# → http://localhost:3000
```


## Server-Setup

- Container: `daily-games` auf lab.gogerl.com (Traefik-Netzwerk)

## Tests

```bash
bun test                          # Alle Tests
bun test games/day-NNN-name/      # Ein Spiel
bun test dashboard/test/          # Dashboard
```
