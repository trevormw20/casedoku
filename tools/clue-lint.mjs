// Banned-word lint for detective clue/observation text.
// Governing law (DETECTIVE-CLUE-REDESIGN.md §2): a clue states only what is OBSERVED.
// It may never name what that means. Test: "could a camera have recorded this?"
//
// Each entry is { re, label }. lintText returns every hit (substring + label + index).
// Runs ONLY over player-facing clue text (role / resolvedText / observation / weapon /
// motive-evidence strings) — NOT over accusation slot labels or case-closed prose, where
// conclusions are the player's and are allowed.

export const BANNED = [
  { re: /\bdespite\b/gi,                         label: 'despite' },
  { re: /\bthough\b[^.!?]*\bactually\b/gi,       label: 'though…actually' },
  { re: /\bactually\b/gi,                        label: 'actually (judgement)' },
  { re: /\bbut not\b/gi,                          label: 'but not' },
  { re: /\bnot\b[^.,;!?]*\bbut\b/gi,             label: 'not X but Y' },
  { re: /\bsuspicious(ly)?\b/gi,                 label: 'suspicious' },
  { re: /\boddly\b/gi,                           label: 'oddly' },
  { re: /\bstrangely\b/gi,                        label: 'strangely' },
  { re: /\bconveniently\b/gi,                     label: 'conveniently' },
  { re: /\bplanted\b/gi,                          label: 'planted' },
  { re: /\bstaged\b/gi,                           label: 'staged' },
  { re: /\bfaked?\b/gi,                           label: 'fake/faked' },
  { re: /\bframed\b/gi,                           label: 'framed' },
  { re: /\bpossible motive\b/gi,                 label: 'possible motive' },
  { re: /\bgives?\b[^.!?]*\bmotive\b/gi,         label: 'gives X a motive' },
  { re: /\bmotive\b/gi,                           label: 'motive (in clue)' },
  { re: /\breason to\b/gi,                        label: 'reason to' },
  { re: /\bproves?\b/gi,                          label: 'proves' },
  { re: /\bproven\b/gi,                           label: 'proven' },
  { re: /\bconfirms?\b/gi,                        label: 'confirms' },
  { re: /\btherefore\b/gi,                        label: 'therefore' },
  { re: /\bso\b/gi,                               label: 'so (connective)' },
  { re: /\bmust have\b/gi,                        label: 'must have' },
  { re: /\bhad to\b/gi,                           label: 'had to' },
  { re: /\bclearly\b/gi,                          label: 'clearly' },
  { re: /\bobviously\b/gi,                        label: 'obviously' },
  { re: /\bthe real weapon\b/gi,                 label: 'the real weapon' },
  { re: /\bthe true weapon\b/gi,                 label: 'the true weapon' },
  { re: /\bthe killer\b/gi,                       label: 'the killer' },
  { re: /\bthe culprit\b/gi,                      label: 'the culprit' },
  { re: /\bguilty\b/gi,                           label: 'guilty' },
  { re: /\blied\b/gi,                             label: 'lied' },
  // judgement verbs / suspicion adjectives (doc §2 positive rule)
  { re: /\bimplicates?\b/gi,                      label: 'implicates' },
  { re: /\bdamning\b/gi,                          label: 'damning' },
  { re: /\btelling(ly)?\b/gi,                     label: 'telling' },
  { re: /\bincriminat\w*/gi,                      label: 'incriminating' },
];

export function lintText(text, { source = '' } = {}) {
  const hits = [];
  if (typeof text !== 'string') return hits;
  for (const { re, label } of BANNED) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      hits.push({ source, label, match: m[0], index: m.index });
      if (m.index === re.lastIndex) re.lastIndex++; // guard zero-width
    }
  }
  return hits;
}

// Detect any suspect display-name or slug appearing in pre-accusation text.
// names: array of strings (display names + slugs) to forbid. Matches whole words,
// case-insensitive. "The Widow" -> also flags bare "Widow".
export function findSuspectNames(text, names) {
  const hits = [];
  if (typeof text !== 'string') return hits;
  for (const raw of names) {
    // build word-token variants: full display name, and each significant token (>=4 chars,
    // skipping the article "the"/"a")
    const tokens = new Set();
    tokens.add(raw.trim());
    for (const t of raw.split(/\s+/)) {
      const w = t.replace(/[^A-Za-z'-]/g, '');
      if (w && !/^(the|a|an|of|and)$/i.test(w) && w.length >= 4) tokens.add(w);
    }
    for (const tok of tokens) {
      const re = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let m;
      while ((m = re.exec(text)) !== null) {
        hits.push({ name: raw, match: m[0], index: m.index });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
  }
  return hits;
}
