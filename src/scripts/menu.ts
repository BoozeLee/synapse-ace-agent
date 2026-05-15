import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  BAKER_STREET_PROJECTS,
  type EcosystemProject,
  type ProjectDomain,
  getProjectsByDomain,
} from '../ecosystem/projects';

const rl = readline.createInterface({ input, output });

const domainLabels: Record<ProjectDomain, string> = {
  'research-platform': 'Research platforms',
  'agent-protocol': 'Agent protocol workers',
  automation: 'Automation tools',
  'model-training': 'Models and training',
  'operating-system': 'Operating systems',
  intelligence: 'Intelligence workspaces',
  deployment: 'Deployment scaffolds',
  experience: 'Experiences and concepts',
};

const clearScreen = () => {
  process.stdout.write('\x1Bc');
};

const pause = async () => {
  await rl.question('\nPress Enter to continue...');
};

const ask = async (question: string) => {
  return (await rl.question(question)).trim();
};

const printHeader = (title = 'Baker Street Labs Terminal') => {
  clearScreen();
  console.log(title);
  console.log('='.repeat(title.length));
  console.log('');
};

const printProjectLine = (project: EcosystemProject, index: number) => {
  const status = existsSync(project.localPath) ? 'ok' : 'missing';
  console.log(`${index}. ${project.name} [${project.runtime}, ${project.domain}, ${status}]`);
};

const printProjectDetails = (project: EcosystemProject) => {
  console.log(project.name);
  console.log('-'.repeat(project.name.length));
  console.log(`Path: ${project.localPath}`);
  console.log(`Domain: ${domainLabels[project.domain]}`);
  console.log(`Runtime: ${project.runtime}`);
  console.log('');
  console.log(project.role);
  console.log('');
  console.log('Capabilities:');
  for (const capability of project.capabilities) {
    console.log(`- ${capability}`);
  }
  console.log('');
  console.log('Integration:');
  console.log(project.integrationNotes);
  console.log('');
  console.log('Commands:');
  if (project.primaryCommands.length === 0) {
    console.log('- No direct command registered yet');
  } else {
    project.primaryCommands.forEach((command, index) => {
      console.log(`${index + 1}. ${command}`);
    });
  }
};

const runCommand = async (project: EcosystemProject, command: string) => {
  printHeader(`Running: ${project.name}`);
  console.log(`cd ${project.localPath}`);
  console.log(command);
  console.log('');

  await new Promise<void>((resolve) => {
    const child = spawn(command, {
      cwd: project.localPath,
      env: process.env,
      shell: true,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      console.log('');
      console.log(`Command exited with code ${code ?? 'unknown'}.`);
      resolve();
    });

    child.on('error', (error) => {
      console.error(`Failed to start command: ${error.message}`);
      resolve();
    });
  });

  await pause();
};

const chooseCommand = async (project: EcosystemProject) => {
  if (project.primaryCommands.length === 0) {
    console.log('No direct command is registered for this module yet.');
    await pause();
    return;
  }

  while (true) {
    printHeader(`Commands: ${project.name}`);
    project.primaryCommands.forEach((command, index) => {
      console.log(`${index + 1}. Run ${command}`);
    });
    console.log('b. Back');
    console.log('');

    const choice = await ask('Select command: ');
    if (choice.toLowerCase() === 'b') {
      return;
    }

    const selected = Number.parseInt(choice, 10);
    if (Number.isNaN(selected) || selected < 1 || selected > project.primaryCommands.length) {
      continue;
    }

    const command = project.primaryCommands[selected - 1];
    const confirm = await ask(`Run "${command}" in ${project.localPath}? [y/N] `);
    if (confirm.toLowerCase() === 'y') {
      await runCommand(project, command);
    }
  }
};

const projectMenu = async (project: EcosystemProject) => {
  while (true) {
    printHeader(project.name);
    printProjectDetails(project);
    console.log('');
    console.log('1. Run a registered command');
    console.log('2. Show cd command');
    console.log('b. Back');
    console.log('');

    const choice = await ask('Select action: ');
    if (choice.toLowerCase() === 'b') {
      return;
    }

    if (choice === '1') {
      await chooseCommand(project);
    }

    if (choice === '2') {
      console.log('');
      console.log(`cd ${project.localPath}`);
      await pause();
    }
  }
};

const browseProjects = async (projects: EcosystemProject[], title: string) => {
  while (true) {
    printHeader(title);
    projects.forEach(printProjectLine);
    console.log('b. Back');
    console.log('');

    const choice = await ask('Select module: ');
    if (choice.toLowerCase() === 'b') {
      return;
    }

    const selected = Number.parseInt(choice, 10);
    if (Number.isNaN(selected) || selected < 1 || selected > projects.length) {
      continue;
    }

    await projectMenu(projects[selected - 1]);
  }
};

const browseByDomain = async () => {
  const groups = getProjectsByDomain();
  const domains = Object.entries(groups).filter(([, projects]) => projects.length > 0);

  while (true) {
    printHeader('Browse By Category');
    domains.forEach(([domain, projects], index) => {
      console.log(`${index + 1}. ${domainLabels[domain as ProjectDomain]} (${projects.length})`);
    });
    console.log('b. Back');
    console.log('');

    const choice = await ask('Select category: ');
    if (choice.toLowerCase() === 'b') {
      return;
    }

    const selected = Number.parseInt(choice, 10);
    if (Number.isNaN(selected) || selected < 1 || selected > domains.length) {
      continue;
    }

    const [domain, projects] = domains[selected - 1];
    await browseProjects(projects, domainLabels[domain as ProjectDomain]);
  }
};

const searchProjects = async () => {
  const query = (await ask('Search modules, capabilities, or paths: ')).toLowerCase();
  if (query.length === 0) {
    return;
  }

  const results = BAKER_STREET_PROJECTS.filter((project) => {
    const haystack = [
      project.name,
      project.localPath,
      project.domain,
      project.runtime,
      project.role,
      project.integrationNotes,
      ...project.capabilities,
      ...project.primaryCommands,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });

  if (results.length === 0) {
    console.log('No matching modules found.');
    await pause();
    return;
  }

  await browseProjects(results, `Search Results: ${query}`);
};

const mainMenu = async () => {
  while (true) {
    printHeader();
    console.log('1. Browse all tools and models');
    console.log('2. Browse by category');
    console.log('3. Search');
    console.log('4. Show hub commands');
    console.log('q. Quit');
    console.log('');

    const choice = await ask('Select action: ');

    if (choice.toLowerCase() === 'q') {
      return;
    }

    if (choice === '1') {
      await browseProjects(BAKER_STREET_PROJECTS, 'All Tools And Models');
    }

    if (choice === '2') {
      await browseByDomain();
    }

    if (choice === '3') {
      await searchProjects();
    }

    if (choice === '4') {
      printHeader('Hub Commands');
      console.log('cd /home/kilisan/workspace/synapse-ace-agent');
      console.log('npm run menu');
      console.log('npm run ecosystem');
      console.log('npm run demo:sim');
      console.log('npm run register');
      await pause();
    }
  }
};

try {
  await mainMenu();
} finally {
  rl.close();
}
