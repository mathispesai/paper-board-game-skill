// Single source for every number and text of the game (DAT-1). The rules engine, the simulations, the tests and
// every print file read this file. Never hard-code a number in a print template: change it here, re-run the sims,
// re-render the print files.
//
// This is a small EXAMPLE game ("Voorbeeldspel": claim towns on a map, take them over with dice). Replace it with
// your own game but keep the shape: GAME, TEAMS, MAP, RULES, CARDS, PRINT, HOUSE_STYLE, SIM.
// Player-facing text is in the group's language (here: Dutch, Flemish tone). Comments stay in English.

export const GAME = {
  name: 'Voorbeeldspel',
  goal: 'Het doel: de meeste steden hebben als het spel stopt.'
};

// Team colours must survive colour blindness and the paint you can actually buy. A team is also recognisable by
// its name and its shape (mark), never by colour alone.
export const TEAMS = [
  { id: 'blauw', name: 'Blauw', color: '#1f5fa8', text: '#ffffff', mark: 'rond' },
  { id: 'rood', name: 'Rood', color: '#c0392b', text: '#ffffff', mark: 'driehoek' },
  { id: 'wit', name: 'Wit', color: '#f4f1ea', text: '#222222', mark: 'vierkant' }
];

// The board: towns on a grid (x, y in grid cells, used by the board print) and roads with a price.
export const MAP = {
  spots: [
    { id: 'oostende', name: 'Oostende', x: 0, y: 0 }, { id: 'brugge', name: 'Brugge', x: 1, y: 0 },
    { id: 'gent', name: 'Gent', x: 2, y: 0 }, { id: 'aalst', name: 'Aalst', x: 3, y: 0 },
    { id: 'ieper', name: 'Ieper', x: 0, y: 1 }, { id: 'roeselare', name: 'Roeselare', x: 1, y: 1 },
    { id: 'tielt', name: 'Tielt', x: 2, y: 1 }, { id: 'mechelen', name: 'Mechelen', x: 3, y: 1 },
    { id: 'kortrijk', name: 'Kortrijk', x: 0, y: 2 }, { id: 'waregem', name: 'Waregem', x: 1, y: 2 },
    { id: 'zottegem', name: 'Zottegem', x: 2, y: 2 }, { id: 'leuven', name: 'Leuven', x: 3, y: 2 }
  ],
  // [from, to, price]
  roads: [
    ['oostende', 'brugge', 1], ['brugge', 'gent', 2], ['gent', 'aalst', 1],
    ['ieper', 'roeselare', 2], ['roeselare', 'tielt', 1], ['tielt', 'mechelen', 3],
    ['kortrijk', 'waregem', 1], ['waregem', 'zottegem', 2], ['zottegem', 'leuven', 2],
    ['oostende', 'ieper', 2], ['brugge', 'roeselare', 1], ['gent', 'tielt', 2], ['aalst', 'mechelen', 1],
    ['ieper', 'kortrijk', 1], ['roeselare', 'waregem', 2], ['tielt', 'zottegem', 1], ['mechelen', 'leuven', 2]
  ]
};

export const RULES = {
  startMoney: 20, // fr per team
  spotPrice: 4, // a town costs this plus the cheapest road from one of your own towns
  claimsPerTurn: 1, // towns a team may claim per turn (more: the last team in round 1 wins too often)
  incomePerSpot: 2, // fr per town at the end of every round
  rounds: 6, // only for sims and tests: at the table the players agree on an end time
  // Takeovers. LESSON (see references/lessons.md): an interactive action that is free when it fails and has no
  // limit turns a round into aimless attacks. So a failed attack costs failCost and a team attacks at most
  // maxPerTurn times per turn. Measure both in the sims (SIM-6) before you change them.
  attack: { attackDice: 2, defendDice: 2, failCost: 2, maxPerTurn: 1 }
};

// Cards: one per page with bleed, fronts and backs in the same order (print shop wants one recto-verso PDF).
// Every event says who it hits ('all', 'most' = the team(s) with the most towns, 'least') and an amount.
export const CARDS = {
  size: { w: 63.5, h: 88.9 }, // poker; confirm with the print shop
  bleed: 3,
  back: { title: 'Gebeurtenis', color: '#3a2f25' },
  events: [
    { id: 'kermis', title: 'Kermis', text: 'Het hele land viert feest.', who: 'all', amount: 3 },
    { id: 'belasting', title: 'Belasting', text: 'De belastingman klopt aan bij wie het meest heeft.', who: 'most', amount: -4 },
    { id: 'subsidie', title: 'Subsidie', text: 'De gemeente helpt wie achterop raakt.', who: 'least', amount: 5 },
    { id: 'storm', title: 'Storm', text: 'Een storm trekt over het land. Iedereen herstelt daken.', who: 'all', amount: -2 },
    { id: 'jackpot', title: 'Jackpot', text: 'Een lot uit de loterij voor wie het moeilijk heeft.', who: 'least', amount: 3 },
    { id: 'jaloers', title: 'Jaloers', text: 'De buren zijn jaloers op wie vooraan staat.', who: 'most', amount: -2 }
  ]
};

// Print files: which ones go to the print shop (converted to CMYK, checked) and which you print at home (RGB).
export const PRINT = {
  shop: ['bord', 'kaarten-recto-verso'],
  home: ['kaarten-voor', 'spelhulp'],
  board: { w: 420, h: 297, bleed: 3, cell: 80 }, // A3 landscape; cell = grid step in mm
  aid: { w: 210, h: 297 }
};

// The group's house style for player text, tested in test/texts.test.js. Add every wording the group asks for.
export const HOUSE_STYLE = {
  forbidden: [
    { pattern: ';', why: 'geen puntkomma\'s in spelerstekst' },
    { pattern: 'op 1e', why: 'schrijf "op de eerste plaats"' }
  ]
};

// Simulation: setups, bot styles and the limits the warnings check (SIM-*).
export const SIM = {
  games: 2000,
  roundCap: 30,
  limits: {
    fairPct: [26, 40], // win % per start position (3 teams: 33 % is perfect)
    leaderBeforePct: 75, // max win % of the leader 2 rounds before the end (the game must stay open)
    stuckPct: 5, // max % of games where a team can do nothing 2 turns in a row
    // Interaction health (SIM-6): measure how an interactive action is used, not only who wins.
    attack: {
      shareOfActionsMax: 50, // max % of all actions that are attacks (here a turn is at most 1 claim + 1 attack)
      failedPerRoundMax: 2, // max failed (aimless) attacks per round, all teams together
      repeatPct: 30 // max % of attacks on a town the same team already attacked in its previous turn
    },
    material: { spareSpots: 2, moneyMargin: 1.25 } // pieces per colour = max towns + 2, notes = max money × 1.25
  }
};
