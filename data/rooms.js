/* Room definitions: the street and every interior. Tile coordinates throughout. */
'use strict';

const ROOMS = {};

// --- helpers ---------------------------------------------------------------
function grid(w, h, ch) { return Array.from({ length: h }, () => ch.repeat(w)); }
function paint(g, x, y, w, h, ch) {
  for (let j = y; j < y + h; j++) {
    if (j < 0 || j >= g.length) continue;
    const row = g[j].split('');
    for (let i = x; i < x + w; i++) if (i >= 0 && i < row.length) row[i] = ch;
    g[j] = row.join('');
  }
}
function scatter(g, ch, coords) { for (const [x, y] of coords) paint(g, x, y, 1, 1, ch); }

/* Standard interior: wall_top row, wall row (with windows/doors), floor below, exit at bottom centre. */
function interior(id, o) {
  const g = grid(o.w, o.h, 'f');
  paint(g, 0, 0, o.w, 1, 'T');
  paint(g, 0, 1, o.w, 1, 'W');
  for (const wx of (o.windows || [])) paint(g, wx, 1, 1, 1, 'N');
  for (const dx of (o.doors || [])) paint(g, dx, 1, 1, 1, 'D');
  const legend = {
    T: 'wall_top', W: o.wall, N: o.wall + '_win', D: o.wall + '_door',
    f: o.floor, ...(o.legend || {}),
  };
  const ex = o.exitX != null ? o.exitX : Math.floor(o.w / 2) - 1;
  const objects = [{ t: 'exit_mat', x: ex, y: o.h - 1, solid: false, flat: true }, { t: 'exit_mat', x: ex + 1, y: o.h - 1, solid: false, flat: true }, ...(o.objects || [])];
  ROOMS[id] = {
    name: o.name, w: o.w, h: o.h, ground: g, legend, objects, npcs: o.npcs || [], hotspots: o.hotspots || [],
    exits: [{ x: ex, y: o.h - 1, w: 2, h: 1, to: o.exitTo || 'street', spawn: o.exitSpawn || ('from_' + (o.building || id)) }, ...(o.exits || [])],
    spawns: { default: { x: ex, y: o.h - 2, dir: 'up' }, ...(o.spawns || {}) },
    dim: o.dim, outdoor: false,
  };
  return ROOMS[id];
}

// rug helper: returns flat objects for a rug of w x h tiles at x,y
function rug(colour, x, y, w, h) {
  const out = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let part = (j === 0 ? 't' : j === h - 1 ? 'b' : '') + (i === 0 ? 'l' : i === w - 1 ? 'r' : '');
    if (!part) part = 'c';
    out.push({ t: `rug_${colour}_${part}`, x: x + i, y: y + j, solid: false, flat: true });
  }
  return out;
}

