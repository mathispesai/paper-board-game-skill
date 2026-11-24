# Balance: bots, simulations, warnings

The sims do not make the game fun. They catch what a single test game cannot: a start position that wins 45 %, a team that gets locked in 1 game in 10, a rule that only works if everyone is polite, and how much material you need.

## Bots
- Sensible greedy play: take the best affordable option, attack when the expected gain is positive.
- A **style per team**: `aggression` (attack when worth it), `reckless` (attack even when not worth it), and if the game has it, `block` (cut off rivals, outbid the leader). Real groups contain all of these.
- **Bots must exploit free actions.** If a failed attempt costs nothing, a bot (and a real player) will try every turn. If your bots are polite, the sims will say a rule is fine that ruins the table.
- Bots do not trade, bluff or make deals. Say so in the report; the test game has to show whether trading works.

## Tables
Run every setup on at least three tables: a mixed table (styles spread over teams), a pushy table (everyone aggressive and somewhat reckless) and a careful table. A rule that is only fine on the careful table is not fine.

## What to measure (and the usual limits)
| ID | Measure | Typical limit |
|---|---|---|
| SIM-1 | win % per start position, per team size | 3 teams: 28-38 % (26-40 % for a small example) |
| SIM-2 | win % of the leader 2 rounds before the end | ≤ 75 % (the game must stay open) |
| SIM-3 | games where a team can do nothing 2 turns in a row | ≤ 5 % |
| SIM-4 | heavy real-world input (e.g. 16 drinks vs 12) win % | ≤ 50 % |
| SIM-5 | games that do not end within the round cap | 0 |
| SIM-6 | interaction: attacks per round, failed per round, share of all actions, repeat target %, max per turn | see lessons.md |
| info | length in minutes (time model), rounds, big turns, lead changes | guide values only |
| MAT | max pieces per team (+2 spare), max money in circulation (×1.25), notes per value | material list |

With an open end (players agree on a stop time), read every game after round 4, 5, 6, 7, 8: the length is not fixed, so fairness must hold at every stop.

## Real-world input
Model it per person per hour (Poisson per player is a good start), with a time model per round step (minutes per auction, per build turn, per card). The first test game usually runs faster than the model: ask for the real round time and adjust. Test the heavy pace against normal teams (SIM-4).

## Tuning
- `CONFIG='{"attack":{"failCost":3}}' node scripts/balance.mjs 2000` for one variant.
- `printf '%s\n' '{}' '{"attack":{"maxPerTurn":2}}' | node scripts/tune.mjs 500` for several side by side, same seeds.
- Show the designer a small table of 2-4 variants with the numbers that matter for their question, and a recommendation. They choose.
- Change one thing at a time. Write the choice and the numbers in the log and the decision table.
- 2000-3000 games per table for a final report, 400-1000 while exploring.

## Common findings
- Turn order matters more than you think: who acts last often gets the last word (takeovers just before income). Reading the order from the board (leader first) or limiting actions per turn usually fixes it.
- Ties change odds a lot: in a dice battle "tie goes to the defender" vs "re-roll" can move the attacker's chance from 11 % to 21 %.
- Without interaction an open-ended game stalls when the board is full and the leader wins ~90 %. With interaction that is free and unlimited, the round drowns in dice. You need interaction with a price.
- An end condition on a score ("first to 7") makes the last rounds a sprint; an agreed time keeps everyone in it, but then fairness must hold at every round.
