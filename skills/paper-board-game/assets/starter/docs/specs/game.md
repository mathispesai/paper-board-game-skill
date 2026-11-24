# {{GAME_NAME}}

Status: draft · v0.1 · {{DATE}} · {{DESIGNER}}

<!-- Write this spec in the designer's language. Keep every section, even when short. Criteria use SHALL / WHEN … THE … SHALL,
     each with an ID that tests, tasks and commits reference. Put the designer's name and date after a decision they made. -->

## Problem
Who plays, where, when, and why a self-made game. What must it feel like?

## Players
- Number of players, also the variants (one absent, one extra). Team setups (e.g. 3-3-2, 3-2-2, 3-3-3).
- Around one table? Drinking or another real-world input at their own pace?
- Who makes everything, and does the maker play along?

## Glossary
- **Word**: the one word used on paper for it (and the words that are never used).

## Goals
- G-1: Fully physical. No screen, no app, no game master.
- G-2: The core loop in one sentence. One score.
- G-3: Length: fixed rounds or an agreed end time. The game stays open: the leader 2 rounds before the end does not win too often (SIM-2).
- G-4: (real-world input) helps, but someone who does much more of it does not win automatically.
- G-5: A simulation in code guards fairness, length, interaction and "stuck".
- G-6: The board stays clear: few pieces, big text.
- G-7: As few rules and exceptions as possible.
- G-8: Interaction between teams, and every interactive action has a cost or a limit (see SIM-6).

## Non-goals
- No app during play. No drinking rules inside the game (if relevant). Whatever the designer cut, with the date.

## Acceptance criteria

### Round (RND)
- RND-1: EVERY round SHALL run in this order: …
- RND-2: The turn order SHALL be read from the board: …

### Takeover / interaction (OVR)
- OVR-1: In its turn a team SHALL be allowed to attack … at most N times per turn, WHEN …
- OVR-2: A failed attack SHALL cost … (never free: free + unlimited turns rounds into aimless attacks).

### End (END)
- END-1: …
- END-2: Tie: …

### Cards (KAA)
- KAA-1: Every card SHALL … (one effect, no exceptions, ties hit every tied team).

### Material (MAT)
- MAT-1: Board size and who prints it. MAT-2: Cards (size, bleed, backs). MAT-3: Money (notes per value). MAT-4: Team aid and booklet.
- MAT-5: A material list SHALL follow from the sims (pieces per colour = max per team + 2, money = max in circulation × 1.25).
- MAT-6: Everything players see SHALL be {{LANGUAGE}}, house style: …
- MAT-7: Team colours SHALL be distinguishable with colour blindness, and a team is also recognisable by name and shape.

### Simulation (SIM)
- SIM-1: The sims SHALL warn WHEN the win % per start position (or team size) falls outside … %.
- SIM-2: The sims SHALL warn WHEN the leader 2 rounds before the end wins more than … %.
- SIM-3: The sims SHALL warn WHEN in more than … % of games a team can do nothing 2 turns in a row.
- SIM-4: (real-world input) The sims SHALL test a heavy and a light pace and warn WHEN the heavy team wins more than … %.
- SIM-5: Every game SHALL end within … rounds.
- SIM-6: The sims SHALL show attacks per round, failed attacks per round, the share of actions that are attacks and how often the same target is attacked again, and warn above the limits in `SIM.limits.attack`.

### Data and print files (DAT)
- DAT-1: All numbers and texts SHALL live in `src/data.js`, used by sims and print files.
- DAT-2: Print files SHALL be made from HTML by a script. The print shop gets CMYK PDFs; a check fails on RGB or a wrong size.

## Edge cases
- E-1: …

## Constraints
- Deadline: print shop on {{PRINT_DATE}}, game on {{EVENT_DATES}}. Rules freeze on {{FREEZE_DATE}} (after that: typos only).
- Production: home printer (…), print shop (…), 3D printer (…).

## Design
The round in short, and a table of decisions:

| Decision | Reason |
|---|---|

## Uncertainties and prototypes
- P-1 Time model: a test game with a stopwatch.
- P-2 Readability: a piece of the board at full size, read from 1.2 m.
- P-3 Print shop: CMYK, bleed, card size, one recto-verso PDF?

## Verification
| Check | How | Covers |
|---|---|---|
| Rules engine | `npm test` | RND, OVR, END, KAA |
| Balance | `node scripts/balance.mjs` | SIM-* |
| Print files | `npm run print` | MAT-1, MAT-2, DAT-2 |
| House style | `test/texts.test.js` | MAT-6 |

Manual: proof print at home, a test game with a stopwatch, proofreading every text.

## Open questions
| Question | Decide by | How |
|---|---|---|

## Iteration log
| Version | Date | What |
|---|---|---|
| v0.1 | {{DATE}} | Spec interview |
