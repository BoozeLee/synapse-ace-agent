import { existsSync } from 'node:fs';

const root = '/home/kilisan/workspace/synapse-ace-agent/docs/rhythmic-rituals';
const campaign = `${root}/campaign`;
const content = `${root}/content`;

const files = [
  ['Agent prompt', `${root}/agent-prompt.md`],
  ['Pre-campaign command', `${root}/pre-campaign-command.md`],
  ['Website', `${campaign}/index.html`],
  ['Poster', `${campaign}/poster.html`],
  ['Merch mockups', `${campaign}/merch.html`],
  ['Social kit page', `${campaign}/social.html`],
  ['Campaign CSS', `${campaign}/styles.css`],
  ['Social calendar', `${content}/social-calendar.md`],
  ['Video treatments', `${content}/video-treatment.md`],
  ['Merch spec', `${content}/merch-spec.md`],
  ['Sponsor one-pager', `${content}/sponsor-one-pager.md`],
] as const;

console.log('Rhythmic Ritual Campaign Kit');
console.log('============================');
console.log('');

for (const [label, path] of files) {
  console.log(`${existsSync(path) ? 'ok' : 'missing'}  ${label}: ${path}`);
}

console.log('');
console.log('Open locally:');
console.log(`${campaign}/index.html`);
console.log(`${campaign}/poster.html`);
console.log(`${campaign}/merch.html`);
console.log(`${campaign}/social.html`);
console.log('');
console.log('Print poster: open poster.html in a browser and print to PDF.');
