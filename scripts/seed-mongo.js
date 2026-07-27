const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in your .env file");
  process.exit(1);
}

// Define inline Schema for seeding
const OpportunitySchema = new mongoose.Schema({
  _id: { type: String },
  type: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  ecosystem: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  requirements: { type: [String], default: [] },
}, { timestamps: true });

const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);

const opportunities = [
  // ================= GRANTS =================
  {
    type: "GRANT",
    title: "Solana Foundation Developer Grants",
    company: "Solana Foundation",
    ecosystem: "Solana",
    description: "Funding for open-source developer tools, infrastructure, and core protocol applications that improve the Solana ecosystem's scalability, accessibility, and utility.",
    url: "https://solana.foundation/grants",
    requirements: ["Rust", "Solana", "Anchor", "Smart Contracts", "Web3"]
  },
  {
    type: "GRANT",
    title: "Stellar Community Fund (SCF)",
    company: "Stellar Development Foundation",
    ecosystem: "Stellar",
    description: "An open-application funding program to kickstart projects building on Stellar and Soroban smart contract platform. Includes milestones and community voting.",
    url: "https://communityfund.stellar.org/",
    requirements: ["Rust", "Soroban", "Stellar", "Smart Contracts", "Wasm"]
  },
  {
    type: "GRANT",
    title: "Base Builder Grants",
    company: "Base Core Team",
    ecosystem: "Base",
    description: "Supporting builders creating consumer-facing applications, developer tooling, and decentralized identity solutions on Base to bring the world onchain.",
    url: "https://base.org/grants",
    requirements: ["Solidity", "EVM", "React", "Next.js", "Hardhat", "Base"]
  },
  {
    type: "GRANT",
    title: "Starknet Developer Seed Grants",
    company: "Starknet Foundation",
    ecosystem: "Starknet",
    description: "Seed funding for open source libraries, developer tools, and infrastructure products targeting the Starknet Cairo ecosystem.",
    url: "https://starknet.io/grants",
    requirements: ["Rust", "Cairo", "Starknet", "Wasm", "Smart Contracts"]
  },
  {
    type: "GRANT",
    title: "Arbitrum Ecosystem Grants",
    company: "Arbitrum DAO",
    ecosystem: "Arbitrum",
    description: "Grants allocated for building decentralized finance protocols, gaming engines, and L3 developer networks built on Arbitrum Nitro chains.",
    url: "https://arbitrum.foundation/grants",
    requirements: ["Solidity", "EVM", "Foundry", "Arbitrum", "Smart Contracts"]
  },
  {
    type: "GRANT",
    title: "EigenLayer Dev & Research Grants",
    company: "Eigen Foundation",
    ecosystem: "EigenLayer",
    description: "Funding research and development for Actively Validated Services (AVS), restaking primitives, and decentralized trust security mechanisms.",
    url: "https://eigenlayer.xyz/grants",
    requirements: ["Solidity", "Go", "EVM", "Distributed Systems", "Cryptography"]
  },
  {
    type: "GRANT",
    title: "Ethereum Academic & Core Dev Grants",
    company: "Ethereum Foundation",
    ecosystem: "Ethereum",
    description: "Supporting educational resources, protocol research, clients development, and cryptography developments built directly on Ethereum Layer 1.",
    url: "https://ethereum.org/grants",
    requirements: ["Cryptography", "Go", "Rust", "Ethereum", "Systems Programming"]
  },

  // ================= HACKATHONS =================
  {
    type: "HACKATHON",
    title: "ETHGlobal London 2026",
    company: "ETHGlobal",
    ecosystem: "Ethereum",
    description: "A 36-hour weekend hackathon to build Ethereum applications, decentralized protocols, or developer tooling. Great for finding co-founders.",
    url: "https://ethglobal.com",
    requirements: ["Solidity", "EVM", "Next.js", "Hardhat", "Foundry", "Tailwind CSS"]
  },
  {
    type: "HACKATHON",
    title: "DoraHacks Global Web3 Hackathon",
    company: "DoraHacks",
    ecosystem: "Cross-chain",
    description: "A premier global online hackathon connecting builders across Ethereum, Solana, Cosmos, and Polkadot. High-prize pool with VC matching.",
    url: "https://dorahacks.io",
    requirements: ["React", "Solidity", "Rust", "Web3", "Frontend"]
  },
  {
    type: "HACKATHON",
    title: "OKX.AI Genesis Hackathon",
    company: "HackQuest",
    ecosystem: "Cross-chain",
    description: "Build and deploy next-generation Agentic Service Providers (ASPs) using the OKX AI SDKs, Model Context Protocol (MCP), and onchain payments.",
    url: "https://hackquest.io",
    requirements: ["TypeScript", "Next.js", "AI Models", "MCP", "Web3"]
  },
  {
    type: "HACKATHON",
    title: "Devfolio EVM Builder Hackathon",
    company: "Devfolio",
    ecosystem: "Base",
    description: "Building consumer dApps on Base and Arbitrum. Mentorship from top Web3 founders and instant deployment pipelines.",
    url: "https://devfolio.co",
    requirements: ["Solidity", "EVM", "React", "TypeScript", "Ethers.js"]
  },
  {
    type: "HACKATHON",
    title: "Encode Club Web3 Bootcamp Hackathon",
    company: "Encode Club",
    ecosystem: "Cross-chain",
    description: "A 4-week hackathon following intensive bootcamps on Solidity, Rust, and Cairo. Perfect for developers transitioning from Web2 to Web3.",
    url: "https://encode.club",
    requirements: ["React", "Solidity", "TypeScript", "Node.js", "Git"]
  },
  {
    type: "HACKATHON",
    title: "Superteam Solana Summer Hackathon",
    company: "Superteam",
    ecosystem: "Solana",
    description: "Build consumer applications, mobile dApps, and DeFi protocols on Solana. Multi-track prize pools including a dedicated track for AI agents.",
    url: "https://superteam.fun",
    requirements: ["Rust", "Solana", "Anchor", "React", "TypeScript"]
  },
  {
    type: "HACKATHON",
    title: "Gitcoin Citizen Grants Round 24",
    company: "Gitcoin",
    ecosystem: "Ethereum",
    description: "Public goods funding hackathon targeting sybil resistance, governance systems, and network coordination tools.",
    url: "https://gitcoin.co",
    requirements: ["Solidity", "EVM", "React", "GraphQL", "Web3"]
  },

  // ================= JOBS / INTERNSHIPS / FELLOWSHIPS =================
  {
    type: "JOB",
    title: "Junior Solidity Developer",
    company: "Optimism DAO",
    ecosystem: "Optimism",
    description: "Write, test, and deploy smart contracts on Optimism L2. Work closely with frontend engineers to integrate protocol functionality.",
    url: "https://optimism.io/jobs",
    requirements: ["Solidity", "Foundry", "EVM", "Smart Contracts", "Git"]
  },
  {
    type: "JOB",
    title: "Senior Web3 Frontend Engineer (Remote)",
    company: "Uniswap Labs",
    ecosystem: "Ethereum",
    description: "Design and maintain high-fidelity user interfaces for the Uniswap Protocol. High emphasis on performance, animations, and wallet integrations.",
    url: "https://uniswap.org/jobs",
    requirements: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Ethers.js", "GraphQL"]
  },
  {
    type: "JOB",
    title: "Rust Infrastructure Engineer",
    company: "Starknet Foundation",
    ecosystem: "Starknet",
    description: "Develop Cairo VM features, compiler performance improvements, and sequencer pipeline optimizations in Rust.",
    url: "https://starknet.io/jobs",
    requirements: ["Rust", "Cairo", "Systems Programming", "Docker", "Git"]
  },
  {
    type: "JOB",
    title: "Solana Smart Contract Intern",
    company: "Superteam",
    ecosystem: "Solana",
    description: "A 3-month paid remote internship. Assist in building, auditing, and documenting Anchor smart contracts for project startups.",
    url: "https://superteam.fun/careers",
    requirements: ["Rust", "Solana", "Anchor", "Git", "TypeScript"]
  },
  {
    type: "JOB",
    title: "Remote Full-Stack Developer",
    company: "Arbitrum Core Team",
    ecosystem: "Arbitrum",
    description: "Build backend indexers, analytics tools, and frontend governance interfaces for the Offchain Labs and Arbitrum ecosystems.",
    url: "https://offchainlabs.com/careers",
    requirements: ["React", "Node.js", "Go", "TypeScript", "Docker", "EVM"]
  },
  {
    type: "JOB",
    title: "Google Summer of Code Contributor (Stellar SDK)",
    company: "Stellar Development Foundation",
    ecosystem: "Stellar",
    description: "Paid open-source contribution fellowship. Port Stellar SDK functionalities to Soroban-compatible Rust frameworks and write comprehensive developer guides.",
    url: "https://stellar.org/gsoc",
    requirements: ["Rust", "Stellar", "Soroban", "Git", "Markdown"]
  },
  {
    type: "JOB",
    title: "Web3 Accelerator Fellowship Contributor",
    company: "Outlier Ventures",
    ecosystem: "Cross-chain",
    description: "A developer fellowship to help startup teams audit their code bases, configure deployment tools, and integrate subgraphs.",
    url: "https://outlierventures.io",
    requirements: ["Solidity", "React", "Node.js", "Hardhat", "GraphQL"]
  },
  {
    type: "JOB",
    title: "Open Source AI Agent Fellow",
    company: "Near Foundation",
    ecosystem: "Cross-chain",
    description: "Research and implement decentralized AI agent architectures using Near's user-owned AI frameworks. Paid 6-month developer fellowship.",
    url: "https://near.org",
    requirements: ["TypeScript", "AI Models", "Node.js", "Git", "Distributed Systems"]
  }
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for seeding.");

  console.log("Clearing existing opportunities...");
  await Opportunity.deleteMany({});

  console.log("Seeding expanded opportunities database...");
  for (const opp of opportunities) {
    const doc = new Opportunity({
      _id: require('crypto').randomUUID(),
      ...opp
    });
    await doc.save();
    console.log(`Created ${doc.type}: ${doc.title} by ${doc.company}`);
  }

  console.log(`Seeding complete! ${opportunities.length} entries successfully loaded.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
