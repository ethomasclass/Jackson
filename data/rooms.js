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

/* Standard interior: a cornice row, a two-tile wall (field + wainscot) with tall windows and
   doors, side walls, a bottom wall lip with an exit gap, floor between. Rooms are 20x12 by
   default so they fill the view. */
function interior(id, o) {
  const w = o.w || 20, h = o.h || 12;
  const g = grid(w, h, 'f');
  paint(g, 0, 0, w, 1, o.beams ? 'C' : 'T');
  paint(g, 0, 1, w, 1, 'W');
  paint(g, 0, 2, w, 1, 'L');
  for (const wx of (o.windows || [])) { paint(g, wx, 1, 1, 1, 'N'); paint(g, wx, 2, 1, 1, 'n'); }
  for (const dx of (o.doors || [])) { paint(g, dx, 1, 1, 1, 'D'); paint(g, dx, 2, 1, 1, 'd'); }
  paint(g, 0, 0, 1, h, 'S'); paint(g, w - 1, 0, 1, h, 'S');
  paint(g, 1, h - 1, w - 2, 1, 'B');
  const ex = o.exitX != null ? o.exitX : Math.floor(w / 2) - 1;
  if (!o.noExit) paint(g, ex, h - 1, 2, 1, 'f');
  for (const [gx, gy] of (o.gaps || [])) paint(g, gx, gy, 1, 1, 'f');
  const legend = {
    T: 'wall_top', C: 'beam', W: o.wall, L: o.wall + '_lower', N: o.wall + '_win', n: o.wall + '_win_lower',
    D: o.wall + '_door', d: o.wall + '_door_lower', S: 'wall_side', B: 'wall_bottom', f: o.floor, ...(o.legend || {}),
  };
  const objects = [...(o.noExit ? [] : [{ t: 'exit_mat', x: ex, y: h - 1, solid: false, flat: true }, { t: 'exit_mat', x: ex + 1, y: h - 1, solid: false, flat: true }]), ...(o.objects || [])];
  ROOMS[id] = {
    name: o.name, w, h, ground: g, legend, objects, npcs: o.npcs || [], hotspots: o.hotspots || [],
    exits: [...(o.noExit ? [] : [{ x: ex, y: h - 1, w: 2, h: 1, to: o.exitTo || 'street', spawn: o.exitSpawn || ('from_' + (o.building || id)) }]), ...(o.exits || [])],
    spawns: { default: { x: ex, y: h - 2, dir: 'up' }, ...(o.spawns || {}) },
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
  const W = 70, H = 31;
  const g = grid(W, H, 'm');
  paint(g, 0, 0, W, 2, 's');          // snowy verge, north
  paint(g, 0, 2, W, 10, 'g');         // ground under north buildings
  paint(g, 0, 12, W, 7, 'm');         // the avenue
  paint(g, 4, 14, 44, 2, 'r');        // wheel ruts
  paint(g, 48, 12, 22, 2, 'F');       // paving before the Capitol
  paint(g, 0, 12, 16, 1, 'F');        // paving before the President's House
  paint(g, 0, 19, W, 7, 'g');         // ground under south buildings
  paint(g, 37, 19, 33, 7, 's');       // open lot, snowy
  paint(g, 0, 26, W, 3, 'm');         // back lane
  paint(g, 0, 29, W, 2, 's');         // south verge
  scatter(g, 'p', [[8, 17], [20, 13], [33, 17], [15, 27], [41, 16], [27, 18], [46, 27], [58, 17]]);
  scatter(g, 'c', [[12, 12], [13, 12], [14, 12], [30, 12], [31, 12], [32, 12], [33, 12], [34, 12], [35, 12], [36, 12]]);

  ROOMS.street = {
    name: 'Pennsylvania Avenue', w: W, h: H, ground: g, outdoor: true, fx: 'snow',
    legend: {
      m: ['mud0', 'mud1', 'mud2', 'mud3', 'mud1'], r: 'mud_ruts', p: 'mud_puddle',
      g: ['grass0', 'grass1', 'grass2', 'grass_snow0'], s: ['grass_snow0', 'grass_snow1', 'grass_snow1'],
      F: ['flag0', 'flag1'], c: ['cobble0', 'cobble1'],
    },
    buildings: [
      // north side (bottoms on row 12)
      { b: 'white_house', x: 0, y: 3, to: 'white_house', label: "The President's House" },
      { b: 'post_office', x: 16, y: 6, to: 'post_office' },
      { b: 'bank_office', x: 21, y: 6, to: 'bank_office' },
      { b: 'print_shop', x: 26, y: 6, to: 'print_shop' },
      { b: 'hotel', x: 30, y: 5, to: 'hotel' },
      { b: 'house_c', x: 38, y: 6 },
      { b: 'house_a', x: 43, y: 6 },
      { b: 'capitol', x: 48, y: 0, to: 'capitol_steps' },
      // south side (bottoms on row 26, doors onto the back lane)
      { b: 'jail', x: 2, y: 20, to: 'magistrate' },
      { b: 'house_b', x: 7, y: 20 },
      { b: 'tavern', x: 11, y: 19, to: 'tavern' },
      { b: 'house_d', x: 17, y: 20 },
      { b: 'hat_shop', x: 20, y: 20, to: 'hat_shop' },
      { b: 'house_b', x: 24, y: 20 },
      { b: 'boarding_house', x: 28, y: 20, to: 'boarding_house' },
      { b: 'house_a', x: 33, y: 20 },
      // props
      { b: 'tree_bare', x: 15, y: 0 }, { b: 'tree_bare', x: 27, y: 0 }, { b: 'tree_bare', x: 45, y: 0 }, { b: 'tree_bare', x: 40, y: 2 },
      { b: 'tree_bare', x: 38, y: 19 }, { b: 'tree_bare', x: 44, y: 21 }, { b: 'tree_bare', x: 60, y: 21 }, { b: 'tree_bare', x: 52, y: 19 },
      { b: 'tree_bare', x: 6, y: 28 }, { b: 'tree_bare', x: 22, y: 28 }, { b: 'tree_bare', x: 44, y: 28 }, { b: 'tree_bare', x: 58, y: 28 },
      { b: 'lamp_post', x: 15, y: 9 }, { b: 'lamp_post', x: 25, y: 9 }, { b: 'lamp_post', x: 37, y: 9 }, { b: 'lamp_post', x: 47, y: 9 },
      { b: 'lamp_post', x: 10, y: 16 }, { b: 'lamp_post', x: 28, y: 16 }, { b: 'lamp_post', x: 55, y: 16 }, { b: 'lamp_post', x: 19, y: 23 }, { b: 'lamp_post', x: 36, y: 23 },
      { b: 'fence3', x: 17, y: 2 }, { b: 'fence3', x: 21, y: 2 }, { b: 'fence3', x: 25, y: 2 }, { b: 'fence2', x: 38, y: 2 }, { b: 'fence3', x: 43, y: 2 },
      { b: 'fence3', x: 40, y: 25 }, { b: 'fence3', x: 43, y: 25 }, { b: 'fence3', x: 46, y: 25 }, { b: 'fence3', x: 49, y: 25 },
      { b: 'hitching_post', x: 20, y: 12 }, { b: 'hitching_post', x: 37, y: 12 }, { b: 'hitching_post', x: 15, y: 26 },
      { b: 'trough', x: 41, y: 12 }, { b: 'coach', x: 35, y: 13 },
      { b: 'wagon', x: 40, y: 20 }, { b: 'well', x: 46, y: 20 }, { b: 'barrels2', x: 25, y: 26 }, { b: 'barrels2', x: 8, y: 26 },
      { b: 'signpost', x: 36, y: 17 }, { b: 'signpost', x: 12, y: 17 },
      { b: 'snow_pile', x: 5, y: 13 }, { b: 'snow_pile', x: 30, y: 18 }, { b: 'snow_pile', x: 56, y: 15 }, { b: 'snow_pile', x: 38, y: 27 }, { b: 'snow_pile', x: 62, y: 13 },
    ],
    npcs: [
      { id: 'newsboy', sprite: 'boy', x: 19, y: 14, dir: 'down' },
      { id: 'street_gentleman', sprite: 'gentleman', x: 28, y: 14, dir: 'left' },
      { id: 'street_lady', sprite: 'lady2', x: 42, y: 15, dir: 'down' },
      { id: 'coachman', sprite: 'coachman', x: 39, y: 14, dir: 'left' },
      { id: 'labourer', sprite: 'labourer', x: 5, y: 27, dir: 'right' },
      { id: 'doorman', sprite: 'servant', x: 9, y: 12, dir: 'down' },
    ],
    hotspots: [
      { x: 36, y: 17, h: 2, look: "A signpost. One arm reads *CAPITOL* and points east; the other reads *PRESIDENT'S HOUSE* and points west. The Avenue between them is a mile and a half of mud." },
      { x: 12, y: 17, h: 2, look: "A signpost: *POST OFFICE · BANK · PRINTER* to the north side of the Avenue, *TAVERN · HATTER · LODGINGS* along the lane behind you." },
      { x: 46, y: 20, w: 2, h: 2, look: "The public well. A film of ice on the bucket. Washington in January is bitter, and the whole city is talking about one thing." },
    ],
    spawns: { default: { x: 4, y: 27, dir: 'right' } },
  };
})();

