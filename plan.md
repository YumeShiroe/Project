# Project 4: Game — Plan

**Working title:** TBD
**Engine:** Phaser 3 (plain HTML / CSS / JavaScript, no frameworks)
**Deadline:** 20 days (Day 1 = Sun 4 Oct 2026, Day 20 = Fri 23 Oct 2026)
**Target:** 40 points (cap). 20 needed to pass.

---

## 1. Concept

You are a young mycologist in a fantasy world. Your family was once rich, but after your father passed away the whole fortune went into treating your mother, who is now in a **Hollow State**, neither dead nor alive. Keeping her stable costs money, and her condition worsens every day, so the cost keeps rising.

You work as a fungi supplier: you go on expeditions, gather fungi, fill bounties at the guild and sell valuables. The only real cure is the legendary **Glimpse of Hope**, a venerable fungus said to grant its finder's deepest wish. It grows on **Venerable Peak**, which is sealed behind a stone door that opens only when enough fungi are offered.

The family's last heirloom, the **River of Time** fungus, rewinds time to the morning whenever you faint on an expedition.

- **Start:** at home on the mountain, with mom in the Hollow State and the first payment due.
- **End (win):** open the Peak's door, find the Glimpse of Hope and cure mom.
- **End (lose):** fail to pay mom's care costs within the allowed number of days.

---

## 2. Core loop

```
Morning at home
   → travel to Human Fortress (check bounties, buy/sell)
   → go on an expedition (Hazy Forest / Deep Farland / Venerable Peak)
   → gather fungi, use abilities, avoid enemies and hazards
   → return before the day ends
   → sell / complete bounties
   → go home, pay mom's daily cost, sleep → next day (cost rises)
```

Fainting during an expedition: the River of Time rewinds to the morning of the **same day**. You lose everything gathered that day, but the day counter does not increase.

---

## 3. Maps

| Map | Type | Contents |
|---|---|---|
| **Home** (mountain) | Hub | Mom's bed, sleep / end day, pay daily cost |
| **Human Fortress** | Hub | Guild bounty board, fungi shop (buy and sell), path to regions |
| **Hazy Forest** | Expedition 1 | Mostly normal fungi, rare fairy fungi. Goblins, hostile animals |
| **Deep Farland** | Expedition 2 | Normal fungi plus a higher fairy chance. Swamp with drifting logs (moving parts) |
| **Venerable Peak** | Expedition 3 / finale | High fairy rate. Sealed stone door (fungi offering). Crumbling paths and falling rocks. Glimpse of Hope behind the door |

All maps are built in **Tiled** using layers: `ground`, `collision`, `objects`, `above` (canopies and rooftops drawn over the player). Sprites are y-sorted with `setDepth(y)`.

---

## 4. Fungi

### Normal (ranks 1–5)
| Fungus | Type | Effect |
|---|---|---|
| Swift | Active | Speed boost for a short time |
| Luminous | Passive | Night vision (see in dark areas and at night) |
| Stonehide | Passive | Damage resistance *(stretch)* |
| Force | Active | Fires an air blast that stuns enemies (aimed with the mouse) |
| Bronze / Silver / Gold | Valuable | No effect, sells for money |

### Fairy (ranks 6–8)
| Fungus | Type | Effect |
|---|---|---|
| Regeneration | Active | Restores hearts |
| Protection | Passive | Shield that blocks one hit, then expires |
| Projection | Active | Hologram decoy that enemies chase *(stretch, build last)* |
| Blitz | Active | Short-distance dash (aimed with the mouse) *(stretch)* |
| Diamond / Ruby | Valuable | No effect, high money value |

### Venerable (rank 9)
| Fungus | Effect |
|---|---|
| Glimpse of Hope | Grants your deepest wish. Cures mom and ends the game |

### Heirloom (not collectable)
| Fungus | Effect |
|---|---|
| River of Time | Passive. On fainting, rewinds to the morning of the same day |

Art note: the valuables are colour swaps of one or two base sprites (cheap to make).

---

## 5. Systems

### Day cycle
- Each day lasts a fixed amount of real time (around 5–6 min, to be tuned).
- The screen tint shifts toward night near the end of the day, and Luminous counters the darkness.
- When the day ends, the player must be home (or is sent home automatically).

