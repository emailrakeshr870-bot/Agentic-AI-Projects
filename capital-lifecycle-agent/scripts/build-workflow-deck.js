// Builds docs/decks/workflow-walkthrough.pptx from the frames in docs/decks/workflow-frames.
// Usage: npm i -D pptxgenjs && node scripts/build-workflow-deck.js
// The .pptx is a local build artifact (gitignored); the committed deck is the PDF export.
const pptxgen = require('pptxgenjs');
const path = require('path');
const R = process.argv[2] || path.resolve(__dirname, '..'), OUT = process.argv[3] || path.resolve(R, 'docs/decks/workflow-walkthrough.pptx');
const F = n => path.resolve(R, 'docs/decks/workflow-frames', n);
const THEME = { name:'Capital Lifecycle', headFontFace:'Calibri', bodyFontFace:'Calibri',
  colors:{ dk1:'0F2230', lt1:'FFFFFF', dk2:'56676F', lt2:'F2F5F3', accent1:'0E7C5A', accent2:'2B5BA8', accent3:'9A5B00', accent4:'AE2A21', accent5:'3DBE8B', accent6:'DAEEE4', hlink:'2B5BA8', folHlink:'56676F' } };
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Capital Lifecycle Agent: workflow walkthrough';
pres.subject = 'Workflow walkthrough of an adaptive next-best-action concept demo';
pres.company = 'Rakesh R. Iyer';
pres.author = 'Rakesh R. Iyer';
pres.theme = { headFontFace:THEME.headFontFace, bodyFontFace:THEME.bodyFontFace };

pres.defineSlideMaster({ title:'TITLE_DARK', background:{ color:'0F2230' }, objects:[
  { placeholder:{ options:{ name:'title', type:'title', x:0.8, y:2.2, w:11.7, h:1.6, fontSize:44, bold:true, color:'FFFFFF', valign:'bottom', align:'left' }, text:'' } },
  { placeholder:{ options:{ name:'body', type:'body', x:0.8, y:3.95, w:11.2, h:1.4, fontSize:20, color:'BFD8CC', valign:'top' }, text:'' } }
]});
pres.defineSlideMaster({ title:'CONTENT', background:{ color:'FFFFFF' }, margin:[0.5,0.6,0.5,0.6], objects:[
  { placeholder:{ options:{ name:'title', type:'title', x:0.6, y:0.35, w:12.1, h:0.8, fontSize:32, bold:true, color:'0F2230', valign:'middle' }, text:'' } },
  { text:{ text:'Capital Lifecycle Agent · Rakesh R. Iyer · concept demo, synthetic data', options:{ x:0.6, y:7.05, w:7, h:0.3, fontSize:10, color:'56676F' } } }
], slideNumber:{ x:12.2, y:7.05, w:0.6, h:0.3, fontSize:10, color:'56676F', align:'right' } });

function titleSlide(t, sub, notes, footer){
  const s = pres.addSlide({ masterName:'TITLE_DARK', sectionTitle:currentSection });
  s.background = { color:'0F2230' };
  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:13.333, h:7.5, fill:{ color:'0F2230' }, line:{ color:'0F2230' }, objectName:'dark background' });
  s.addText(t, { placeholder:'title' }); s.addText(sub, { placeholder:'body' });
  s.addText('Rakesh R. Iyer', { x:0.9, y:5.55, w:8, h:0.45, fontSize:18, bold:true, color:'FFFFFF', margin:0, isTextBox:true, objectName:'author' });
  s.addText(footer, { x:0.9, y:6.6, w:9, h:0.4, fontSize:12, color:'8FA3B5', margin:0, isTextBox:true, objectName:'footer' });
  s.addNotes(notes); return s;
}
let currentSection = '';
function section(t){ currentSection = t; pres.addSection({ title:t }); }
function stepSlide(t, img, cols, notes){
  const s = pres.addSlide({ masterName:'CONTENT', sectionTitle:currentSection });
  s.addText(t, { placeholder:'title' });
  const w = 11.0, h = w * 1096 / 2812, x = (13.333 - w) / 2;
  s.addImage({ path:F(img), x, y:1.25, w, h, altText:t + ' (workflow diagram)', objectName:'workflow' });
  const cw = 3.85, gap = 0.27, y = 1.25 + h + 0.18, x0 = 0.6;
  cols.forEach(([head, body, color], i) => {
    const cx = x0 + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:cx, y, w:cw, h:1.15, fill:{ color:'F2F5F3' }, line:{ color:'F2F5F3' }, rectRadius:0.08, objectName:'card' + i });
    s.addShape(pres.shapes.OVAL, { x:cx + 0.15, y:y + 0.17, w:0.18, h:0.18, fill:{ color }, line:{ color }, objectName:'dot' + i });
    s.addText(head, { x:cx + 0.42, y:y + 0.08, w:cw - 0.55, h:0.36, fontSize:14, bold:true, color:'0F2230', margin:0, isTextBox:true, valign:'middle' });
    s.addText(body, { x:cx + 0.15, y:y + 0.45, w:cw - 0.3, h:0.66, fontSize:14, color:'56676F', margin:0, isTextBox:true, valign:'top' });
  });
  s.addNotes(notes);
  return s;
}
const G = '0E7C5A', B = '2B5BA8', W = '9A5B00', RD = 'AE2A21', K = '0F2230';