// ---------------------------------------------------------------------------
// INTERIORS (20x12: walls on rows 0-2 and the side columns, floor rows 3-10, exit gap on row 11)
// ---------------------------------------------------------------------------
interior('magistrate', {
  name: "The Magistrate's Office", building: 'jail', wall: 'wall_panel', floor: 'floor_wood_dark', windows: [4, 15],
  gaps: [[19, 6], [19, 7]],
  objects: [
    { t: 'fireplace3', x: 8, y: 1 }, { t: 'bookshelf2', x: 1, y: 2 }, { t: 'bookshelf2', x: 3, y: 2 }, { t: 'notice_board', x: 6, y: 1, solid: false }, { t: 'wall_map', x: 11, y: 1, solid: false },
    { t: 'portrait_red', x: 17, y: 1, solid: false }, { t: 'sconce', x: 2, y: 1, solid: false }, { t: 'sconce', x: 13, y: 1, solid: false }, { t: 'tall_clock', x: 18, y: 2 }, { t: 'coat_stand', x: 16, y: 3 },
    ...rug('green', 6, 7, 5, 2),
    { t: 'desk3', x: 7, y: 5 }, { t: 'chair_up', x: 8, y: 4, solid: false }, { t: 'armchair', x: 2, y: 6 }, { t: 'candle_table', x: 16, y: 6 }, { t: 'spittoon', x: 11, y: 6, solid: false },
    { t: 'strongbox', x: 1, y: 9 }, { t: 'crate', x: 17, y: 9 }, { t: 'paper_stack', x: 12, y: 5, solid: false },
    { t: 'bars', x: 19, y: 6, solid: false, flat: true }, { t: 'bars_door', x: 19, y: 7, solid: false, flat: true },
  ],
  npcs: [{ id: 'magistrate', sprite: 'magistrate', x: 8, y: 4, dir: 'down', reach: { d: 44 } }],
  hotspots: [
    { x: 6, y: 1, look: "Notices pinned to the board. *REWARD* — for information on any confederate of the prisoner Lawrence. Beneath it, a broadside: *THE PRESIDENT IS ALIVE. THE ASSASSIN IS TAKEN.*" },
    { x: 11, y: 1, w: 2, look: "A map of the District of Columbia. The Capitol at one end of the Avenue, the President's House at the other, and not much between them but mud, boarding houses and ambition." },
  ],
  exits: [{ x: 19, y: 6, w: 1, h: 2, to: 'jail', spawn: 'default' }],
  spawns: { from_cells: { x: 18, y: 6, dir: 'left' } },
});

