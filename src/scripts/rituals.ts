import { existsSync } from 'node:fs';
import { BAKER_STREET_PROJECTS } from '../ecosystem/projects';

const conceptPath = '/home/kilisan/workspace/synapse-ace-agent/docs/rhythmic-rituals';
const ritualProject = BAKER_STREET_PROJECTS.find((project) => project.id === 'rhythmic-rituals');

console.log('Rhythmic Rituals');
console.log('================');
console.log('');
console.log('Participatory party format: music, micro-rituals, live visuals, AI-assisted storytelling, and a strong nightlife backbone.');
console.log('');
console.log(`Concept docs: ${conceptPath}`);
console.log(`Docs present: ${existsSync(conceptPath) ? 'yes' : 'no'}`);
console.log('');

if (ritualProject) {
  console.log('Capabilities');
  for (const capability of ritualProject.capabilities) {
    console.log(`- ${capability}`);
  }
  console.log('');
  console.log('Registered commands');
  for (const command of ritualProject.primaryCommands) {
    console.log(`- ${command}`);
  }
  console.log('');
}

console.log('Core files');
console.log('- docs/rhythmic-rituals/README.md');
console.log('- docs/rhythmic-rituals/operating-plan.md');
console.log('- docs/rhythmic-rituals/agent-stack.md');
console.log('- docs/rhythmic-rituals/pilot-brief.md');
console.log('- docs/rhythmic-rituals/campaign/index.html');
console.log('- docs/rhythmic-rituals/campaign/poster.html');
console.log('- docs/rhythmic-rituals/campaign/merch.html');
console.log('- docs/rhythmic-rituals/campaign/social.html');
console.log('- docs/rhythmic-rituals/content/social-calendar.md');
console.log('- docs/rhythmic-rituals/content/video-treatment.md');
console.log('');
console.log('Next build step: open campaign/index.html and refine the city/date/venue details.');