// ---------------------------------------------------------------------------
// THE STREET — Pennsylvania Avenue, January 1835
// ---------------------------------------------------------------------------
(function () {
  const W = 56, H = 24;
  const g = grid(W, H, 'm');
  paint(g, 0, 0, W, 2, 's');          // snowy verge, north
  paint(g, 0, 2, W, 5, 'g');          // ground under north buildings
  paint(g, 0, 7, W, 7, 'm');          // the avenue
  paint(g, 4, 9, 36, 2, 'r');         // wagon ruts
  paint(g, 43, 7, 13, 2, 'F');        // paving before the Capitol
  paint(g, 1, 7, 10, 1, 'F');         // paving before the President's House
  paint(g, 0, 14, W, 4, 'g');         // ground under south buildings
  paint(g, 37, 14, 19, 4, 's');       // open lot, snowy
  paint(g, 0, 18, W, 3, 'm');         // back lane
  paint(g, 0, 21, W, 3, 's');         // south verge
  scatter(g, 'p', [[8, 12], [20, 8], [33, 12], [15, 19], [41, 11], [27, 13], [46, 19]]);
  scatter(g, 'c', [[11, 8], [12, 8], [26, 7], [27, 7], [28, 7], [29, 7], [30, 7], [31, 7], [32, 7]]);

  ROOMS.street = {
    name: 'Pennsylvania Avenue', w: W, h: H, ground: g, outdoor: true, fx: 'snow',
    legend: {
      m: ['mud0', 'mud1', 'mud2', 'mud3', 'mud1'], r: 'mud_ruts', p: 'mud_puddle',
      g: ['grass0', 'grass1', 'grass2', 'grass_snow0'], s: ['grass_snow0', 'grass_snow1', 'grass_snow1'],
      F: ['flag0', 'flag1'], c: ['cobble0', 'cobble1'],
    },
    buildings: [
      // north side
      { b: 'white_house', x: 1, y: 2, to: 'white_house', label: "The President's House" },
      { b: 'post_office', x: 12, y: 3, to: 'post_office' },
      { b: 'bank_office', x: 17, y: 3, to: 'bank_office' },
      { b: 'print_shop', x: 22, y: 3, to: 'print_shop' },
      { b: 'hotel', x: 26, y: 2, to: 'hotel' },
      { b: 'house_c', x: 34, y: 4 },
      { b: 'house_a', x: 39, y: 4 },
      { b: 'capitol', x: 43, y: 0, to: 'capitol_steps' },
      // south side
      { b: 'jail', x: 2, y: 14, to: 'magistrate' },
      { b: 'house_b', x: 7, y: 15 },
      { b: 'tavern', x: 11, y: 14, to: 'tavern' },
      { b: 'house_d', x: 17, y: 15 },
      { b: 'hat_shop', x: 20, y: 14, to: 'hat_shop' },
      { b: 'house_b', x: 24, y: 15 },
      { b: 'boarding_house', x: 28, y: 14, to: 'boarding_house' },
      { b: 'house_a', x: 33, y: 15 },
      // props
      { b: 'tree_bare', x: 0, y: 0 }, { b: 'tree_bare', x: 11, y: 0 }, { b: 'tree_bare', x: 24, y: 0 }, { b: 'tree_bare', x: 36, y: 1 }, { b: 'tree_bare', x: 41, y: 0 },
      { b: 'tree_bare', x: 38, y: 14 }, { b: 'tree_bare', x: 50, y: 15 }, { b: 'tree_bare', x: 6, y: 21 }, { b: 'tree_bare', x: 22, y: 21 }, { b: 'tree_bare', x: 44, y: 21 }, { b: 'tree_bare', x: 54, y: 20 },
      { b: 'lamp_post', x: 11, y: 6 }, { b: 'lamp_post', x: 25, y: 6 }, { b: 'lamp_post', x: 42, y: 6 }, { b: 'lamp_post', x: 10, y: 12 }, { b: 'lamp_post', x: 27, y: 12 },
      { b: 'fence3', x: 13, y: 2 }, { b: 'fence3', x: 17, y: 2 }, { b: 'fence3', x: 21, y: 2 }, { b: 'fence2', x: 34, y: 2 }, { b: 'fence3', x: 38, y: 2 },
      { b: 'fence3', x: 40, y: 17 }, { b: 'fence3', x: 43, y: 17 }, { b: 'fence3', x: 46, y: 17 },
      { b: 'hitching_post', x: 16, y: 7 }, { b: 'hitching_post', x: 33, y: 7 }, { b: 'hitching_post', x: 15, y: 18 },
      { b: 'wagon', x: 40, y: 14 }, { b: 'well', x: 46, y: 14 }, { b: 'barrels2', x: 25, y: 18 }, { b: 'barrels2', x: 8, y: 18 },
      { b: 'signpost', x: 36, y: 12 }, { b: 'signpost', x: 12, y: 12 },
      { b: 'snow_pile', x: 5, y: 8 }, { b: 'snow_pile', x: 30, y: 13 }, { b: 'snow_pile', x: 52, y: 10 }, { b: 'snow_pile', x: 38, y: 19 },
    ],
    npcs: [
      { id: 'newsboy', sprite: 'boy', x: 15, y: 9, dir: 'down' },
      { id: 'street_gentleman', sprite: 'gentleman', x: 24, y: 9, dir: 'left' },
      { id: 'street_lady', sprite: 'lady2', x: 31, y: 8, dir: 'down' },
      { id: 'coachman', sprite: 'coachman', x: 43, y: 15, dir: 'left' },
      { id: 'labourer', sprite: 'labourer', x: 5, y: 19, dir: 'right' },
      { id: 'doorman', sprite: 'servant', x: 7, y: 7, dir: 'down' },
    ],
    hotspots: [
      { x: 36, y: 12, look: "A signpost. One arm reads *CAPITOL* and points east; the other reads *PRESIDENT'S HOUSE* and points west. The Avenue between them is a mile and a half of mud." },
      { x: 12, y: 12, look: "A signpost: *POST OFFICE · BANK · PRINTER* to the north side of the Avenue, *TAVERN · HATTER · LODGINGS* along the lane behind you." },
      { x: 46, y: 14, w: 2, h: 2, look: "The public well. A film of ice on the bucket. Washington in January is bitter, and the whole city is talking about one thing." },
    ],
    spawns: { default: { x: 4, y: 19, dir: 'right' } },
  };
})();