interior('jail', {
  name: 'The Cells', wall: 'wall_stone', floor: 'floor_stone0', windows: [12], beams: true, dim: true, noExit: true,
  gaps: [[19, 6], [19, 7]],
  objects: [
    { t: 'cot', x: 1, y: 3 }, { t: 'crate', x: 4, y: 3 }, { t: 'spittoon', x: 2, y: 9, solid: false },
    ...[3, 4, 5, 6, 8, 9, 10].map(y => ({ t: 'bars', x: 6, y, solid: true, flat: true })), { t: 'bars_door', x: 6, y: 7, solid: true, flat: true },
    { t: 'stove', x: 15, y: 2 }, { t: 'sconce', x: 4, y: 1, solid: false }, { t: 'sconce', x: 9, y: 1, solid: false }, { t: 'barrel', x: 17, y: 3 }, { t: 'candle_table', x: 9, y: 3 },
    { t: 'table1', x: 12, y: 6, evidence: 'bank_note', where: "Lawrence's pockets, at the jail", look: "The prisoner's effects, laid out on the table: a comb, a few coins, and a crisp new ten-dollar note from the Bank of the United States. Fresh from the Washington branch." },
    { t: 'crate', x: 15, y: 8, evidence: 'address_card', where: "Lawrence's coat, at the jail", look: "The prisoner's coat, folded in a crate. In the breast pocket, a printed card: *420 Chestnut Street, Philadelphia.* The address of the Bank of the United States." },
    { t: 'chair_down', x: 10, y: 8, solid: false }, { t: 'paper_stack', x: 13, y: 9, solid: false },
    { t: 'bars', x: 19, y: 6, solid: false, flat: true }, { t: 'bars_door', x: 19, y: 7, solid: false, flat: true },
  ],
  npcs: [
    { id: 'lawrence', sprite: 'lawrence', x: 5, y: 7, dir: 'right', reach: { r: 56 } },
    { id: 'jailer', sprite: 'jailer', x: 10, y: 5, dir: 'down', reach: { d: 20 } },
  ],
  exits: [{ x: 19, y: 6, w: 1, h: 2, to: 'magistrate', spawn: 'from_cells' }],
  spawns: { default: { x: 17, y: 6, dir: 'left' } },
});

