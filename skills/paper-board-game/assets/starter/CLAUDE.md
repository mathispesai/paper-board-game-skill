# {{GAME_NAME}}: context for Claude

Paper board game for {{GROUP}}, played on {{EVENT_DATES}}. Print files go to the print shop on **{{PRINT_DATE}}**. Rules freeze the day before: {{FREEZE_DATE}}. Made with the `paper-board-game` skill.

**The spec is the source of truth:** `docs/specs/game.md` (criteria IDs like RND-2, SIM-6) and `docs/specs/game.tasks.md` (task IDs T-…). Reference IDs in commits. A spec change goes in the same commit as the code that needs it, with a row in the iteration log.

## Progress tracking (always, in the same commit as the work)
- Set the task's **Status** (✅ date + commit · 🟡 partly, say what is left · ⬜ open · ⛔ blocked, say on what).
- Update the **Current state** line (date, tasks done, test count, what's next).
- Add a row at the top of the **Log**: date, task(s), commit, what was done, tests, what stayed open or was decided (incl. the designer's choices).
- Keep **What {{DESIGNER}} still has to do** in sync.

## Hard requirements from {{DESIGNER}}
- Fully physical game: no app or helper page during play, no game master.
- Everything players see is {{LANGUAGE}} ({{TONE}}). Code comments are English.
- House style: {{HOUSE_STYLE}} (tested in `test/texts.test.js`, listed in `HOUSE_STYLE` in `src/data.js`).
- Only the current rules live in the code. Try a rule change with `CONFIG='{...}' node scripts/balance.mjs` (or several with `scripts/tune.mjs`) first.
- Before bigger choices, ask {{DESIGNER}} enough questions to agree on the direction first.
- Clarity above all: few pieces, big text, everything findable on the board or the team aid.

## Architecture
- Plain ES modules, Node ≥ 20, no build step, `node --test`. Only dev dependency: Playwright (PDF rendering). New PC: `npm install`, then `npm run browser`. CMYK needs Ghostscript (`gs` / `gswin64c`, or `GS=<path>`).
- `src/data.js`: **single source** for every number and text. Sims and print files both read it (DAT-1). Never hard-code a number in a print template.
- `src/engine.js`: pure rules engine; dice and deck order come in as data.
- `src/bot.js`, `src/sim.js`, `src/stats.js`: bots with styles, one seeded game, summaries and the SIM warnings.
- `src/rules.js`: rule texts for the aid, board and booklet (numbers from data.js).
- `print/`: HTML sources per print file, `print/render.mjs` (PDF + PNG preview), `print/cmyk.mjs` (Ghostscript), `src/pdfcheck.js` (no RGB, right size).
- `scripts/print-all.mjs` (`npm run print`): every PDF, CMYK for the shop, check. `scripts/balance.mjs` (`REPORT=1` writes `docs/balance.md`, replace it), `scripts/tune.mjs`.