// ---------------------------------------------------------------------------
// INTERIORS
// ---------------------------------------------------------------------------
interior('magistrate', {
  name: "The Magistrate's Office", building: 'jail', w: 12, h: 8, wall: 'wall_panel', floor: 'floor_wood_dark', windows: [2, 9],
  objects: [
    { t: 'wall_map', x: 4, y: 1, solid: false }, { t: 'portrait_red', x: 7, y: 1, solid: false }, { t: 'notice_board', x: 10, y: 1, solid: false },
    { t: 'bookshelf2', x: 0, y: 1 }, { t: 'desk3', x: 4, y: 3 }, { t: 'chair_up', x: 5, y: 2, solid: false },
    { t: 'armchair', x: 1, y: 4 }, { t: 'candle_table', x: 10, y: 3 }, { t: 'strongbox', x: 0, y: 6 }, { t: 'bars', x: 11, y: 4, solid: false, flat: true }, { t: 'bars', x: 11, y: 5, solid: false, flat: true },
    { t: 'crate', x: 10, y: 6 },
  ],
  npcs: [{ id: 'magistrate', sprite: 'magistrate', x: 5, y: 2, dir: 'down', reach: { d: 44 } }],
  hotspots: [
    { x: 10, y: 1, look: "Notices pinned to the board. *REWARD* — for information on any confederate of the prisoner Lawrence. Beneath it, a broadside: *THE PRESIDENT IS ALIVE. THE ASSASSIN IS TAKEN.*" },
    { x: 4, y: 1, w: 2, look: "A map of the District of Columbia. The Capitol at one end of the Avenue, the President's House at the other, and not much between them but mud, boarding houses and ambition." },
  ],
  exits: [{ x: 11, y: 4, w: 1, h: 2, to: 'jail', spawn: 'default' }],
  spawns: { from_cells: { x: 10, y: 4, dir: 'left' } },
});

interior('jail', {
  name: 'The Cells', w: 10, h: 7, wall: 'wall_stone', floor: 'floor_stone0', windows: [8], dim: true, exitX: 20,
  objects: [
    { t: 'cot', x: 0, y: 2 }, { t: 'bars', x: 3, y: 2, solid: true, flat: true }, { t: 'bars', x: 3, y: 3, solid: true, flat: true }, { t: 'bars_door', x: 3, y: 4, solid: true, flat: true }, { t: 'bars', x: 3, y: 5, solid: true, flat: true }, { t: 'bars', x: 3, y: 6, solid: true, flat: true },
    { t: 'table1', x: 6, y: 4, evidence: 'bank_note', where: "Lawrence's pockets, at the jail", look: "The prisoner's effects, laid out on the table: a comb, a few coins, and a crisp new ten-dollar note from the Bank of the United States. Fresh from the Washington branch." },
    { t: 'crate', x: 8, y: 5, evidence: 'address_card', where: "Lawrence's coat, at the jail", look: "The prisoner's coat, folded in a crate. In the breast pocket, a printed card: *420 Chestnut Street, Philadelphia.* The address of the Bank of the United States." },
    { t: 'candle_table', x: 6, y: 2 }, { t: 'barrel', x: 8, y: 2 },
    { t: 'bars', x: 9, y: 3, solid: false, flat: true }, { t: 'bars_door', x: 9, y: 4, solid: false, flat: true }, { t: 'bars', x: 9, y: 5, solid: false, flat: true },
  ],
  npcs: [
    { id: 'lawrence', sprite: 'lawrence', x: 2, y: 4, dir: 'right', reach: { r: 56 } },
    { id: 'jailer', sprite: 'jailer', x: 7, y: 3, dir: 'down', reach: { d: 20 } },
  ],
  exits: [{ x: 9, y: 3, w: 1, h: 3, to: 'magistrate', spawn: 'from_cells' }],
  spawns: { default: { x: 8, y: 4, dir: 'left' } },
});
// jail's bottom exit is off-map (exitX beyond width) — the only way out is back through the office
ROOMS.jail.exits = ROOMS.jail.exits.filter(e => e.to !== 'street');
ROOMS.jail.objects = ROOMS.jail.objects.filter(o => o.t !== 'exit_mat');