interior('post_office', {
  name: 'The Post Office', wall: 'wall_plaster', floor: 'floor_wood1', windows: [3, 15],
  objects: [
    { t: 'pigeonholes', x: 4, y: 2 }, { t: 'pigeonholes', x: 12, y: 2 }, { t: 'wall_map', x: 16, y: 1, solid: false },
    { t: 'notice_board', x: 9, y: 1, solid: false, evidence: 'poster', where: 'the Post Office wall', look: "A handbill from the 1828 election, brown with age: six black coffins in a row, and beneath them *Some Account of some of the Bloody Deeds of GENERAL JACKSON.* His enemies' work. Someone has scratched the word *KING* across his name with a pen-knife." },
    { t: 'sconce', x: 7, y: 1, solid: false }, { t: 'sconce', x: 14, y: 1, solid: false }, { t: 'tall_clock', x: 1, y: 2 },
    { t: 'counter3', x: 7, y: 5 }, { t: 'desk1', x: 14, y: 6 }, { t: 'chair_down', x: 14, y: 7, solid: false }, { t: 'argand_lamp', x: 3, y: 5 }, { t: 'paper_stack', x: 4, y: 8, solid: false },
    { t: 'barrel', x: 1, y: 8 }, { t: 'crate', x: 1, y: 9 }, { t: 'crate', x: 17, y: 9 }, { t: 'crate', x: 17, y: 8 }, { t: 'spittoon', x: 12, y: 8, solid: false },
  ],
  npcs: [
    { id: 'postmaster', sprite: 'postmaster', x: 8, y: 4, dir: 'down', reach: { d: 44 } },
    { id: 'po_clerk', sprite: 'boy', x: 15, y: 9, dir: 'left' },
  ],
});

interior('hat_shop', {
  name: 'Fenwick & Son — Hats & Leather Goods', wall: 'wall_paper', floor: 'floor_wood_pale', windows: [3, 14],
  objects: [
    { t: 'hat_rack', x: 1, y: 3, look: "A rack of finished hats. Turn one over: a small running stag is stamped into every leather sweatband. The shop's mark." },
    { t: 'hat_rack', x: 18, y: 3 }, { t: 'hat_rack', x: 18, y: 6 }, { t: 'wall_sign', x: 9, y: 1, solid: false }, { t: 'mirror', x: 11, y: 1, solid: false },
    { t: 'sconce', x: 6, y: 1, solid: false }, { t: 'sconce', x: 16, y: 1, solid: false }, { t: 'bookshelf1', x: 5, y: 2 },
    ...rug('red', 7, 7, 4, 2),
    { t: 'hat_counter', x: 7, y: 5 }, { t: 'coat_stand', x: 2, y: 6 }, { t: 'candle_table', x: 12, y: 7 }, { t: 'argand_lamp', x: 5, y: 7 },
    { t: 'desk1', x: 16, y: 4, look: "The order book. Hats sold this winter, by name — pages of them. Gregory keeps it in a very neat hand." },
    { t: 'crate', x: 1, y: 9 }, { t: 'crate', x: 17, y: 9 }, { t: 'paper_stack', x: 14, y: 5, solid: false },
  ],
  npcs: [
    { id: 'gregory', sprite: 'gregory', x: 8, y: 4, dir: 'down', reach: { d: 44 } },
    { id: 'hatter', sprite: 'gentleman2', x: 14, y: 8, dir: 'left' },
  ],
});

