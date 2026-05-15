const projects = [
  {
    name: 'Synapse Ace Agent',
    path: '/home/kilisan/workspace/synapse-ace-agent',
    domain: 'agent protocol',
    runtime: 'node',
    role: 'Hub app for SAP discovery, Ace Data Cloud execution, x402 payments, and the merged dashboard.',
    commands: ['npm run dev', 'npm run demo:sim', 'npm run ecosystem'],
  },
  {
    name: 'Baker Street Laboratory',
    path: '/home/kilisan/bakerstreet-labs-repos/baker-street-laboratory',
    domain: 'research platform',
    runtime: 'python',
    role: 'Original AI research platform and desktop laboratory shell.',
    commands: ['python3 baker_street_gui.py'],
  },
  {
    name: 'Laboratory Templates',
    path: '/home/kilisan/bakerstreet-labs-repos/Laboratory-Templates',
    domain: 'research platform',
    runtime: 'docs',
    role: 'Premium research modules and reusable agent workflow templates.',
    commands: [],
  },
  {
    name: 'Bakery Street Private Intel',
    path: '/home/kilisan/bakerstreet-labs-repos/Bakery-Street-Private-Intel',
    domain: 'intelligence',
    runtime: 'docs',
    role: 'Private intelligence workspace for restricted research artifacts.',
    commands: [],
  },
  {
    name: 'jazzyOS',
    path: '/home/kilisan/bakerstreet-labs-repos/jazzyOS',
    domain: 'operating system',
    runtime: 'mixed',
    role: 'Quantum-neuromorphic operating system concept and runtime layer.',
    commands: [],
  },
  {
    name: 'HBS jazzyOS Finetune',
    path: '/home/kilisan/bakerstreet-labs-repos/hbs-jazzyos-finetune',
    domain: 'model training',
    runtime: 'python',
    role: 'Business intelligence fine-tuning project using the jazzyOS framework.',
    commands: ['python scripts/train_colab.py', 'python scripts/train_grok2.py'],
  },
  {
    name: 'Singularity Scripts',
    path: '/home/kilisan/bakerstreet-labs-repos/singularity-scripts',
    domain: 'automation',
    runtime: 'python',
    role: 'Generated self-improving solution scripts and automation experiments.',
    commands: [],
  },
  {
    name: 'Terminal221B',
    path: '/home/kilisan/bakerstreet-labs-repos/terminal221b',
    domain: 'agent protocol',
    runtime: 'mixed',
    role: 'Sovereign local-first AI development TUI with Solana and local RAG concepts.',
    commands: [],
  },
  {
    name: 'Codex SuperLab',
    path: '/home/kilisan/bakerstreet-labs-repos/codex-superlab',
    domain: 'automation',
    runtime: 'mixed',
    role: 'Automation, progress tracking, content pipeline, and task verification system.',
    commands: ['npm start', 'python discord_auto_checker_bot.py'],
  },
  {
    name: 'Baker Street Laboratory 1',
    path: '/home/kilisan/bakerstreet-labs-repos/Baker-Street-Laboratory-1',
    domain: 'research platform',
    runtime: 'mixed',
    role: 'Expanded research platform with API, Flutter app, worker, gateway, and deployment assets.',
    commands: ['python3 api/app.py', 'flutter run -d chrome', './start-lab.sh'],
  },
  {
    name: 'TrendForge Agent',
    path: '/home/kilisan/trendforge-agent',
    domain: 'agent protocol',
    runtime: 'rust',
    role: 'Autonomous research worker that discovers SAP tools, analyzes trends, generates images, and pays via x402.',
    commands: ['cargo run --bin trendforge -- --demo', 'cargo run --bin register'],
  },
  {
    name: 'TrendForge Hello Fly',
    path: '/home/kilisan/trendforge-agent/hello-fly',
    domain: 'deployment',
    runtime: 'node',
    role: 'Fly.io hello-world deployment scaffold bundled with TrendForge.',
    commands: ['fly launch --now'],
  },
  {
    name: 'NeuroForge Agent',
    path: '/home/kilisan/neuroforge-agent',
    domain: 'agent protocol',
    runtime: 'rust',
    role: 'Neuromorphic SAP agent using LIF network behavior to generate on-chain escrow volume.',
    commands: ['cargo run --bin neuroforge -- --demo', 'cargo run --bin register'],
  },
  {
    name: 'Rhythmic Ritual',
    path: '/home/kilisan/workspace/synapse-ace-agent/docs/rhythmic-rituals',
    domain: 'experience',
    runtime: 'docs',
    role: 'Belgian underground minimal techno event concept. Motherbrand Rhythmic Ritual ◉, Edition 01 ANIMÆ, end August 2026.',
    commands: [
      'npm --prefix /home/kilisan/workspace/synapse-ace-agent run rituals',
      'npm --prefix /home/kilisan/workspace/synapse-ace-agent run rituals:campaign',
      'npm --prefix /home/kilisan/workspace/synapse-ace-agent run rituals:prompt',
    ],
  },
];

const projectGrid = document.querySelector('#project-grid');

const renderCommandList = (commands) => {
  if (commands.length === 0) {
    return '<span class="empty">No direct command registered</span>';
  }

  return commands.map((command) => `<code>${command}</code>`).join('');
};

projectGrid.innerHTML = projects
  .map(
    (project) => `
      <article class="project-card">
        <div class="project-meta">
          <span>${project.domain}</span>
          <span>${project.runtime}</span>
        </div>
        <h3>${project.name}</h3>
        <p>${project.role}</p>
        <div class="path">${project.path}</div>
        <div class="command-list">${renderCommandList(project.commands)}</div>
      </article>
    `
  )
  .join('');