interior('post_office', {
  name: 'The Post Office', w: 12, h: 8, wall: 'wall_plaster', floor: 'floor_wood1', windows: [1, 10],
  objects: [
    { t: 'pigeonholes', x: 2, y: 1 }, { t: 'pigeonholes', x: 7, y: 1 },
    { t: 'notice_board', x: 5, y: 1, solid: false, evidence: 'poster', where: 'the Post Office wall', look: "An election poster from 1828, faded now: *JACKSON AND REFORM! The Hero of New Orleans — the People's Candidate.* Someone has scratched the word *KING* across his name with a pen-knife." },
    { t: 'counter3', x: 4, y: 3 }, { t: 'desk1', x: 9, y: 3 }, { t: 'barrel', x: 0, y: 5 }, { t: 'crate', x: 0, y: 6 }, { t: 'crate', x: 11, y: 6 },
    { t: 'chair_down', x: 9, y: 4, solid: false },
  ],
  npcs: [
    { id: 'postmaster', sprite: 'postmaster', x: 5, y: 2, dir: 'down', reach: { d: 44 } },
    { id: 'po_clerk', sprite: 'boy', x: 9, y: 6, dir: 'left' },
  ],
});

interior('hat_shop', {
  name: 'Fenwick & Son — Hats & Leather Goods', w: 10, h: 7, wall: 'wall_paper', floor: 'floor_wood_pale', windows: [2, 7],
  objects: [
    { t: 'hat_rack', x: 0, y: 2, look: "A rack of finished hats. Turn one over: a small running stag is stamped into every leather sweatband. The shop's mark." },
    { t: 'hat_rack', x: 9, y: 2 },
    { t: 'hat_counter', x: 3, y: 3 }, { t: 'wall_sign', x: 4, y: 1, solid: false }, { t: 'crate', x: 0, y: 5 }, { t: 'crate', x: 9, y: 5 }, { t: 'candle_table', x: 6, y: 5 },
    { t: 'desk1', x: 8, y: 3, look: "The order book. Hats sold this winter, by name — pages of them. Gregory keeps it in a very neat hand." },
  ],
  npcs: [
    { id: 'gregory', sprite: 'gregory', x: 4, y: 2, dir: 'down', reach: { d: 44 } },
    { id: 'hatter', sprite: 'gentleman2', x: 7, y: 5, dir: 'left' },
  ],
});

interior('tavern', {
  name: "Gadsby's Tavern", w: 14, h: 8, wall: 'wall_log', floor: 'floor_wood_dark', windows: [3, 8], dim: true,
  objects: [
    { t: 'bar3', x: 1, y: 2 }, { t: 'fireplace', x: 10, y: 1 }, { t: 'barrel', x: 13, y: 3 }, { t: 'barrel', x: 0, y: 6 }, { t: 'bookshelf1', x: 5, y: 1, solid: false },
    { t: 'table2', x: 7, y: 4, evidence: 'whiskey', where: "Henry Clay's table at the tavern", look: "Clay's table. A bottle of Kentucky bourbon, half gone, and two glasses. Two." },
    { t: 'chair_up', x: 7, y: 3, solid: false }, { t: 'chair_down', x: 8, y: 5, solid: false },
    { t: 'table1', x: 12, y: 5, evidence: 'playing_cards', where: 'the back table at the tavern', look: "The back table, where the serious card games happen. A deck left behind. Several cards carry a faint fingernail mark on the back — someone was cheating." },
    { t: 'chair_down', x: 12, y: 6, solid: false }, { t: 'candle_table', x: 3, y: 5 },
  ],
  npcs: [
    { id: 'tavernkeeper', sprite: 'tavernkeeper', x: 2, y: 1, dir: 'down', reach: { d: 44 } },
    { id: 'clay', sprite: 'clay', x: 10, y: 3, dir: 'down' },
    { id: 'congressman', sprite: 'gentleman', x: 4, y: 5, dir: 'right' },
  ],
});

