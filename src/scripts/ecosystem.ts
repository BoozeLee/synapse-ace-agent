import { BAKER_STREET_PROJECTS, getProjectsByDomain } from '../ecosystem/projects';

const formatList = (items: string[]) => {
  if (items.length === 0) {
    return 'none';
  }

  return items.join(', ');
};

const printProject = (name: string, path: string, role: string, commands: string[]) => {
  console.log(`- ${name}`);
  console.log(`  path: ${path}`);
  console.log(`  role: ${role}`);
  console.log(`  commands: ${formatList(commands)}`);
};

const printSummary = () => {
  const groups = getProjectsByDomain();

  console.log('Baker Street Labs App');
  console.log(`Projects registered: ${BAKER_STREET_PROJECTS.length}`);
  console.log('');

  for (const [domain, projects] of Object.entries(groups)) {
    if (projects.length === 0) {
      continue;
    }

    console.log(domain);
    for (const project of projects) {
      printProject(project.name, project.localPath, project.role, project.primaryCommands);
    }
    console.log('');
  }
};

printSummary();