interior('tavern', {
  name: "Gadsby's Tavern", wall: 'wall_log', floor: 'floor_wood_dark', windows: [6, 12], beams: true, dim: true,
  objects: [
    { t: 'cage4', x: 1, y: 1, solid: false }, { t: 'bar4', x: 1, y: 4 }, { t: 'fireplace3', x: 14, y: 1 }, { t: 'barrel', x: 18, y: 3 }, { t: 'barrel', x: 18, y: 4 },
    { t: 'sconce', x: 8, y: 1, solid: false }, { t: 'sconce', x: 10, y: 1, solid: false },
    { t: 'table2', x: 7, y: 6, evidence: 'whiskey', where: "Henry Clay's table at the tavern", look: "Clay's table. A bottle of Kentucky bourbon, half gone, and two glasses. Two." },
    { t: 'chair_up', x: 7, y: 5, solid: false }, { t: 'chair_down', x: 8, y: 7, solid: false },
    { t: 'table2', x: 11, y: 8 }, { t: 'chair_up', x: 11, y: 7, solid: false }, { t: 'chair_up', x: 12, y: 7, solid: false }, { t: 'chair_down', x: 12, y: 9, solid: false },
    { t: 'table1', x: 16, y: 8, evidence: 'playing_cards', where: 'the back table at the tavern', look: "The back table, where the serious card games happen. A deck left behind. Several cards carry a faint fingernail mark on the back — someone was cheating." },
    { t: 'chair_down', x: 16, y: 9, solid: false }, { t: 'chair_up', x: 17, y: 7, solid: false },
    { t: 'argand_lamp', x: 10, y: 5 }, { t: 'candle_table', x: 3, y: 8 }, { t: 'spittoon', x: 6, y: 9, solid: false }, { t: 'crate', x: 1, y: 9 }, { t: 'barrel', x: 1, y: 8 },
  ],
  npcs: [
    { id: 'tavernkeeper', sprite: 'tavernkeeper', x: 2, y: 3, dir: 'down', reach: { d: 44 } },
    { id: 'clay', sprite: 'clay', x: 13, y: 5, dir: 'down' },
    { id: 'congressman', sprite: 'gentleman', x: 5, y: 8, dir: 'right' },
  ],
});

interior('bank_office', {
  name: 'Bank of the United States — Washington Office', wall: 'wall_marble', floor: 'floor_marble', windows: [3, 16],
  objects: [
    { t: 'pillar', x: 5, y: 1, solidH: 30 }, { t: 'pillar', x: 14, y: 1, solidH: 30 }, { t: 'wall_map', x: 9, y: 1, solid: false }, { t: 'portrait_blue', x: 12, y: 1, solid: false },
    { t: 'sconce', x: 7, y: 1, solid: false }, { t: 'sconce', x: 11, y: 1, solid: false }, { t: 'bookshelf2', x: 16, y: 2 }, { t: 'tall_clock', x: 1, y: 2 },
    { t: 'counter_bank', x: 7, y: 5 }, { t: 'desk2', x: 13, y: 7 }, { t: 'chair_up', x: 14, y: 6, solid: false }, { t: 'globe', x: 17, y: 9 }, { t: 'argand_lamp', x: 3, y: 8 }, { t: 'paper_stack', x: 12, y: 7, solid: false },
    { t: 'strongbox', x: 1, y: 6, evidence: 'check', where: "the Bank's ledger, Washington office", look: "The branch ledger lies open on the strongbox. One entry, 1830: *$5,700,000 — loans to members of Congress and friends of the Bank.* A list of names follows. Henry Clay is near the top. So is Daniel Webster." },
    { t: 'chair_down', x: 4, y: 5, solid: false }, { t: 'armchair', x: 17, y: 5 },
  ],
  npcs: [
    { id: 'bank_clerk', sprite: 'clerk', x: 8, y: 4, dir: 'down', reach: { d: 44 } },
    { id: 'biddle', sprite: 'biddle', x: 15, y: 9, dir: 'left' },
  ],
});

