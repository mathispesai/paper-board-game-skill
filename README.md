# paper-board-game

A Claude skill for making a **fully physical, home-made board game** (for your friends, club or event) with code behind it:

- a **spec** with criteria IDs and a **task list** with a log, so you always see what is done;
- **one data file** for every number and text, read by both the simulations and the print files;
- a **pure rules engine**, **bots** with play styles and **seeded simulations** that warn when the game is unfair, closes too early, gets stuck, or when an interactive action (like attacking) is overused or repetitive;
- **print-ready files** (board, cards with bleed in one recto-verso PDF, team aid per team) rendered from HTML to PDF, converted to **CMYK** with Ghostscript, and checked for size and leftover RGB;
- a **starter project**: a small, working example game with 20 tests that you replace step by step with yours.

At the table it is all paper: no app, no game master.

## Install

### Claude Code
```
/plugin marketplace add mathispesai/paper-board-game-skill
/plugin install paper-board-game@paper-games
```
Then just say what you want: *"I want to make a board game for our weekend in March, 9 players in 3 teams"*. The skill starts with an interview.

### Claude.ai (web or app)
Download `skills/paper-board-game` as a zip (or the zip from the releases) and add it under **Settings → Capabilities → Skills**. The starter code needs a computer to run (Node ≥ 20), so the full workflow works best in Claude Code.

## What you need on your computer
- Node.js 20 or newer
- `npm install` and `npm run browser` in the new game folder (Playwright + Chromium make the PDFs)
- [Ghostscript](https://ghostscript.com/releases/gsdnld.html) for the CMYK files for the print shop

## Start a new game by hand
```
node skills/paper-board-game/scripts/new-game.mjs ../my-game "My Game"
cd ../my-game
npm install && npm run browser
npm test
node scripts/balance.mjs 500
npm run print
```

## What is inside
```
skills/paper-board-game/
  SKILL.md                 the workflow in 8 phases
  references/              interview, spec and tasks, balance, print production, lessons from played games
  scripts/new-game.mjs     copies the starter into a new folder
  assets/starter/          the starter project (engine, bots, sims, print pipeline, tests, spec templates)
```

## Lessons
`references/lessons.md` collects what real games taught. The first one: an attack that costs nothing when it fails and has no limit per turn fills the round with aimless attacks, even when the win rates look fair. Played a game made with this skill? Add your lessons there (pull requests welcome).

## Credits
Font-free starter; bring your own OFL fonts. Map data in your own game may come from [Natural Earth](https://www.naturalearthdata.com/) (public domain).

MIT licence.
