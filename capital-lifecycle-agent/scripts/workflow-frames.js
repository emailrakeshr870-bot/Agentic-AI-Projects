const { chromium } = require('playwright'); const path = require('path');
const R = process.argv[2] || path.resolve(__dirname, '..'); const out = n => path.resolve(R, 'docs/decks/workflow-frames', n);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1500,height:1100}, deviceScaleFactor:2, reducedMotion:'reduce' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('file://' + path.resolve(R, 'index.html')); await p.waitForTimeout(300);
  await p.click('#tab-flow'); await p.waitForTimeout(200);
  const shot = async (name, code, sel) => {
    await p.evaluate(({ code, sel }) => { new Function(code)(); WF.sel = sel; renderWorkflowPanel(false); }, { code, sel });
    await p.waitForTimeout(80);
    await (await p.$('.wfwrap')).screenshot({ path: out(name) });
    const info = await p.evaluate(() => ({ path: WF.path.join(' > '), last: S.log[S.log.length-1].text, t: fmt(S.t) }));
    console.log(name, '|', info.t, '|', info.last, '|', info.path);
  };
  await shot('01-start.png', "personaId='greenline'; renderPersonas(); startJourney();", 'decide');
  await shot('02-click.png', "doSignal('click');", 'landing');
  await shot('03-lp-miss-replan.png', "doSignal('lp_none');", 'lpflag');
  await shot('04-abandon.png', "doSignal('click'); doSignal('start'); doSignal('abandon');", 'abandon');
  await shot('05-reminder.png', "doSignal('noresp');", 'abandon');
  await shot('06-submitted.png', "doSignal('click'); doSignal('submit');", 'onboarding');
  await shot('07-silent-switch.png', "startJourney(); doSignal('ignore');", 'score');
  await shot('08-silent-pause.png', "doSignal('noresp'); doSignal('ignore');", 'decide');
  await shot('09-not-now.png', "startJourney(); doSignal('nn_cost');", 'snooze');
  await shot('10-opt-out.png', "personaId='northbeam'; renderPersonas(); startJourney(); doSignal('ignore'); doSignal('unsub');", 'removech');
  await shot('11-risk.png', "personaId='harbor'; renderPersonas(); startJourney(); doSignal('click'); doSignal('lp_none'); doSignal('risk');", 'servicing');
  await b.close();
})();