interior('print_shop', {
  name: "Duff Green's Print Shop", wall: 'wall_brick', floor: 'floor_wood2', windows: [15], beams: true,
  objects: [
    { t: 'press', x: 2, y: 4 }, { t: 'counter2', x: 9, y: 6 }, { t: 'type_case', x: 14, y: 4 }, { t: 'type_case', x: 15, y: 4 }, { t: 'barrel', x: 17, y: 4 }, { t: 'crate', x: 17, y: 5 }, { t: 'table1', x: 2, y: 8 },
    { t: 'paper_stack', x: 4, y: 8, solid: false }, { t: 'paper_stack', x: 5, y: 8, solid: false }, { t: 'paper_stack', x: 1, y: 4, solid: false }, { t: 'stove', x: 17, y: 2 },
    { t: 'notice_board', x: 7, y: 1, solid: false, evidence: 'cartoon', where: 'the print shop wall', look: "Pinned to the wall, fresh from the press: *KING ANDREW THE FIRST.* Jackson in a crown and ermine robe, a veto in one hand, the Constitution torn under his boot. Beneath it, a paragraph of furious prose." },
    { t: 'wall_sign', x: 11, y: 1, solid: false }, { t: 'sconce', x: 4, y: 1, solid: false }, { t: 'sconce', x: 13, y: 1, solid: false }, { t: 'argand_lamp', x: 6, y: 8 }, { t: 'bookshelf1', x: 9, y: 2 },
  ],
  npcs: [{ id: 'printer', sprite: 'printer', x: 10, y: 5, dir: 'down', reach: { d: 44 } }],
});

interior('boarding_house', {
  name: "Mrs. Hill's Boarding House — the Parlor", wall: 'wall_paper', floor: 'floor_wood0', windows: [4, 15],
  objects: [
    ...rug('green', 7, 5, 6, 4),
    { t: 'fireplace3', x: 9, y: 1 }, { t: 'bookshelf1', x: 16, y: 2 }, { t: 'portrait_blue', x: 2, y: 1, solid: false }, { t: 'mirror', x: 13, y: 1, solid: false }, { t: 'sconce', x: 6, y: 1, solid: false }, { t: 'sconce', x: 17, y: 1, solid: false },
    { t: 'sofa', x: 2, y: 6 }, { t: 'armchair', x: 14, y: 5 }, { t: 'candle_table', x: 1, y: 4 }, { t: 'washstand', x: 17, y: 4 }, { t: 'tall_clock', x: 18, y: 2 }, { t: 'argand_lamp', x: 5, y: 8 },
    { t: 'table1', x: 16, y: 8, evidence: 'resolutions', where: "Calhoun's papers at the boarding house", look: "Calhoun's papers, stacked with military neatness. On top: a printed copy of the *Virginia and Kentucky Resolutions* of 1798, underlined so heavily in places the pen has cut the paper." },
    { t: 'chair_down', x: 16, y: 9, solid: false }, { t: 'chair_up', x: 12, y: 4, solid: false }, { t: 'paper_stack', x: 15, y: 8, solid: false },
  ],
  npcs: [
    { id: 'calhoun', sprite: 'calhoun', x: 11, y: 7, dir: 'left' },
    { id: 'landlady', sprite: 'lady', x: 3, y: 4, dir: 'down', reach: { d: 20 } },
  ],
});

interior('hotel', {
  name: 'The Indian Queen Hotel — the Parlor', wall: 'wall_plaster_b', floor: 'floor_wood_dark', windows: [3, 9, 16],
  objects: [
    ...rug('red', 6, 5, 8, 4),
    { t: 'wall_map', x: 12, y: 1, solid: false }, { t: 'portrait_red', x: 14, y: 1, solid: false }, { t: 'mirror', x: 6, y: 1, solid: false }, { t: 'sconce', x: 8, y: 1, solid: false }, { t: 'sconce', x: 18, y: 1, solid: false },
    { t: 'sofa', x: 11, y: 4 }, { t: 'counter2', x: 1, y: 4 }, { t: 'candle_table', x: 18, y: 7 }, { t: 'table2', x: 2, y: 8 }, { t: 'chair_up', x: 2, y: 7, solid: false }, { t: 'chair_up', x: 3, y: 7, solid: false },
    { t: 'crate', x: 18, y: 9 }, { t: 'coat_stand', x: 17, y: 4 }, { t: 'argand_lamp', x: 10, y: 9 }, { t: 'spittoon', x: 4, y: 9, solid: false }, { t: 'armchair', x: 15, y: 5 }, { t: 'bookshelf1', x: 4, y: 2 },
    { t: 'wall_sign', x: 1, y: 1, solid: false, look: "The hotel's register. The Cherokee delegation has been here three weeks, petitioning Congress. Their bill is paid in advance, in full." },
  ],
  npcs: [
    { id: 'ross', sprite: 'ross', x: 9, y: 7, dir: 'down' },
    { id: 'delegate', sprite: 'delegate', x: 14, y: 8, dir: 'left' },
  ],
});

