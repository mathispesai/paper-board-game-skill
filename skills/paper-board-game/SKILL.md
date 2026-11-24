---
name: paper-board-game
description: Design and produce a fully physical, home-made board or party game with code behind it - a spec with criteria IDs, one data file for every number and text, a pure rules engine with bots and seeded simulations that check balance and interaction, and print-ready files (board, cards, money, team aid, booklet) rendered from HTML to PDF and converted to CMYK with automatic checks. Use this whenever someone wants to make their own board game, card game, drinking or party game for a friend group, club, youth movement or event, wants to print a game at a print shop, balance or playtest game rules with simulations, or says things like "zelfgemaakt bordspel", "spel voor ons weekend", "kaarten laten drukken", "spelregels uitbalanceren", even when they don't mention code.
---

# Paper board game

You help a designer (often a friend making a game for their group) build a game that is **fully physical at the table** - board, cards, paper money, pieces, no app and no game master - while everything behind it is code: the rules, the balance and the print files. The quality bar: every number on paper comes from one data file, every rule change is tried in simulations first, and the print shop gets checked CMYK files.

This workflow was distilled from a real game that went from idea to a printed A1 board, 72 cut cards, 3D-printed pieces and a played weekend in three weeks. `references/lessons.md` holds what that game taught; read it before you propose rules.

## How to work with the designer

- **Ask before every bigger choice.** The designer knows the group; you know the numbers. Before a new mechanic, a cut, a new print file or a change to the end condition, ask enough questions to agree on the direction (with AskUserQuestion when available), offer 2-3 options with what the sims say about each, and let them choose. Record the choice with name and date in the spec.
- **Clarity above all.** Few pieces on the board, big text, one score, as few exceptions as possible. A rule that needs a sentence of exception is a rule to question. When in doubt, cut.
- **Player text is in the group's language and tone** (ask for it, and for their house style: words they never use, punctuation, how they say "first place"). Code, comments and commit messages stay English.
- **Report honestly.** Say which warnings the sims still give, what you did not test, what only a test game can show (bots do not trade or bluff).

## Phases

Work back from the event date. The print shop needs files a few days before the event (ask how many); the rules freeze the day before that. Put both dates in the spec and the CLAUDE.md.

### 1. Interview and spec
Run the interview in `references/interview.md` (players and team setups, event and print dates, real-world input such as drinking, what can be produced, language and house style, colour blindness, what must not be in the game). Then write `docs/specs/game.md` from the template: goals G-, non-goals, acceptance criteria with IDs per area (RND, OVR, END, KAA, MAT, SIM, DAT), edge cases E-, prototypes P-, verification table, iteration log. Write the task list `docs/specs/game.tasks.md` next to it. Both are the source of truth from now on. Details: `references/spec-and-tasks.md`.

### 2. Repo from the starter
Copy the starter: `node <this skill>/scripts/new-game.mjs <target-dir> "<Game name>"`. It contains a small working example game (claim towns, take them over with dice) with engine, bots, sims, warnings, board, cards, team aid, the print pipeline and 20 tests. Run `npm install`, `npm run browser`, `npm test`, then replace the example game step by step with the real one, keeping the shape. Fill in the placeholders in `CLAUDE.md`. Make it a git repo (private on GitHub if they like) and commit with task IDs in the messages.

### 3. Data and engine
- `src/data.js` is the **single source**: map, prices, cards, team colours, print sizes, house style, sim limits. A number that appears in a print template or a rule text is read from here.
- `src/engine.js` is **pure**: state in, action in, new state out. Randomness (dice, deck order) comes in as data, so tests can script exact throws and the rule booklet's worked examples can be played in a test.
- Only the **current** rules live in the code. When a rule is dropped, delete it (git keeps it). Flags for old variants rot.
- One test (or more) per acceptance criterion, named after it.

### 4. Bots, simulations, balance
Bots play sensibly with a per-team style (aggressive, careful, reckless); the sims run thousands of seeded games on several tables (a normal mix, a pushy table, a careful table) and print warnings tagged with the spec ID. Measure **fairness** (win % per start position and team size), **openness** (does the leader 2 rounds before the end win too often?), **stuck** teams, the **real-world input** (does heavy drinking win automatically?) and **interaction health**: how often an interactive action is used, how often in vain, how often against the same target. Then **material** (pieces per colour, money to print) follows from the same sims.

Every rule change: try it with `CONFIG='{...}' node scripts/balance.mjs` or several side by side with `scripts/tune.mjs`, show the designer the table, let them choose. Keep one current report (`REPORT=1` → `docs/balance.md`), replace it each time. Details and what to watch: `references/balance.md`.

### 5. Print files
HTML per print file (board as SVG, cards one per page with bleed, team aid A4 per team, booklet), rendered to PDF with Playwright, print-shop files converted to CMYK with Ghostscript, then a check that fails on RGB, a wrong page size or a wrong page count. `npm run print` does it all. **Look at the PNG previews every time** (Read the image): text running off the page, names crossing roads and overlapping labels are not caught by tests. Details (bleed, card sizes, recto-verso, colour blindness, fonts, home vs shop): `references/print.md`.

### 6. Rule texts
Team aid (one A4 per team, both sides, everything needed during play) and a short booklet with worked examples. Texts live in `src/rules.js` and read their numbers from data.js. Play each worked example through the engine in a test, so the booklet cannot drift from the rules. Test the house style (`test/texts.test.js`).

### 7. Proof, test game, freeze, deliver
A full-size proof print of a piece of the board (read it from 1.2 m), a test game with the real group and a stopwatch, fixes, then **freeze** the rules. Deliver to the print shop with their exact wishes (they may ask for one recto-verso PDF, a different card size, bleed). After the freeze, anything that changes on already printed material gets a sticker, not a reprint.

### 8. After the event
Ask what worked and what did not, log it in the task list, and turn general lessons into `references/lessons.md` of this skill (or tell the designer to share them back), so the next game starts smarter.

## Progress tracking (every commit)
The task list is where the designer sees what is done. In the same commit as the work: set the task's status (✅ date + commit, 🟡 what is left, ⬜, ⛔ on what), update the "Current state" line (date, tasks done, test count, next), add a row on top of the log (what, tests, what the designer decided), keep "What <designer> still has to do" current. A spec change goes in the same commit as the code that needs it, with a row in the iteration log.

## Reference files
- `references/interview.md` - the intake questions, in order.
- `references/spec-and-tasks.md` - how to write criteria, the task list and the log.
- `references/balance.md` - what the sims measure, the limits, how to tune, bot design.
- `references/print.md` - print production: sizes, bleed, CMYK, checks, home printing, pieces.
- `references/lessons.md` - lessons from a played game, including why free unlimited attacks ruin a round.
- `assets/starter/` - the starter project (copied by `scripts/new-game.mjs`).