### Mom's care cost (lose condition)
- A daily cost is charged when you sleep, and it **increases each day**.
- Unpaid costs accumulate as overdue.
- If overdue costs aren't cleared within a set number of days (e.g. 3, to be tuned), it's **game over**.
- The UI shows today's cost, the overdue amount and the days left before game over.

### Health and fainting
- Heart-based HP.
- At 0 hearts you faint, and the River of Time rewinds to the morning (that day's loot is lost, the day count is unchanged).

### Guild bounty board (Human Fortress)
- Lists requests: a specific fungus, a quantity and a reward.
- A few bounties are active at a time and refresh daily.

### Shop (Human Fortress)
- Sell valuables (bronze to ruby) and other fungi.
- Buy fungi, including ability fungi, at a markup.

### Inventory and hotbar
- An inventory of collected fungi.
- A hotbar with eat slots (keys 1–5 on PC, buttons on mobile).

### Venerable Peak seal
- The stone door needs an offering of enough fungi (amount and types to be tuned, e.g. X fairy fungi).
- Once opened, the path to the Glimpse of Hope is free.

### Enemies
- **Goblins:** throw rocks in an arc (fake height and a growing ground shadow). They only hit when the rock lands, so the player can dodge.
- **Hostile animals:** chase the player and deal contact damage.
- **Force** stuns enemies.
- A small amount of violence is accepted (the "no violence" 2 points are dropped on purpose).

### Real weather (Open-Meteo, no API key)
- Fetched once at game start, using browser geolocation with a default city as fallback.
- **Rain:** higher fungi spawn rates in Hazy Forest and Deep Farland, plus an in-game rain overlay.
- **Clear skies:** slightly better spawns on Venerable Peak.
- **Offline or API failure:** default weather is used.

### Scoreboard
- Stored in `localStorage`.
- Ranks players by **fewest in-game days to cure mom**. The player enters a name on winning.

---

## 6. Controls

| Action | PC | Mobile |
|---|---|---|
| Move | WASD / arrow keys | Virtual joystick (left) |
| Aim abilities (Force, Blitz) | Mouse | Tap a direction |
| Pick up / interact | Mouse click or E | Tap |
| Eat fungus | Keys 1–5 | Hotbar buttons |
| Pause / menu | Esc | Pause button |

Touch controls appear only on touch devices. One responsive codebase uses `Phaser.Scale.FIT`. Mobile plays in landscape.

---

## 7. Rubric mapping

### Game-specific (29 max)
| Feature | Pts | How |
|---|---|---|
| Clear plot, start and end | 2 | Mom's Hollow State → Glimpse of Hope (win) / missed payments (lose) |
| Name in scoreboard | 2 | `localStorage` scoreboard, fewest days |
| Different objects to collect | 1 | 14 fungi types |
| Moving parts (not player or enemies) | 2 | Drifting logs (Deep Farland), crumbling paths and falling rocks (Peak) |
| More than one map | 2 | 5 maps |
| Keyboard + mouse | 2 | WASD to move, mouse to aim Force / Blitz and to interact |
| Physics engine | 1 | Arcade physics, arcing rocks, falling rocks |
| Enemies that hurt | 2 | Goblins, hostile animals |
| Music + SFX | 2 | Background music per area, SFX for eating, abilities, hits, pickups |
| Touch screen | 2 | Joystick and hotbar buttons |
| Menus, settings, map scenes | 2 | Main menu, settings (volume, controls), map scenes |
| Transition effects | 1 | Camera fades between scenes |
| Data source | 3 | Open-Meteo weather affects spawns and visuals |
| Adaptive sounds | 2 | Music intensifies when chased or at low hearts |
| Adaptive graphics | 1 | Red vignette at low hearts, night tint, rain overlay |
| No violence | 0 | Dropped on purpose |
| **Subtotal** | **27** | |

### General (12 max)
| Feature | Pts | How |
|---|---|---|
| Well-written PDF report | 3 | 1–2 pages: what, tools, points claimed, user manual, AI declaration |
| Responsive (desktop + mobile) | 4 | Scale Manager plus touch controls |
| Works in Firefox, Safari, Edge, Chrome | 3 | Test all four. Audio starts after the first click or tap (Safari) |
| Clear directory structure | 2 | See section 8 |

### Own features (buffer, to justify in report)
- Day/night cycle with gameplay effect (Luminous)
- Rewind-on-faint mechanic (River of Time)
- Economy: bounties, buy/sell shop, escalating care cost
- Save/load progress in `localStorage` *(if time allows)*

**Estimated total:** 27 + 12 = 39, plus own features → aiming for the 40 cap.

### Penalties to avoid
- HTML, CSS and JS in one file: **−5**
- Not responsive: **−2**
- No report: **−30**
- Application doesn't work: **−30**
- Missing AI declaration: the work won't be graded

---

## 8. Directory structure

```
project/
├── index.html
├── README.md                # how to run + link to hosted game
├── lib/
│   └── phaser.min.js        # bundled locally, no CDN
├── css/
│   └── style.css
├── js/
│   ├── main.js              # Phaser config
│   ├── scenes/
│   │   ├── BootScene.js     # asset loading
│   │   ├── MenuScene.js
│   │   ├── SettingsScene.js
│   │   ├── HomeScene.js
│   │   ├── FortressScene.js
│   │   ├── HazyForestScene.js
│   │   ├── DeepFarlandScene.js
│   │   ├── VenerablePeakScene.js
│   │   ├── UIScene.js       # HUD: hearts, hotbar, clock, money
│   │   └── EndScene.js      # win/lose + scoreboard
│   ├── objects/             # Player, Goblin, Animal, Projectile, Fungus...
│   ├── systems/             # DayCycle, Economy, Inventory, Weather, Scoreboard
│   └── data/                # fungi definitions, bounty tables, balance values
├── assets/
│   ├── sprites/
│   ├── tilesets/
│   ├── maps/                # Tiled JSON
│   └── audio/
├── docs/
│   └── report.pdf
└── AI_USAGE.md              # running log for the AI declaration
```

Dev server: VS Code Live Server or `npx serve` (Tiled JSON and ES modules don't load over `file://`).

---

## 8b. Submission & "it works for the grader"

- **Submit via CodeGrade** (individual work, manually graded). The repo must contain the PDF report.
- **Risk: "Application does not work" = −30.** If the grader double-clicks `index.html`, Tiled maps and ES modules fail over `file://` and the game shows a blank screen. Mitigations:
  - Host the game on **GitHub Pages** (free, HTTPS) and put the link at the top of the report.
  - Also add run instructions to the report and a `README.md` (`npx serve` or Live Server).
- **Bundle Phaser locally** (`lib/phaser.min.js`) instead of loading it from a CDN, so the game doesn't depend on a third-party server.
- **Geolocation needs HTTPS or localhost.** GitHub Pages is HTTPS, and the default-city fallback covers players who deny permission.
- **Before submitting:** clone the repo fresh into an empty folder and run it from there, to catch missing or wrongly-cased asset paths (case matters on the grading server even if it doesn't on Windows/Mac).
- **Report wording in your own words.** Turnitin AI check applies to the PDF.
- Keep all content appropriate (−100 for inappropriate content).

---

## 9. Art

- 16×16 pixel art, hand-drawn without AI.
- One limited palette (from Lospec, 16–32 colours).
- Tools: Aseprite / LibreSprite / Pixelorama / Piskel for sprites, Tiled for maps.
- Player: 4-direction walk (draw down, up and side, then flip side). Fungi are static or have a 2-frame wobble.
- Third-party terrain packs (e.g. Kenney) are an option if time runs short. Credit them in the report and check that the course allows them.

---

## 10. Schedule

| Days | Dates | Goals |
|---|---|---|
| 1–2 | 4–5 Oct | Project setup, folder structure, Phaser config, palette, player sprite and movement |
| 3–5 | 6–8 Oct | Hazy Forest map in Tiled (layers, collisions, y-sort), fungi spawning, pickup, inventory, hotbar |
| 6–8 | 9–11 Oct | Home and Fortress hubs, scene transitions, day cycle, mom's cost and lose condition |
| 9–10 | 12–13 Oct | Guild bounty board, shop (buy/sell), money HUD |
| 11–13 | 14–16 Oct | Enemies (goblin arcing rocks, animals), hearts, fainting / River of Time rewind, core abilities (Swift, Luminous, Force, Regeneration, Protection) |
| 14–15 | 17–18 Oct | Deep Farland and Venerable Peak, moving parts, stone door offering, Glimpse of Hope ending, Open-Meteo integration |
| 16–17 | 19–20 Oct | Menus, settings, scoreboard, music, SFX, adaptive sound and graphics, transitions |
| 18 | 21 Oct | Touch controls, responsive testing on a phone |
| 19 | 22 Oct | Test in Firefox, Safari, Edge, Chrome. Balancing. Bug fixes |
| 20 | 23 Oct | PDF report (points justification, user manual, AI declaration), final submission |

**Stretch (only if ahead of schedule):** Stonehide, Blitz, Projection (last, because of decoy AI), save/load.

**If behind:** cut the stretch abilities first, then shrink Deep Farland, and use a terrain asset pack. Never cut the report or the browser testing.

---

## 11. Open tuning values

- Day length (real minutes)
- Mom's starting daily cost and how fast it grows
- Grace period before game over (days)
- Fungi spawn rates per region and weather
- Shop prices and bounty rewards
- Peak door offering requirement
- Hearts and enemy damage

---

## 12. Progress tracker

Legend: `[x]` done · `[~]` in progress · `[ ]` not started

### Phase 0 — Planning
- [x] Concept, story, maps, fungi, systems agreed
- [x] plan.md written

### Phase 1 — Setup & player (Days 1–2)
- [~] Folder structure created
- [ ] Git repo + GitHub repo created
- [ ] `index.html`, `css/style.css` in place
- [ ] Phaser bundled in `lib/`
- [ ] `main.js` config (pixelArt, Scale FIT) + BootScene running
- [ ] Palette chosen
- [ ] Player sprite (4-dir walk)
- [ ] Player movement (WASD/arrows)

### Phase 2 — First map & collecting (Days 3–5)
- [ ] Tileset drawn
- [ ] Hazy Forest map in Tiled (ground / collision / objects / above)
- [ ] Map loaded in Phaser, collisions working
- [ ] Y-sorting
- [ ] Camera follows player
- [ ] Fungi data file (`js/data/fungi.js`)
- [ ] Fungi spawning + pickup
- [ ] Inventory
- [ ] Hotbar + eating

### Phase 3 — Hubs & day loop (Days 6–8)
- [ ] Home scene
- [ ] Human Fortress scene
- [ ] Scene transitions (fades)
- [ ] Day cycle + night tint
- [ ] Mom's daily cost, overdue, lose condition

### Phase 4 — Economy (Days 9–10)
- [ ] Guild bounty board
- [ ] Shop (buy / sell)
- [ ] Money HUD

### Phase 5 — Danger & abilities (Days 11–13)
- [ ] Hearts / HP HUD
- [ ] Goblin (arcing rock + shadow)
- [ ] Hostile animal (chase)
- [ ] Fainting + River of Time rewind
- [ ] Swift
- [ ] Luminous
- [ ] Force (mouse aim, stun)
- [ ] Regeneration
- [ ] Protection

### Phase 6 — Remaining maps & data (Days 14–15)
- [ ] Deep Farland + drifting logs
- [ ] Venerable Peak + crumbling paths / falling rocks
- [ ] Stone door offering
- [ ] Glimpse of Hope ending
- [ ] Open-Meteo weather integration (+ fallback)

### Phase 7 — Polish (Days 16–17)
- [ ] Main menu
- [ ] Settings (volume, controls)
- [ ] End scene + scoreboard (localStorage)
- [ ] Music per area + SFX
- [ ] Adaptive music
- [ ] Adaptive graphics (low-HP vignette, rain overlay)

### Phase 8 — Mobile (Day 18)
- [ ] Virtual joystick
- [ ] Touch hotbar + tap aim
- [ ] Tested on a phone

### Phase 9 — Ship (Days 19–20)
- [ ] Tested: Firefox, Safari, Edge, Chrome
- [ ] Balancing pass
- [ ] Deployed to GitHub Pages
- [ ] Fresh-clone test
- [ ] README.md
- [ ] PDF report (points justification, user manual, AI declaration)
- [ ] Submitted to CodeGrade

### Stretch
- [ ] Stonehide
- [ ] Blitz
- [ ] Projection
- [ ] Save / load

---

## 13. AI usage log

Record every use in `AI_USAGE.md` as you go (tool, date, what for). For example:
- Claude (Anthropic): concept brainstorming, rubric analysis, drafting this plan.