section('Overview');
titleSlide('The journey as a workflow', 'An adaptive next-best-action engine for small-business lines of credit, term loans and credit cards, shown node by node', 'This deck walks through the Workflow view of the demo. Each slide is a snapshot of the live engine after one customer action or inaction. Dashed green is the path that just ran; the pulsing node is where the customer is now.', 'Concept demo · synthetic data · not affiliated with Intuit');

stepSlide('One loop, from need signal to response', '01-start.png', [
  ['Trigger', 'Greenline’s forecast shows an $18K gap before Nov 20', B],
  ['Engine', 'Gate, update state, score, decide, check compliance, route', K],
  ['Result', 'In-product card at 7\u00A0AM, this owner’s strongest hour', G]
], 'The main row is the decision loop: eligibility gate, update state, score options, send or wait, compliance check, route by channel. The engine scored every allowed hour and picked Wednesday 7\u00A0AM in-product because that is when this owner engages. The response window then waits for what the customer does.');

// legend slide
{
  const s = pres.addSlide({ masterName:'CONTENT', sectionTitle:currentSection });
  s.addText('How to read the workflow', { placeholder:'title' });
  const rows = [
    [B, 'Trigger', 'Need signals and risk events that start or interrupt the journey'],
    [K, 'Logic', 'Gate, state update, scoring, send-or-wait, routing, classification'],
    [G, 'Action or outcome', 'Channels, landing page, application, onboarding'],
    [W, 'Wait or learn', 'Response windows, abandonment save, snooze, page flags'],
    [RD, 'Stop', 'Opt-outs and the Servicing hand-off end promotion']
  ];
  rows.forEach(([c, h, d], i) => {
    const y = 1.45 + i * 0.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:0.7, y, w:0.6, h:0.6, fill:{ color:c }, line:{ color:c }, rectRadius:0.12, objectName:'kind' + i });
    s.addText(h, { x:1.55, y:y - 0.02, w:4.6, h:0.34, fontSize:18, bold:true, color:'0F2230', margin:0, isTextBox:true });
    s.addText(d, { x:1.55, y:y + 0.32, w:4.9, h:0.34, fontSize:14, color:'56676F', margin:0, isTextBox:true });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:7.1, y:1.45, w:5.55, h:4.6, fill:{ color:'F2F5F3' }, line:{ color:'F2F5F3' }, rectRadius:0.08, objectName:'loopcard' });
  s.addText('The adaptive loop', { x:7.45, y:1.65, w:4.9, h:0.45, fontSize:20, bold:true, color:'0F2230', margin:0, isTextBox:true });
  const steps = ['Sense: capture clicks, visits and silence', 'Interpret: update intent, affinity, concern', 'Decide: channel, time, message, or wait', 'Act: send within caps and consent', 'Observe: wait out the response window'];
  steps.forEach((t, i) => {
    const y = 2.3 + i * 0.68;
    s.addShape(pres.shapes.OVAL, { x:7.45, y, w:0.42, h:0.42, fill:{ color:'0E7C5A' }, line:{ color:'0E7C5A' }, objectName:'num' + i });
    s.addText(String(i + 1), { x:7.45, y, w:0.42, h:0.42, fontSize:14, bold:true, color:'FFFFFF', align:'center', valign:'middle', margin:0, isTextBox:true });
    s.addText(t, { x:8.05, y:y - 0.02, w:4.4, h:0.46, fontSize:15, color:'0F2230', margin:0, isTextBox:true, valign:'middle' });
  });
  s.addText('Dashed green = the path that just ran · pulsing node = where the customer is now · badge = times a node ran', { x:0.7, y:6.35, w:12, h:0.4, fontSize:12, italic:true, color:'56676F', margin:0, isTextBox:true });
  s.addNotes('Five node types, color-coded. Everything loops: after each response window the signal is classified and the customer re-enters Update state through the Re-plan node.');
}

