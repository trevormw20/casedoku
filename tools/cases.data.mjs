// ── Hand-authored detective cases — PROSE SOURCE OF TRUTH ──────────────────────
// Authored per DETECTIVE-CLUE-REDESIGN.md: facts belong to the game, conclusions to
// the player. Every observation `text` is a bare OBSERVATION (camera test), names no
// suspect, and uses no banned word. The culprit's name is spoken in `winStory`
// (post-accusation) and — once a labeled cell is solved — in that cell's `resolvedText`
// via the {who} placeholder (the marker the player themselves placed there).
//
// GRIDS (solution/givens/murderCell/cell indices) are GENERATED at hard difficulty by
// tools/gen-grids.mjs into tools/cases.grids.mjs and imported here, so regenerating the
// grids never touches the writing. tools/verify-cases.mjs re-proves uniqueness +
// culprit placement + forcing; tools/embed-cases.mjs serialises the merged result into
// index.html between the HAND_CASES markers.
//
// unlock.on: "open" | "labeled" (a labeledCell id resolves) | "box" (every cell of box N
// correct except the scene) | "grid" (whole grid solved except the scene). proof:true
// marks the single KEY-PROOF observation.
import { GRIDS } from './cases.grids.mjs';

export const HAND_CASES = [
  // ══════════════════════ CASE 1 — planted / obvious-weapon red herring ══════════════════════
  {
    id: 'case1',
    title: 'The Blade on the Wall',
    caseNo: 1,
    misdirection: 'planted weapon',
    tier: 'hard',
    seed: 101,
    code: 'DET-1',
    victim: { display: 'Lord Ambrose Vane', slug: 'lord-ambrose-vane' },
    sceneRoomName: 'the Gun Room',
    cast: ['colonel', 'doctor', 'baroness', 'viscount', 'governess', 'curate', 'huntsman', 'dowager', 'reporter'],
    culprit: 'baroness',
    culpritValue: 3,
    rooms: ['study', 'hall', 'library', 'dining', 'gunroom', 'drawingroom', 'billiard', 'smokingroom', 'conservatory'],
    solution: GRIDS.case1.solution,
    givens: GRIDS.case1.givens,
    murderCell: GRIDS.case1.murderCell,
    sceneBox: GRIDS.case1.sceneBox,
    labeledCells: [
      { cell: GRIDS.case1.cells.landing, id: 'landing', role: 'the figure seen crossing the landing at half past midnight',
        resolvedText: 'The figure on the landing at half past midnight was {who}.', tiesToScene: true },
      { cell: GRIDS.case1.cells.expose, id: 'expose', role: 'the name ringed in the margin of the morning proof-sheet',
        resolvedText: 'The name ringed in the morning proof-sheet was {who}.', tiesToScene: true },
    ],
    weapon: { true: 'hatpin', obvious: 'sabre', candidates: ['sabre', 'hatpin', 'letteropener'] },
    motive: { tag: 'reputation', correct: 'a scandal about to reach print',
      distractors: ['a disputed inheritance', 'an old betrayal at sea'] },
    keyProof: 'landing',
    narrative: 'Frost on the gun-room glass, and the great house very still. Lord Ambrose Vane will host no more shooting parties. Inspector Graves lays out the night on his grid; every place you can settle, the file can speak to.',
    observations: [
      { tag: 'OBJECTIVE', proof: false, unlock: { on: 'open' },
        text: "Reconstruct the night on Inspector Graves' grid. Each position you settle lets the file record a new observation." },
      { tag: 'THE SCENE', proof: false, unlock: { on: 'open' },
        text: 'Lord Ambrose Vane lies in the Gun Room; the ceremonial sabre from the wall rests across the desk beside him. On the hall table, a hatpin cushion set for six holds only five.' },
      { tag: 'OPPORTUNITY', proof: true, unlock: { on: 'labeled', id: 'landing' },
        text: 'A statement in the file: at half past midnight, a figure was seen crossing the landing above the hall.' },
      { tag: 'THE WEAPON', proof: false, unlock: { on: 'box', box: 4 },
        text: 'The sabre sits flush in its bracket, the dust along the mount unbroken in one line. The wound at the base of the skull is a single puncture, no wider than a pin.' },
      { tag: 'THE DESK', proof: false, revealsMotive: true, unlock: { on: 'labeled', id: 'expose' },
        text: "In the desk drawer, a printer's proof-sheet for the morning society column — one name ringed in the margin, beside a paragraph marked for the front page." },
    ],
    winStory: "On Graves' grid, one marker stands on the landing at half past midnight, in the ringed margin of the morning's column, and in the Gun Room where Lord Ambrose fell — the same hand in all three. The sabre never left its bracket; the wound was a pin's width, and a hatpin was gone from the hall. The Baroness climbed the stairs to stop a column that would have printed her ruin, and left a blade on the wall to carry the blame.",
  },

  // ══════════════════════ CASE 2 — false alibi ══════════════════════
  {
    id: 'case2',
    title: 'The Wet Umbrella',
    caseNo: 2,
    misdirection: 'false alibi',
    tier: 'hard',
    seed: 202,
    code: 'DET-2',
    victim: { display: 'Harlan Cross', slug: 'financier-harlan-cross' },
    sceneRoomName: 'the Library',
    cast: ['butler', 'actress', 'doctor', 'colonel', 'medium', 'judge', 'banker', 'nurse', 'vicar'],
    culprit: 'judge',
    culpritValue: 6,
    rooms: ['hall', 'lounge', 'library', 'dining', 'orangery', 'billiard', 'study', 'conservatory', 'drawingroom'],
    solution: GRIDS.case2.solution,
    givens: GRIDS.case2.givens,
    murderCell: GRIDS.case2.murderCell,
    sceneBox: GRIDS.case2.sceneBox,
    labeledCells: [
      { cell: GRIDS.case2.cells.sidedoor, id: 'sidedoor', role: 'the person the side door was unlatched for after the rain',
        resolvedText: 'The one admitted at the side door after the rain was {who}.', tiesToScene: true },
      { cell: GRIDS.case2.cells.club, id: 'club', role: 'the member signed out of the club at eleven o\'clock',
        resolvedText: 'The member signed out of the club at eleven was {who}.', tiesToScene: true },
    ],
    weapon: { true: 'decanter', obvious: 'revolver', candidates: ['revolver', 'decanter', 'paperweight'] },
    motive: { tag: 'blackmail', correct: 'a secret paid off month after month',
      distractors: ['a debt at the gaming table', 'an old grudge from the bench'] },
    keyProof: 'sidedoor',
    narrative: 'Rain has come and gone over the park, and Harlan Cross keeps his last appointment in the Library. He was a lender of money and a keeper of secrets. Graves sets the evening on his grid and begins to sort the callers from the sworn-absent.',
    observations: [
      { tag: 'OBJECTIVE', proof: false, unlock: { on: 'open' },
        text: "Reconstruct the evening on Inspector Graves' grid. Each position you settle lets the file record a new observation." },
      { tag: 'THE SCENE', proof: false, unlock: { on: 'open' },
        text: 'Harlan Cross lies in the Library; the revolver from the desk drawer lies open beside him, six chambers loaded. By the side door, a black umbrella stands in the stand, beaded with rain.' },
      { tag: 'AN ACCOUNT', proof: false, unlock: { on: 'open' },
        text: 'An account given to the file: one guest dined at his club across the park and did not leave it until morning.' },
      { tag: 'THE WEAPON', proof: false, unlock: { on: 'box', box: 2 },
        text: "The revolver's six chambers are loaded and cold; no round has been fired. On the desk, a wet ring the width of a decanter's base, and a hairline of glass swept toward the hearth." },
      { tag: 'OPPORTUNITY', proof: true, unlock: { on: 'labeled', id: 'sidedoor' },
        text: 'The side-door latch was lifted from within after the rain. The umbrella in the stand is still wet to the touch; the rain over the park stopped at midnight.' },
      { tag: 'THE CLUB BOOK', proof: false, unlock: { on: 'labeled', id: 'club' },
        text: "The night-porter's book at the club records one member signed out at eleven o'clock, with no hand signing him in again." },
      { tag: 'THE SAFE', proof: false, revealsMotive: true, unlock: { on: 'grid' },
        text: 'Behind the shelves a wall-safe stands open: a strongbox of receipts, one for every month, each for a sum in cash, each initialled by the same hand.' },
    ],
    winStory: "The club book shows one member gone by eleven; the side door was lifted from within after the rain, and the umbrella hung wet until dawn. The revolver was never fired — the decanter left its ring on the desk. On Graves' grid the same marker stands at the club door, the side door, and the Library where Cross fell. Month after month the Judge had paid Harlan Cross in cash to keep an old matter off the record, and walked in from the rain to close the account for good.",
  },

  // ══════════════════════ CASE 3 — the overlooked one ══════════════════════
  {
    id: 'case3',
    title: 'The Cellar Ledger',
    caseNo: 3,
    misdirection: 'overlooked culprit',
    tier: 'hard',
    seed: 303,
    code: 'DET-3',
    victim: { display: 'Old Mr. Pemberton', slug: 'old-mr-pemberton' },
    sceneRoomName: 'the Wine Cellar',
    cast: ['butler', 'viscount', 'doctor', 'baroness', 'colonel', 'housekeeper', 'vintner', 'groundskeeper', 'governess'],
    culprit: 'groundskeeper',
    culpritValue: 8,
    rooms: ['hall', 'dining', 'library', 'servantshall', 'kitchen', 'study', 'billiard', 'gunroom', 'wine-cellar'],
    solution: GRIDS.case3.solution,
    givens: GRIDS.case3.givens,
    murderCell: GRIDS.case3.murderCell,
    sceneBox: GRIDS.case3.sceneBox,
    labeledCells: [
      { cell: GRIDS.case3.cells.ledger, id: 'ledger', role: 'whoever set down the last line in the cellar ledger',
        resolvedText: 'The last hand in the cellar ledger was {who}.', tiesToScene: true },
      { cell: GRIDS.case3.cells.key, id: 'key', role: 'whose key turned the cellar lock from the passage side',
        resolvedText: 'The key that turned the cellar lock belonged to {who}.', tiesToScene: true },
      { cell: GRIDS.case3.cells.quarrel, id: 'quarrel', role: 'the guest who quarrelled with Mr. Pemberton at dinner',
        resolvedText: 'The guest who quarrelled at dinner was {who}.', tiesToScene: false },
    ],
    weapon: { true: 'wrench', obvious: 'bottle', candidates: ['bottle', 'wrench', 'doorstop'] },
    motive: { tag: 'revenge', correct: 'a family struck from its land',
      distractors: ['a gambling debt come due', 'a share of the will denied'] },
    keyProof: 'key',
    narrative: 'A raw wind off the downs, and Old Mr. Pemberton found among his own casks. Landlord to half the valley, and not loved by all of it. The house has already fixed on the quarrel at dinner — but Graves lets the grid speak before the household does.',
    observations: [
      { tag: 'OBJECTIVE', proof: false, unlock: { on: 'open' },
        text: "Reconstruct the night on Inspector Graves' grid. Each position you settle lets the file record a new observation." },
      { tag: 'THE SCENE', proof: false, unlock: { on: 'open' },
        text: 'Old Mr. Pemberton lies in the Wine Cellar; a broken wine bottle lies in the straw by his hand. On the cellar step, a single boot-print in the damp — a workman\'s hobnail sole.' },
      { tag: 'THE QUARREL', proof: false, unlock: { on: 'labeled', id: 'quarrel' },
        text: 'An account in the file: at dinner, raised voices — one guest and Mr. Pemberton, over the reading of the will, and a chair pushed back hard from the table.' },
      { tag: 'THE WEAPON', proof: false, unlock: { on: 'box', box: 8 },
        text: 'The bottle break is old — its edges dulled, the glass dry and grey with cellar dust. From the tool-rack a heavy spanner is gone, its outline left in the grease on the wall.' },
      { tag: 'THE LEDGER', proof: false, unlock: { on: 'labeled', id: 'ledger' },
        text: 'The cellar ledger\'s last line was set down in a working hand, the ink still wet enough to smudge under a thumb.' },
      { tag: 'THE KEY', proof: true, unlock: { on: 'labeled', id: 'key' },
        text: 'The cellar door was locked from the passage side. Of the household rings, one key turns that lock from without — the one kept with the garden staff.' },
      { tag: 'THE TENANCY', proof: false, revealsMotive: true, unlock: { on: 'grid' },
        text: 'Folded into the ledger\'s spine, an eviction order under the estate seal: a cottage and its land named, and a family struck from the tenancy in a single line.' },
    ],
    winStory: "The quarrel at dinner turned every head toward the man who stood to inherit — but the cellar kept its own account. The bottle was long broken; a spanner was gone from the rack. The last line of the ledger was set in a working hand, the door locked from the passage with the garden-staff key, and a hobnail print pressed into the step. On Graves' grid the ledger, the key, and the cellar floor where Mr. Pemberton fell all hold one marker — the Groundskeeper, whose family had been struck from their land in a single line, come back to answer it. The quarrel only raised a voice; the man no one watched raised his hand.",
  },
];

export default HAND_CASES;
