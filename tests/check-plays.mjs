// Checks every play in index.html and team-plays.json.
// Run with:  node tests/check-plays.mjs     (Node 18 or newer, no installs needed)
// Fails if a play has a forward pass, a player who appears without a starting
// spot, a player number outside 1-15 / o1-o15, or a spot off the pitch.
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = html.indexOf('const BUILTIN=[');
const end = html.indexOf('/* ---------- state');
if (start < 0 || end < 0) { console.error('Could not find the built-in plays in index.html'); process.exit(1); }
const BUILTIN = Function('"use strict"; return (' + html.slice(start + 'const BUILTIN='.length, end).trim().replace(/;$/, '') + ')')();

let team = [];
try {
  const data = JSON.parse(readFileSync(new URL('../team-plays.json', import.meta.url), 'utf8'));
  team = Array.isArray(data) ? data : (data && Array.isArray(data.plays) ? data.plays : []);
} catch (e) { console.error('team-plays.json is not valid JSON: ' + e.message); process.exit(1); }

const ID_RE = /^o?([1-9]|1[0-5])$/;
const label = id => id[0] === 'o' ? 'opposition ' + id.slice(1) : '"' + id + '"';

function resolve(play) {
  let cur = {}, ball = null; const out = [];
  for (const f of play.frames) {
    cur = { ...cur };
    if (f.shift) for (const id of f.shift.ids) { const p = cur[id]; if (p) cur[id] = [p[0] + f.shift.dx, p[1] + f.shift.dy]; }
    for (const [k, v] of Object.entries(f.pos || {})) cur[k] = v;
    if (f.ball !== undefined) ball = f.ball;
    out.push({ pos: cur, ball, kick: !!f.kick, throw: !!f.throw });
  }
  return out;
}

function check(play) {
  const errs = [], seen = new Set();
  if (!play || typeof play.name !== 'string' || !play.name.trim()) return ['missing "name"'];
  if (!Array.isArray(play.frames) || play.frames.length < 2) return ['needs at least 2 steps in "frames"'];
  if (play.frames.length > 30) errs.push('more than 30 steps');
  play.frames.forEach((f, i) => {
    for (const [k, v] of Object.entries(f.pos || {})) {
      if (!ID_RE.test(k)) errs.push(`step ${i + 1}: "${k}" isn't a position`);
      else if (!Array.isArray(v) || v.length !== 2 || !v.every(Number.isFinite)) errs.push(`step ${i + 1}: bad spot for ${label(k)}`);
      else if (v[0] < -12 || v[0] > 82 || v[1] < -15 || v[1] > 115) errs.push(`step ${i + 1}: ${label(k)} is off the pitch`);
      else if (i > 0 && !seen.has(k)) errs.push(`step ${i + 1}: ${label(k)} has no starting spot in step 1`);
      seen.add(k);
    }
    if (i === 0 && f.ball === undefined) errs.push('step 1: no ball');
  });
  if (errs.length) return errs;
  const F = resolve(play);
  for (let k = 0; k < F.length - 1; k++) {
    const A = F[k], B = F[k + 1];
    if (typeof B.ball !== 'string' || B.ball === A.ball || B.kick || B.throw || A.kick) continue;
    const r = B.pos[B.ball], opp = B.ball[0] === 'o';
    const from = typeof A.ball === 'string'
      ? [B.pos[A.ball], [(A.pos[A.ball][0] + B.pos[A.ball][0]) / 2, (A.pos[A.ball][1] + B.pos[A.ball][1]) / 2]]
      : [A.ball];
    const back = Math.min(...from.map(o => opp ? o[1] - r[1] : r[1] - o[1]));
    if (back < 0.5) errs.push(`step ${k + 2}: pass to ${label(B.ball)} goes ${back < 0 ? 'forward' : 'flat'} (${back.toFixed(1)}m)`);
  }
  return errs;
}

let failed = 0;
for (const [source, plays] of [['index.html', BUILTIN], ['team-plays.json', team]]) {
  for (const p of plays) {
    const errs = check(p);
    if (errs.length) { failed++; console.log(`FAIL  ${source}: ${p && p.name}`); errs.forEach(e => console.log('      ' + e)); }
    else console.log(`ok    ${source}: ${p.name}`);
  }
}
console.log(failed ? `\n${failed} play(s) need fixing.` : `\nAll ${BUILTIN.length + team.length} plays passed.`);
process.exit(failed ? 1 : 0);
