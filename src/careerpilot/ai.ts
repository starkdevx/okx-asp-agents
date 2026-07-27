import { ai, MODEL_NAME } from "../gemini";

export interface ParsedProfile {
  name: string;
  email: string;
  skills: string[];
  targetRoles: string[];
  summary: string;
  insights?: {
    strengths: string[];
    improvements: string[];
    projectsToBuild: string[];
    atsScore: number;
  };
}

export interface MatchAnalysis {
  matchScore: number;
  gapAnalysis: string;
  roadmap: Array<{
    title: string;
    description: string;
    resources: string[];
    estimatedDays: number;
  }>;
}

/**
 * Uses Gemini to parse resume text and GitHub metadata into a structured profile.
 */
export async function analyzeProfileWithAI(
  resumeText: string,
  githubRepos: any[]
): Promise<ParsedProfile> {
  const githubSummary = githubRepos
    .map((repo) => `- ${repo.name} (${repo.language || "Unknown"}): ${repo.description || "No description"}`)
    .join("\n");

  const prompt = `
Analyze the following resume text and GitHub repository data. Extract the user's name, email, list of technical skills (languages, frameworks, libraries, tools, blockchain protocols), potential target roles, and a brief professional summary.

Additionally, generate profile diagnostics:
1. Core Strengths: A list of 3 key architectural or technical strengths.
2. Areas of Improvement: A list of 3 actionable career recommendations (e.g. learning specific tech, contributing to open source).
3. Projects to Build: A list of 2-3 specific, high-quality, practical project ideas the developer should build to address their weaknesses and demonstrate proficiency in their target roles.
4. ATS Score: A rating from 0 to 100 based on the resume formatting, clarity, and keyword optimization.

Resume Text:
${resumeText}

GitHub Repositories:
${githubSummary}

Return ONLY a JSON object containing the fields:
{
  "name": "Full Name",
  "email": "email@example.com",
  "skills": ["Skill1", "Skill2", ...],
  "targetRoles": ["Role1", "Role2", ...],
  "summary": "A 2-3 sentence career summary.",
  "insights": {
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
    "projectsToBuild": ["Detailed project idea 1", "Detailed project idea 2"],
    "atsScore": 75
  }
}
Do not wrap the JSON output in markdown code blocks like \`\`\`json. Return pure JSON text.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as ParsedProfile;
  } catch (error) {
    console.error("AI Profile Analysis Error (falling back to programmatic heuristics):", error);
    
    // Programmatic matching heuristic fallback based on resume content
    const commonWeb3Skills = ["Solidity", "Rust", "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Go", "Python", "Hardhat", "Foundry", "Anchor", "EVM", "Docker", "Git", "C++", "Sui", "Cairo", "Starknet"];
    const detectedSkills = commonWeb3Skills.filter(skill => 
      resumeText.toLowerCase().includes(skill.toLowerCase())
    );

    // Pull in languages from github repos
    githubRepos.forEach(repo => {
      if (repo.language && !detectedSkills.some(s => s.toLowerCase() === repo.language.toLowerCase())) {
        detectedSkills.push(repo.language);
      }
    });

    const finalSkills = detectedSkills.length > 0 ? detectedSkills : ["JavaScript", "React", "TypeScript", "Git"];
    
    const isWeb3 = finalSkills.includes("Solidity") || finalSkills.includes("Rust") || finalSkills.includes("Anchor") || finalSkills.includes("Foundry");
    const targetRoles = isWeb3 
      ? ["Smart Contract Engineer", "Web3 Fullstack Developer"] 
      : ["Fullstack Engineer", "Frontend Developer"];

    const strengths = [];
    if (finalSkills.includes("Solidity") || finalSkills.includes("Foundry")) {
      strengths.push("Smart contract design, unit testing, and execution scripting using Foundry/Hardhat");
    }
    if (finalSkills.includes("React") || finalSkills.includes("Next.js")) {
      strengths.push("Building responsive frontend client dashboards using React & Next.js");
    }
    if (githubRepos.length > 0) {
      strengths.push(`Active version control hygiene with ${githubRepos.length} public GitHub repositories`);
    } else {
      strengths.push("Basic software development architecture principles and git workflows");
    }

    const improvements = [];
    const projectsToBuild = [];

    if (!finalSkills.includes("Solidity")) {
      improvements.push("Learn Ethereum smart contract engineering (Solidity) and decentralized design patterns.");
      projectsToBuild.push("Build a decentralized ERC-20 token swap pool or a custom ERC-721 NFT Staking protocol.");
    } else {
      improvements.push("Master smart contract safety auditing tools (Slither, Mythril) and advanced gas optimization.");
      projectsToBuild.push("Develop a DeFi lending aggregator dashboard or build a secure multi-signature treasury wallet.");
    }

    if (!finalSkills.includes("Rust") && !finalSkills.includes("Anchor")) {
      improvements.push("Expand multi-chain capability by learning Rust and Solana's Anchor framework.");
      projectsToBuild.push("Create a Solana escrow program using the Anchor framework with token transfer CPIs.");
    } else {
      improvements.push("Deepen knowledge on Solana Account structures, PDAs, and transaction optimizations.");
    }

    if (githubRepos.length < 5) {
      improvements.push("Publish more structured project codebases to GitHub showcasing automated test suites.");
    }
    
    improvements.push("Implement end-to-end unit tests (aiming for >80% test coverage) and CI/CD actions.");

    return {
      name: "Developer Name",
      email: "developer@careerpilot.ai",
      skills: finalSkills,
      targetRoles: targetRoles,
      summary: `Web3 developer focused on building applications using ${finalSkills.slice(0, 3).join(", ")}.`,
      insights: {
        strengths: strengths.slice(0, 3),
        improvements: improvements.slice(0, 3),
        projectsToBuild: projectsToBuild.slice(0, 3),
        atsScore: finalSkills.length > 6 ? 78 : 65
      }
    };
  }
}

/**
 * Compares user profile to an opportunity and returns a match percentage, gap analysis, and study roadmap.
 */
export async function compareOpportunityWithAI(
  skills: string[],
  summary: string,
  opp: { title: string; company: string; ecosystem: string; description: string; requirements: string }
): Promise<MatchAnalysis> {
  const prompt = `
Compare the user's profile with the following opportunity and provide a match analysis, gap analysis, and study roadmap.

User Profile:
- Skills: ${skills.join(", ")}
- Summary: ${summary}

Opportunity Details:
- Title: ${opp.title}
- Company/Host: ${opp.company}
- Ecosystem: ${opp.ecosystem}
- Description: ${opp.description}
- Requirements/Skills Target: ${opp.requirements}

You must return a JSON object in the exact format:
{
  "matchScore": 85, // number from 0 to 100 representing suitability
  "gapAnalysis": "### Matching Skills\\n- ...\\n### Missing Skills\\n- ...\\n### Summary\\n...", // Detailed markdown string
  "roadmap": [ // 3-4 steps to bridge the missing skills
    {
      "title": "Learn Anchor & Rust",
      "description": "Understand Solana's Anchor framework, account model, and PDA creation.",
      "resources": ["Solana Playground", "Anchor Book (book.anchor-lang.com)", "Solana Cookbook"],
      "estimatedDays": 5
    }
  ]
}

Ensure the markdown gapAnalysis string uses proper double-escaped newlines (\\n) and is a valid JSON property. Do not wrap the JSON output in markdown code blocks like \`\`\`json. Return pure JSON text.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as MatchAnalysis;
  } catch (error) {
    console.error("AI Matching Error (falling back to programmatic heuristics):", error);
    
    // Parse the opportunity requirements (can be comma-separated or space-separated)
    const targetSkills = opp.requirements
      .split(/[,;\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    targetSkills.forEach(req => {
      const match = skills.find(s => s.toLowerCase() === req.toLowerCase() || req.toLowerCase().includes(s.toLowerCase()));
      if (match) {
        matchedSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    });

    // Calculate match score based on matched fraction
    const totalCount = Math.max(1, targetSkills.length);
    const scoreFraction = matchedSkills.length / totalCount;
    let matchScore = Math.round(50 + (scoreFraction * 40)); // Baseline 50, scales to 90
    if (matchedSkills.length === 0) matchScore = 40;
    if (missingSkills.length === 0) matchScore = 95;

    // Create a detailed matching and missing checklist
    const gapAnalysis = `### Matching Skills
${matchedSkills.map(s => `- **${s}**: Verified in profile.`).join("\n") || "- None identified in your current skill set."}

### Missing Skills
${missingSkills.map(s => `- **${s}**: Recommended to acquire.`).join("\n") || "- You meet all stated skill requirements!"}

### Summary
You match **${matchedSkills.length}/${targetSkills.length}** core skills for this role. To increase suitability, focus on mastering the missing technologies, particularly ${missingSkills.slice(0, 2).join(" and ") || "advanced system patterns"}.`;

    // Construct study roadmap for missing skills
    const roadmap = missingSkills.map((skill, index) => {
      let desc = `Understand the core constructs, libraries, and integration patterns for ${skill}.`;
      let res = ["Official Developer Documentation"];
      let days = 5;

      if (skill.toLowerCase().includes("solidity")) {
        desc = "Study Ethereum EVM state mechanics, reentrancy guards, and write contract units in Foundry.";
        res = ["CryptoZombies", "Foundry Book", "Solidity by Example"];
        days = 6;
      } else if (skill.toLowerCase().includes("rust") || skill.toLowerCase().includes("anchor")) {
        desc = "Study Rust ownership, Solana's Account Model, Program Derived Addresses (PDAs), and cross-program invocation.";
        res = ["Solana Cookbook", "Anchor Book", "Solana Playground"];
        days = 7;
      } else if (skill.toLowerCase().includes("react") || skill.toLowerCase().includes("next")) {
        desc = "Build client views using React, managing state and wallet provider connections (RainbowKit/wagmi).";
        res = ["Next.js Docs", "wagmi.sh hooks guide"];
        days = 4;
      }

      return {
        title: `Master ${skill}`,
        description: desc,
        resources: res,
        estimatedDays: days
      };
    });

    if (roadmap.length === 0) {
      roadmap.push({
        title: "Advanced Integration & Security",
        description: `Explore auditing tools, gas optimizations, and write integration integration test suites.`,
        resources: [`${opp.ecosystem} Dev Portal`],
        estimatedDays: 4
      });
    }

    return {
      matchScore,
      gapAnalysis,
      roadmap: roadmap.slice(0, 3)
    };
  }
}

/**
 * Generates a full markdown Web3 Grant Proposal.
 */
export async function generateGrantProposalWithAI(
  profile: { name: string; email: string; skills: string[]; targetRoles: string[]; summary: string },
  opp: { title: string; company: string; ecosystem: string; description: string }
): Promise<string> {
  const prompt = `
Draft a comprehensive and professional Web3 Grant Proposal for a developer to apply for a grant.

Developer Info:
- Name: ${profile.name}
- Skills: ${profile.skills.join(", ")}
- Profile Summary: ${profile.summary}

Grant Details:
- Title: ${opp.title}
- Provider/Host: ${opp.company}
- Target Ecosystem: ${opp.ecosystem}
- Description: ${opp.description}

Format the output in clean, professional markdown. Include the following sections:
1. **Executive Summary** (Overview of the project idea, why it's valuable, and how it aligns with the ${opp.ecosystem} ecosystem).
2. **Problem Statement & Proposed Solution** (What major issue is being solved and technical explanation of the solution).
3. **Technical Architecture** (Specify smart contract frameworks like Anchor/Solidity, frontend stacks, node connections, indexing, etc., tailored to ${opp.ecosystem}).
4. **Milestones & Deliverables** (Break into exactly 3 milestones. For each milestone list tasks, estimated development time, deliverables, and requested budget in USD/USDT - total budget cap 15,000 USD).
5. **Team Background & Past Work** (Connect the developer's skills and present them as highly qualified).

Make the proposal feel realistic, technical, and compelling. Return ONLY the markdown contents.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Failed to generate proposal.";
  } catch (error) {
    console.error("AI Grant Writer Error:", error);
    return "Error: Could not connect to AI services to generate proposal. Please ensure GEMINI_API_KEY is configured.";
  }
}

/**
 * Optimizes resume bullets and suggests keywords for a job/hackathon.
 */
export async function optimizeResumeWithAI(
  profile: { name: string; email: string; skills: string[]; targetRoles: string[]; summary: string },
  opp: { title: string; company: string; ecosystem: string; description: string }
): Promise<{ tailoredSummary: string; optimizedBullets: string[]; suggestedKeywords: string[] }> {
  const prompt = `
Analyze the developer profile and the opportunity description, then optimize the resume.

Developer Profile:
- Skills: ${profile.skills.join(", ")}
- Summary: ${profile.summary}

Opportunity Details:
- Title: ${opp.title}
- Company: ${opp.company}
- Ecosystem: ${opp.ecosystem}
- Description: ${opp.description}

You must return a JSON object in the exact format:
{
  "tailoredSummary": "A highly customized professional summary targeting this role...",
  "optimizedBullets": [
    "Refactored smart contract suite using Foundry, reducing gas costs by 15% and aligning with the project's target EVM specs.",
    "Built and optimized React frontend dashboards, implementing Ethers.js for secure wallet connections."
  ],
  "suggestedKeywords": ["Keyword1", "Keyword2", "Keyword3"]
}

Make sure optimizedBullets contain 3-4 bullets highlighting how the developer's experience aligns with this role. Do not wrap the JSON output in markdown code blocks like \`\`\`json. Return pure JSON text.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Resume Optimization Error:", error);
    return {
      tailoredSummary: "Experienced developer specializing in clean code and scalable integrations.",
      optimizedBullets: [
        "Collaborated on designing and deploying decentralized application architectures.",
        "Integrated Web3 interfaces with blockchain networks, ensuring security and responsiveness.",
      ],
      suggestedKeywords: [opp.ecosystem, "Smart Contracts", "Web3"],
    };
  }
}