interior('white_house', {
  name: "The President's House — the Office", wall: 'wall_plaster', floor: 'floor_wood_pale', windows: [3, 16],
  objects: [
    ...rug('blue', 6, 5, 8, 4),
    { t: 'fireplace3', x: 8, y: 1 }, { t: 'portrait_washington', x: 2, y: 1, solid: false }, { t: 'portrait_jackson', x: 14, y: 1, solid: false }, { t: 'bookshelf2', x: 5, y: 2 }, { t: 'bookshelf2', x: 12, y: 2 },
    { t: 'sconce', x: 7, y: 1, solid: false }, { t: 'sconce', x: 11, y: 1, solid: false }, { t: 'tall_clock', x: 18, y: 2 }, { t: 'coat_stand', x: 17, y: 3 },
    { t: 'desk3', x: 2, y: 6, look: "The President's desk. A stack of bills from Congress, and on top of each, in a furious scrawl: *VETO.* Jackson has rejected more laws than the six presidents before him put together." },
    { t: 'chair_up', x: 3, y: 5, solid: false }, { t: 'armchair', x: 16, y: 6 }, { t: 'globe', x: 18, y: 9 }, { t: 'candle_table', x: 1, y: 9 }, { t: 'argand_lamp', x: 14, y: 8 }, { t: 'spittoon', x: 12, y: 7, solid: false },
    { t: 'paper_stack', x: 5, y: 6, solid: false },
  ],
  npcs: [
    { id: 'jackson', sprite: 'jackson', x: 10, y: 7, dir: 'down' },
    { id: 'servant', sprite: 'servant', x: 4, y: 9, dir: 'right' },
  ],
});

// --- the crime scene: exterior in front of the Capitol ----------------------
(function () {
  const W = 24, H = 17;
  const g = grid(W, H, 'F');
  paint(g, 0, 0, W, 12, 'g');
  paint(g, 0, 15, W, 2, 'm');
  scatter(g, 's', [[0, 13], [23, 13], [1, 14], [22, 16]]);
  ROOMS.capitol_steps = {
    name: 'The Capitol Steps — East Portico', w: W, h: H, ground: g, outdoor: true, fx: 'snow',
    legend: { F: ['flag0', 'flag1'], g: ['grass_snow0', 'grass_snow1'], m: ['mud0', 'mud1'], s: 'grass_snow1' },
    buildings: [
      { b: 'capitol', x: 1, y: 0 },
      { b: 'tree_bare', x: 0, y: 6 }, { b: 'tree_bare', x: 22, y: 6 }, { b: 'lamp_post', x: 1, y: 11 }, { b: 'lamp_post', x: 22, y: 11 },
      { b: 'snow_pile', x: 0, y: 15 }, { b: 'snow_pile', x: 23, y: 16 },
    ],
    npcs: [
      { id: 'guard', sprite: 'guard', x: 6, y: 13, dir: 'right' },
      { id: 'witness', sprite: 'gentleman2', x: 16, y: 13, dir: 'left' },
      { id: 'mourner', sprite: 'lady', x: 19, y: 14, dir: 'left' },
    ],
    hotspots: [
      { x: 10, y: 13, evidence: 'hat', where: 'the Capitol steps, where the pistols were fired', look: "Here, at the foot of the steps. A gentleman's hat lies where it fell — trampled a little, but a good hat. Beaver felt. Inside the band: a small stamped stag." },
      { x: 13, y: 13, evidence: 'pipe', where: 'the Capitol steps, beside the hat', look: "A few feet from the hat, a long clay pipe, snapped in two. The bowl is carved with a palmetto — the tree on South Carolina's flag." },
      { x: 11, y: 12, w: 2, look: "Two dark scorch-marks on the marble where the pistols flashed. Both misfired. The powder was damp, or the caps were bad, or — as half the city is saying — Providence stepped in." },
    ],
    exits: [{ x: 0, y: 16, w: W, h: 1, to: 'street', spawn: 'from_capitol' }],
    spawns: { default: { x: 12, y: 15, dir: 'up' } },
  };
})();
