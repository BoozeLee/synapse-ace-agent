export type ProjectDomain =
  | 'research-platform'
  | 'agent-protocol'
  | 'automation'
  | 'model-training'
  | 'operating-system'
  | 'intelligence'
  | 'deployment'
  | 'experience';

export type ProjectRuntime = 'node' | 'python' | 'rust' | 'flutter' | 'shell' | 'mixed' | 'docs';

export interface EcosystemProject {
  id: string;
  name: string;
  localPath: string;
  domain: ProjectDomain;
  runtime: ProjectRuntime;
  role: string;
  capabilities: string[];
  primaryCommands: string[];
  integrationNotes: string;
}

export const BAKER_STREET_PROJECTS: EcosystemProject[] = [
  {
    id: 'synapse-ace-agent',
    name: 'Synapse Ace Agent',
    localPath: '/home/kilisan/workspace/synapse-ace-agent',
    domain: 'agent-protocol',
    runtime: 'node',
    role: 'Hub app for SAP discovery, Ace Data Cloud execution, x402 payments, and the merged ecosystem dashboard.',
    capabilities: ['SAP discovery', 'Ace Data Cloud workflows', 'x402 payment settlement', 'attestation reporting'],
    primaryCommands: ['npm run dev', 'npm run demo:sim', 'npm run ecosystem'],
    integrationNotes: 'Acts as the control plane and public dashboard for the combined Baker Street Labs application.',
  },
  {
    id: 'baker-street-laboratory',
    name: 'Baker Street Laboratory',
    localPath: '/home/kilisan/bakerstreet-labs-repos/baker-street-laboratory',
    domain: 'research-platform',
    runtime: 'python',
    role: 'Original AI research platform and desktop laboratory shell.',
    capabilities: ['AI research models', 'enterprise security positioning', 'desktop GUI', 'monetization docs'],
    primaryCommands: ['python3 baker_street_gui.py'],
    integrationNotes: 'Provides the research brand, model catalog, and enterprise positioning for the merged app.',
  },
  {
    id: 'laboratory-templates',
    name: 'Laboratory Templates',
    localPath: '/home/kilisan/bakerstreet-labs-repos/Laboratory-Templates',
    domain: 'research-platform',
    runtime: 'docs',
    role: 'Premium research modules and reusable agent workflow templates.',
    capabilities: ['oncology scanner template', 'research agent template', 'analyst agent template', 'base agent template'],
    primaryCommands: [],
    integrationNotes: 'Feeds the marketplace/catalog layer for reusable Baker Street workflows.',
  },
  {
    id: 'bakery-private-intel',
    name: 'Bakery Street Private Intel',
    localPath: '/home/kilisan/bakerstreet-labs-repos/Bakery-Street-Private-Intel',
    domain: 'intelligence',
    runtime: 'docs',
    role: 'Private intelligence workspace for restricted research artifacts.',
    capabilities: ['private intelligence archive', 'research notes'],
    primaryCommands: [],
    integrationNotes: 'Kept isolated as a private intel source; expose metadata only from the hub.',
  },
  {
    id: 'jazzyos',
    name: 'jazzyOS',
    localPath: '/home/kilisan/bakerstreet-labs-repos/jazzyOS',
    domain: 'operating-system',
    runtime: 'mixed',
    role: 'Quantum-neuromorphic operating system concept and runtime layer.',
    capabilities: ['PrimeCore', 'Dream Script Engine', 'qentropy runtime', 'self-evolving modules'],
    primaryCommands: [],
    integrationNotes: 'Supplies the OS narrative and experimental runtime concepts for autonomous lab agents.',
  },
  {
    id: 'hbs-jazzyos-finetune',
    name: 'HBS jazzyOS Finetune',
    localPath: '/home/kilisan/bakerstreet-labs-repos/hbs-jazzyos-finetune',
    domain: 'model-training',
    runtime: 'python',
    role: 'Business intelligence fine-tuning project using the jazzyOS framework.',
    capabilities: ['HBS dataset pipeline', 'Colab training', 'Grok-2 training plan', 'adapter outputs'],
    primaryCommands: ['python scripts/train_colab.py', 'python scripts/train_grok2.py'],
    integrationNotes: 'Connects model training assets to the research and analyst workflows.',
  },
  {
    id: 'singularity-scripts',
    name: 'Singularity Scripts',
    localPath: '/home/kilisan/bakerstreet-labs-repos/singularity-scripts',
    domain: 'automation',
    runtime: 'python',
    role: 'Generated self-improving solution scripts and automation experiments.',
    capabilities: ['self-improving scripts', 'solution generation', 'automation demos'],
    primaryCommands: [],
    integrationNotes: 'Candidate source for automation modules exposed through the hub command surface.',
  },
  {
    id: 'terminal221b',
    name: 'Terminal221B',
    localPath: '/home/kilisan/bakerstreet-labs-repos/terminal221b',
    domain: 'agent-protocol',
    runtime: 'mixed',
    role: 'Sovereign local-first AI development TUI with Solana and local RAG concepts.',
    capabilities: ['local RAG', 'Solana Agent Kit', 'analyst persona', 'artist persona', 'engineer persona'],
    primaryCommands: [],
    integrationNotes: 'Becomes the terminal command center for local operator workflows.',
  },
  {
    id: 'codex-superlab',
    name: 'Codex SuperLab',
    localPath: '/home/kilisan/bakerstreet-labs-repos/codex-superlab',
    domain: 'automation',
    runtime: 'mixed',
    role: 'Automation, progress tracking, content pipeline, and task verification system.',
    capabilities: ['Discord progress bot', 'Google Sheets tracker', 'Gmail digests', 'content pipeline', 'token rotation'],
    primaryCommands: ['npm start', 'python discord_auto_checker_bot.py'],
    integrationNotes: 'Provides automation and accountability services for the merged lab.',
  },
  {
    id: 'baker-street-laboratory-1',
    name: 'Baker Street Laboratory 1',
    localPath: '/home/kilisan/bakerstreet-labs-repos/Baker-Street-Laboratory-1',
    domain: 'research-platform',
    runtime: 'mixed',
    role: 'Expanded research platform with API, Flutter app, worker, gateway, and deployment assets.',
    capabilities: ['research API', 'Flutter dashboard', 'agent monitoring', 'report rating', 'Docker deployment'],
    primaryCommands: ['python3 api/app.py', 'flutter run -d chrome', './start-lab.sh'],
    integrationNotes: 'Main product surface to fold into the hub over time; currently linked as a service module.',
  },
  {
    id: 'trendforge-agent',
    name: 'TrendForge Agent',
    localPath: '/home/kilisan/trendforge-agent',
    domain: 'agent-protocol',
    runtime: 'rust',
    role: 'Autonomous research agent that discovers SAP tools, searches the web, analyzes trends, generates images, and pays via x402.',
    capabilities: ['SAP discovery', 'SERP research', 'LLM analysis', 'image generation', 'x402 USDC payment'],
    primaryCommands: ['cargo run --bin trendforge -- --demo', 'cargo run --bin register'],
    integrationNotes: 'Specialized trend research worker behind the Baker Street Labs hub.',
  },
  {
    id: 'hello-fly',
    name: 'TrendForge Hello Fly',
    localPath: '/home/kilisan/trendforge-agent/hello-fly',
    domain: 'deployment',
    runtime: 'node',
    role: 'Fly.io hello-world deployment scaffold bundled with TrendForge.',
    capabilities: ['Fly.io deployment smoke test'],
    primaryCommands: ['fly launch --now'],
    integrationNotes: 'Deployment reference only; keep separate from core app logic.',
  },
  {
    id: 'neuroforge-agent',
    name: 'NeuroForge Agent',
    localPath: '/home/kilisan/neuroforge-agent',
    domain: 'agent-protocol',
    runtime: 'rust',
    role: 'Neuromorphic SAP agent using LIF spiking neural network behavior to generate on-chain escrow volume.',
    capabilities: ['LIF SNN engine', 'SAP escrow generation', 'market signal response', 'on-chain settlement'],
    primaryCommands: ['cargo run --bin neuroforge -- --demo', 'cargo run --bin register'],
    integrationNotes: 'Specialized payment-volume worker behind the Baker Street Labs hub.',
  },
  {
    id: 'rhythmic-rituals',
    name: 'Rhythmic Rituals',
    localPath: '/home/kilisan/workspace/synapse-ace-agent/docs/rhythmic-rituals',
    domain: 'experience',
    runtime: 'docs',
    role: 'Participatory ritual party concept combining dance music, guided micro-rituals, responsive visuals, AI-assisted storytelling, and nightlife operations.',
    capabilities: [
      'event concept development',
      'run-of-show design',
      'ritual station design',
      'artist and sponsor brief generation',
      'AI-assisted recap workflow',
      'crowd energy phase mapping',
    ],
    primaryCommands: [
      'npm --prefix /home/kilisan/workspace/synapse-ace-agent run rituals',
      'npm --prefix /home/kilisan/workspace/synapse-ace-agent run rituals:campaign',
    ],
    integrationNotes: 'Uses the full Baker Street Labs stack as research, automation, creative production, crowd modeling, and operational support for the party concept.',
  },
];

export const getProjectsByDomain = () => {
  return BAKER_STREET_PROJECTS.reduce<Record<ProjectDomain, EcosystemProject[]>>(
    (groups, project) => {
      groups[project.domain].push(project);
      return groups;
    },
    {
      'research-platform': [],
      'agent-protocol': [],
      automation: [],
      'model-training': [],
      'operating-system': [],
      intelligence: [],
      deployment: [],
      experience: [],
    }
  );
};

export const getHubProject = () => {
  return BAKER_STREET_PROJECTS.find((project) => project.id === 'synapse-ace-agent');
};