interior('bank_office', {
  name: 'Bank of the United States — Washington Office', w: 12, h: 8, wall: 'wall_marble', floor: 'floor_marble', windows: [1, 10],
  objects: [
    { t: 'pillar', x: 3, y: 1, solidH: 30 }, { t: 'pillar', x: 8, y: 1, solidH: 30 }, { t: 'wall_map', x: 5, y: 1, solid: false }, { t: 'portrait_blue', x: 10, y: 1, solid: false },
    { t: 'counter3', x: 4, y: 3 }, { t: 'desk2', x: 8, y: 4 }, { t: 'chair_up', x: 9, y: 3, solid: false }, { t: 'globe', x: 11, y: 5 }, { t: 'bookshelf2', x: 0, y: 1 },
    { t: 'strongbox', x: 0, y: 4, evidence: 'check', where: "the Bank's ledger, Washington office", look: "The branch ledger lies open on the strongbox. One entry, 1830: *$5,700,000 — loans to members of Congress and friends of the Bank.* A list of names follows. Henry Clay is near the top. So is Daniel Webster." },
  ],
  npcs: [
    { id: 'bank_clerk', sprite: 'clerk', x: 5, y: 2, dir: 'down', reach: { d: 44 } },
    { id: 'biddle', sprite: 'biddle', x: 10, y: 6, dir: 'left' },
  ],
});

interior('print_shop', {
  name: "Duff Green's Print Shop", w: 10, h: 7, wall: 'wall_brick', floor: 'floor_wood2', windows: [8],
  objects: [
    { t: 'press', x: 1, y: 2 }, { t: 'counter2', x: 5, y: 4 }, { t: 'crate', x: 8, y: 2 }, { t: 'barrel', x: 8, y: 3 }, { t: 'table1', x: 1, y: 5 },
    { t: 'notice_board', x: 4, y: 1, solid: false, evidence: 'cartoon', where: 'the print shop wall', look: "Pinned to the wall, fresh from the press: *KING ANDREW THE FIRST.* Jackson in a crown and ermine robe, a veto in one hand, the Constitution torn under his boot. Beneath it, a paragraph of furious prose." },
    { t: 'wall_sign', x: 6, y: 1, solid: false },
  ],
  npcs: [{ id: 'printer', sprite: 'printer', x: 6, y: 3, dir: 'down', reach: { d: 44 } }],
});

interior('boarding_house', {
  name: "Mrs. Hill's Boarding House — the Parlor", w: 12, h: 8, wall: 'wall_paper', floor: 'floor_wood0', windows: [2, 9],
  objects: [
    ...rug('green', 4, 3, 4, 3),
    { t: 'fireplace', x: 5, y: 1 }, { t: 'bookshelf1', x: 10, y: 1 }, { t: 'portrait_blue', x: 2, y: 1, solid: false }, { t: 'sofa', x: 1, y: 4 }, { t: 'candle_table', x: 0, y: 2 },
    { t: 'armchair', x: 9, y: 3 },
    { t: 'table1', x: 10, y: 5, evidence: 'resolutions', where: "Calhoun's papers at the boarding house", look: "Calhoun's papers, stacked with military neatness. On top: a printed copy of the *Virginia and Kentucky Resolutions* of 1798, underlined so heavily in places the pen has cut the paper." },
    { t: 'chair_down', x: 10, y: 6, solid: false },
  ],
  npcs: [
    { id: 'calhoun', sprite: 'calhoun', x: 7, y: 4, dir: 'left' },
    { id: 'landlady', sprite: 'lady', x: 2, y: 2, dir: 'down', reach: { d: 20 } },
  ],
});

