# Lessons from played games

Add to this file after every game. Keep each lesson general: what happened, why, what to do next time.

## Game 1: a territory game for a friends' weekend (Nov 2026)
Three teams, 8 players, empties as money, breweries decide how many cafés a team may have, the most cafés wins. A1 board from a print shop, 72 cut cards, home-printed money, 3D-printed café pieces. Three weeks from idea to table. The weekend went well.

### Interactive actions need a price (the big one)
**What happened.** After the test game, takeovers came back: in your turn you attack a neighbouring café with dice (2 against 3). A failed attack cost nothing and there was no limit per turn (only: each café once per turn). At the table a large part of every round was aimless attacks: try everything, it is free. It made the game more interactive and better, but too repetitive.

**Why the sims missed it.** The sims checked who wins (fair start positions, the leader not winning too often, heavy drinkers not winning automatically). They counted attacks per round as info, but had no limit for it, and a per-turn limit made the leader stronger, so "no limit" won the comparison. Nobody measured how much of the round the attacks took, or how often the same café was attacked again.

**Do next time.**
- Every interactive action (attack, steal, trade offer, challenge) gets a **cost when it fails**, a **limit per turn**, or a **resource it spends**. Free + unlimited is never fine, whatever the win rates say.
- Measure interaction health in the sims, with limits and warnings (SIM-6): attacks per round, failed attacks per round, share of all actions that are attacks, share of turns with an attack, repeat target % (same team, same target, next turn), max per turn.
- Let bots exploit free actions like people do (a `reckless` style), and run a pushy table.
- Time the round in the test game and ask: how much of it was this one action?
- Ideas that keep attacks meaningful: pay on failure (a fee to the bank or the defender), one attack per turn, attacking uses your build action, a defender who wins gets something, a cooldown token on a café that was just defended.

### Other lessons
- **The test game runs faster than your time model.** Ask for the real minutes per round and adjust.
- **Print deadlines come before the rules are final.** The board was printed before the last rule change; a home-printed sticker covered the old line on the legend. Keep the board's rule text minimal so it rarely changes.
- **Print shops have their own wishes.** This one wanted cards as one recto-verso PDF. Ask early.
- **Ghostscript is not on PATH on Windows** after installing. Look in Program Files or use a `GS` variable.
- **Colour depends on paint.** No orange spray paint in the shop: the orange team became red. Re-run the colour-blindness test after any colour change.
- **Cards with in-jokes**: the joke first, the effect as its consequence. Cutting the text too short killed the story; a middle length worked.
- **Turn order decided more than expected.** The leader building last had the last word every round (won ~70 %). The leader first fixed it. Reading the order from the board removed a physical turn-order stand and a rule.
- **Ties in dice matter.** "Tie goes to the defender" gave 11 %, "re-roll on a tie" 21 %: a different game.
- **An open end needs interaction**: without takeovers the game stalled when the board was full and the leader won ~90 %.
- **Cut, then cut again.** Hand cards, titles, character cards, a timer, a cashier, bins for counted empties and a "last round" sign were all removed. Each removal made the game better and the booklet shorter.
- **The designer's house style is a test**, not a memory: forbidden words and punctuation in `HOUSE_STYLE`, checked on every print file.
