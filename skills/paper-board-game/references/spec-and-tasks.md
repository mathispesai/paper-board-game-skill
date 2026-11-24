# Spec and task list

Templates: `assets/starter/docs/specs/game.md` and `game.tasks.md`. Both are written in the designer's language.

## The spec
- **Status line**: `Status: draft · v1.3 · 2026-11-14 · <designer>`. Bump the version for every rule change and add a row to the iteration log (version, date, what changed with the criterion IDs).
- **Criteria** in EARS style with an ID per area:
  - `RND-4: The turn order SHALL be read from the board: the team with the most cafés starts, tie: the highest brewery, then clockwise.`
  - `OVR-3: WHEN the defender has no dice left, THE attacker SHALL pay the road price and THE café SHALL become the attacker's.`
  - Put the designer's name and the date after a choice they made: `(designer, 19 Nov)`. Later you will need to know why a rule is the way it is.
  - A dropped criterion keeps its ID: `Dropped: KAA-1 (titles), KAA-2 (hand cards).` Never reuse an ID.
- **SIM criteria** state the limits as numbers (`28 to 38 %`), so `src/stats.js` can check them and the warnings can quote the ID.
- **Design** section: the round in five lines, then a decision table (decision | reason, with sim numbers). This table is what you reread before proposing to undo something.
- **Prototypes** (P-): what only paper can answer (time per round, readability at 1.2 m, fit of a piece on the board).
- **Verification** table: check | how (command or test file) | which IDs it covers. Every ID should appear somewhere.

## The task list
- Header with the hard dates.
- **Current state**: one line, always current: date · what was just done · tasks done (x of y) · tests passing · next.
- Status legend: ✅ done (date + commit) · 🟡 partly (say what is left) · ⬜ open · ⛔ blocked (say on what).
- Task table: ID | status | task | who | due | verify (criterion IDs).
- **What <designer> still has to do**: concrete, with file paths and print settings ("print `print/out/aid.pdf` double-sided, flip on the long edge, actual size"). Remove items when done.
- **Log**, newest on top: date | task | commit | what was done | tests | open / decided (incl. the designer's choices and the sim numbers behind them). The commit hash of the work commit can go in with a small follow-up commit.

## Commits
- Task IDs in every message: `T-17: open end on an agreed time (END-1)`.
- Spec, tasks, code and regenerated reports in the same commit.
- Commit or push only when the designer is fine with it; never commit secrets.