interior('hotel', {
  name: 'The Indian Queen Hotel — the Parlor', w: 12, h: 8, wall: 'wall_plaster_b', floor: 'floor_wood_dark', windows: [1, 5, 10],
  objects: [
    ...rug('red', 3, 3, 5, 3),
    { t: 'wall_map', x: 7, y: 1, solid: false }, { t: 'portrait_red', x: 3, y: 1, solid: false }, { t: 'sofa', x: 8, y: 2 }, { t: 'counter2', x: 0, y: 2 }, { t: 'candle_table', x: 11, y: 4 }, { t: 'table2', x: 1, y: 5 }, { t: 'chair_up', x: 1, y: 4, solid: false }, { t: 'chair_up', x: 2, y: 4, solid: false },
    { t: 'crate', x: 11, y: 6 },
    { t: 'wall_sign', x: 0, y: 1, solid: false, look: "The hotel's register. The Cherokee delegation has been here three weeks, petitioning Congress. Their bill is paid in advance, in full." },
  ],
  npcs: [
    { id: 'ross', sprite: 'ross', x: 5, y: 4, dir: 'down' },
    { id: 'delegate', sprite: 'delegate', x: 9, y: 4, dir: 'left' },
  ],
});

interior('white_house', {
  name: "The President's House — the Office", w: 12, h: 8, wall: 'wall_plaster', floor: 'floor_wood_pale', windows: [3, 8],
  objects: [
    ...rug('blue', 4, 3, 4, 3),
    { t: 'fireplace', x: 5, y: 1 }, { t: 'portrait_red', x: 1, y: 1, solid: false }, { t: 'portrait_blue', x: 10, y: 1, solid: false }, { t: 'bookshelf2', x: 8, y: 1 }, { t: 'bookshelf2', x: 2, y: 1 },
    { t: 'desk3', x: 1, y: 3, look: "The President's desk. A stack of bills from Congress, and on top of each, in a furious scrawl: *VETO.* Jackson has rejected more laws than the six presidents before him put together." },
    { t: 'chair_up', x: 2, y: 2, solid: false }, { t: 'armchair', x: 10, y: 4 }, { t: 'globe', x: 11, y: 6 }, { t: 'candle_table', x: 0, y: 6 },
  ],
  npcs: [
    { id: 'jackson', sprite: 'jackson', x: 7, y: 3, dir: 'down' },
    { id: 'servant', sprite: 'servant', x: 2, y: 6, dir: 'right' },
  ],
});

// --- the crime scene: exterior in front of the Capitol ----------------------
(function () {
  const W = 16, H = 11;
  const g = grid(W, H, 'F');
  paint(g, 0, 0, W, 7, 'g');
  paint(g, 0, 9, W, 2, 'm');
  scatter(g, 's', [[0, 8], [15, 8], [1, 9], [14, 10]]);
  ROOMS.capitol_steps = {
    name: 'The Capitol Steps — East Portico', w: W, h: H, ground: g, outdoor: true, fx: 'snow',
    legend: { F: ['flag0', 'flag1'], g: ['grass_snow0', 'grass_snow1'], m: ['mud0', 'mud1'], s: 'grass_snow1' },
    buildings: [
      { b: 'capitol', x: 2, y: 0 },
      { b: 'tree_bare', x: 0, y: 4 }, { b: 'tree_bare', x: 14, y: 4 }, { b: 'lamp_post', x: 1, y: 7 }, { b: 'lamp_post', x: 14, y: 7 },
      { b: 'snow_pile', x: 0, y: 9 }, { b: 'snow_pile', x: 15, y: 10 },
    ],
    npcs: [
      { id: 'guard', sprite: 'guard', x: 4, y: 8, dir: 'right' },
      { id: 'witness', sprite: 'gentleman2', x: 11, y: 8, dir: 'left' },
      { id: 'mourner', sprite: 'lady', x: 13, y: 9, dir: 'left' },
    ],
    hotspots: [
      { x: 7, y: 7, evidence: 'hat', where: 'the Capitol steps, where the pistols were fired', look: "Here, at the foot of the steps. A gentleman's hat lies where it fell — trampled a little, but a good hat. Beaver felt. Inside the band: a small stamped stag." },
      { x: 9, y: 7, evidence: 'pipe', where: 'the Capitol steps, beside the hat', look: "A few feet from the hat, a long clay pipe, snapped in two. The bowl is carved with a palmetto — the tree on South Carolina's flag." },
      { x: 8, y: 6, look: "Two dark scorch-marks on the marble where the pistols flashed. Both misfired. The powder was damp, or the caps were bad, or — as half the city is saying — Providence stepped in." },
    ],
    exits: [{ x: 0, y: 10, w: W, h: 1, to: 'street', spawn: 'from_capitol' }],
    spawns: { default: { x: 8, y: 9, dir: 'up' } },
  };
})();