section('Engaged path');
stepSlide('A click lands on the landing page', '02-click.png', [
  ['Signal', 'Clicked the in-product CTA', G],
  ['Engine', 'Intent +20, in-product affinity +0.15', K],
  ['Next', 'Hold all outbound while the customer is in flow', B]
], 'Response window to Classify signal to Landing page. A click is the strongest owned-channel signal; email opens are not used because they are unreliable.');
stepSlide('Leaving the page re-plans the message', '03-lp-miss-replan.png', [
  ['Signal', 'Left the landing page without taking action', W],
  ['Engine', 'Theme marked as not landing; page flagged for a test', K],
  ['Next', 'Cost message with a calculator, next day at 7\u00A0AM, not instantly', G]
], 'Landing page to Flag page plus theme to Re-plan, then the full decision loop. The follow-up waits for the next strong slot because an immediate retarget would feel intrusive; the cadence cost in scoring makes that trade-off explicit.');
stepSlide('An abandoned application gets an immediate save', '04-abandon.png', [
  ['Signal', 'Started, then abandoned the application', W],
  ['Engine', 'Abandonment branch: service moment, no cadence cost', K],
  ['Next', 'Email within 15\u00A0minutes: “Your application is saved”', G]
], 'Application to Abandonment save to Compliance check to Route to Email. The abandonment branch bypasses scoring delays because the customer expects a save-your-progress message.');
stepSlide('One reminder inside 24 hours, on a new channel', '05-reminder.png', [
  ['Signal', 'No return after the email nudge', W],
  ['Engine', 'Picks a different channel with a slot before the deadline', K],
  ['Next', 'In-product “Resume application” at 6\u00A0PM the same day', G]
], 'Response window to Classify to Abandonment save again. Only one reminder is allowed inside 24 hours, and it uses a different channel from the first nudge.');
stepSlide('Submitted: hand off to onboarding', '06-submitted.png', [
  ['Signal', 'Came back and submitted the application', G],
  ['Engine', 'This journey ends', K],
  ['Next', 'Onboarding journey: funding, autopay, first draw', G]
], 'Application to Onboarding. The acquisition journey ends; onboarding and activation journeys take over with their own signals.');

section('Silent and negative paths');
stepSlide('Silence switches the channel', '07-silent-switch.png', [
  ['Signal', 'Ignored the in-product card for 3 sessions', W],
  ['Engine', 'In-product affinity −0.15; theme rotates', K],
  ['Next', 'Email with a cost message at a strong evening slot', G]
], 'Response window to Classify to Re-plan, then the loop. Silence is treated as information, not as a no: the channel that went unanswered pays a repeat cost, so a different channel wins.');
stepSlide('Three misses in a row: the engine waits', '08-silent-pause.png', [
  ['Signal', 'No click on email, then another ignored card', W],
  ['Engine', 'Three unanswered touches; opt-out risk rising', K],
  ['Next', 'Wait for a new need signal instead of adding noise', W]
], 'The decision node routes to Wait for new need. A new need signal, such as an invoice going past due, restarts the journey through the Need signal node.');
stepSlide('“Not now” snoozes by reason', '09-not-now.png', [
  ['Signal', '“Not now: worried about the cost”', W],
  ['Engine', '7-day snooze; next message will lead with cost', K],
  ['Next', 'Snooze ends, or a new need ends it early', B]
], 'Classify to Snooze by reason. Reasons map to tested snooze lengths: 7 days for remind me later and cost concerns, 30 days for do not need funding or already have financing.');
stepSlide('An opt-out removes the channel for good', '10-opt-out.png', [
  ['Signal', 'Unsubscribed from email', RD],
  ['Engine', 'Email removed; about $810 of 12-month channel value lost', K],
  ['Next', 'Re-plan on remaining channels, or wait', W]
], 'Classify to Remove channel to Re-plan. This is the worst outcome, which is why every send prices in opt-out risk and the preference center offers fewer emails before unsubscribe.');
stepSlide('A risk event overrides every stage', '11-risk.png', [
  ['Signal', 'Late payment reported on an existing account', RD],
  ['Engine', 'Suppress all Capital and card promotion', K],
  ['Next', 'Servicing takes over with one shared suppression list', RD]
], 'Risk event to Servicing hand-off. It can fire at any point in the journey.');

section('Close');
titleSlide('Every action or inaction re-enters the loop', 'Explainable decisions on synthetic data today; with real behavioral signals, Data Science models and a holdout, the same workflow scales', 'Close by tying it back: the workflow is transparent and testable. Each rule in it is a starting assumption measured against a holdout on incremental, risk-adjusted value.', 'Concept demo · synthetic data');

(async () => {
  await pres.writeFile({ fileName: OUT });
  console.log('wrote', OUT);
})();
