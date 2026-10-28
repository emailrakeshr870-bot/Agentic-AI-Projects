// Runs the decision engine and compliance rules headlessly, straight from index.html.
// Usage: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const html = readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8');
const start = html.indexOf('/* ================= ENGINE (pure) ================= */');
const end = html.indexOf('/* ================= UI ================= */');
assert.ok(start > 0 && end > start, 'engine markers not found in index.html');
const ctx = vm.createContext({});
vm.runInContext(html.slice(start, end) + '\nthis.api = { PERSONAS, newState, step, applySignal, checkMessage, fixMessage, EXP };', ctx);
const { PERSONAS, newState, step, applySignal, checkMessage, fixMessage, EXP } = ctx.api;

function run(personaId, script){
  const S = newState(PERSONAS[personaId]);
  step(S);
  for (let sig of script){
    if (sig === 'neg'){
      const p = S.pending; if (!p) break;
      sig = p.kind === 'touch' && p.ch === 'inapp' && !p.abandon ? 'ignore' : 'noresp';
    }
    assert.ok(applySignal(S, sig), `signal "${sig}" should apply`);
    if (!['landing', 'app'].includes(S.stage)) step(S);
  }
  return S;
}
const sends = S => S.log.filter(e => e.kind === 'send');

test('engaged path converts after a landing-page miss and an abandoned application', () => {
  const S = run('greenline', ['click','lp_none','click','start','abandon','noresp','click','submit']);
  assert.equal(S.stage, 'submitted');
  assert.ok(S.learn.some(l => l.includes('Landing page didn’t convert')), 'landing-page miss is learned');
  const ab = S.log.findIndex(e => e.text.startsWith('Abandoned'));
  const nudge = S.log.slice(ab).find(e => e.kind === 'send');
  assert.ok(nudge.t - S.log[ab].t <= 1, 'first abandonment nudge goes out within an hour');
});

test('follow-ups after a customer action respect the comfort window (no big-brother timing)', () => {
  const S = run('greenline', ['click','lp_none']);
  const lp = S.log.find(e => e.text.startsWith('Left the landing page'));
  const next = sends(S).find(e => e.t > lp.t);
  assert.ok(next.t - lp.t >= 12, 'next marketing touch is not immediate');
});

test('silent path switches channel, rotates themes, then pauses', () => {
  const S = run('greenline', ['neg','neg','neg','neg','neg']);
  const chans = new Set(sends(S).map(e => e.text.split(':')[0]));
  assert.ok(chans.size >= 2, 'more than one channel was tried');
  assert.equal(S.stage, 'paused');
});

test('risk event suppresses all promotion', () => {
  const S = run('harbor', ['click','lp_none','risk']);
  assert.equal(S.stage, 'servicing');
  assert.equal(S.decision.type, 'suppressed');
});

test('"Not now" reasons set different snooze lengths', () => {
  const later = run('greenline', ['nn_later']);
  const need = run('greenline', ['nn_need']);
  assert.ok(need.snoozeUntil - need.t > later.snoozeUntil - later.t);
});

test('unsubscribe removes the channel permanently and is logged as a loss', () => {
  const S = run('northbeam', ['ignore','unsub']);
  assert.equal(S.consent.email, false);
  assert.ok(S.learn.some(l => l.includes('12-month channel value')));
});

test('every prepared message passes the compliance rules', () => {
  for (const P of Object.values(PERSONAS)) for (const [k, T] of Object.entries(P.T)) {
    const msgs = { inapp:[T.inapp.title, T.inapp.body, T.inapp.cta].join(' '), email:[T.email.subject, T.email.body, T.email.cta].join(' '), push:T.push, sms:T.sms };
    for (const [ch, txt] of Object.entries(msgs)) { const ids = checkMessage(txt, { ch, smsConsent:true, hour:10 }).map(r => r.id); assert.equal(ids.length, 0, `${P.id}/${k}/${ch}: ${ids.join(', ')}`); }
  }
});

test('compliance fixer repairs a risky offer', () => {
  const bad = 'Congrats! You’re approved for $50K at 8% APR. Act now — this offer expires tonight!';
  assert.ok(checkMessage(bad, { ch:'email' }).length >= 3);
  assert.equal(checkMessage(fixMessage(bad, { ch:'email' }), { ch:'email' }).length, 0);
});

test('weekly-cap experiment picks the cell with the highest net value', () => {
  const best = EXP.cap.reduce((a, b) => b.net > a.net ? b : a);
  assert.equal(best.c, 3);
});
