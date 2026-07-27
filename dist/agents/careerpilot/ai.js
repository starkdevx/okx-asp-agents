"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProfileWithAI = analyzeProfileWithAI;
exports.compareOpportunityWithAI = compareOpportunityWithAI;
exports.generateGrantProposalWithAI = generateGrantProposalWithAI;
exports.optimizeResumeWithAI = optimizeResumeWithAI;
const gemini_1 = require("../../gemini");
/**
 * Uses Gemini to parse resume text and GitHub metadata into a structured profile.
 */
async function analyzeProfileWithAI(resumeText, githubRepos) {
    const githubSummary = githubRepos
        .map((repo) => `- ${repo.name} (${repo.language || "Unknown"}): ${repo.description || "No description"}`)
        .join("\n");
    const prompt = `
Analyze the following resume text and GitHub repository data. Extract the user's name, email, list of technical skills (languages, frameworks, libraries, tools, blockchain protocols), potential target roles, and a brief professional summary.

Additionally, generate profile diagnostics:
1. Core Strengths: A list of 3 key architectural or technical strengths.
2. Areas of Improvement: A list of 3 actionable career recommendations (e.g. learning specific tech, creating public GitHub projects, adding automated tests).
3. ATS Score: A rating from 0 to 100 based on the resume formatting, clarity, and keyword optimization.

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
    "atsScore": 75
  }
}
Do not wrap the JSON output in markdown code blocks like \`\`\`json. Return pure JSON text.
`;
    try {
        const response = await gemini_1.ai.models.generateContent({
            model: gemini_1.MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        const text = response.text || "{}";
        return JSON.parse(text);
    }
    catch (error) {
        console.error("AI Profile Analysis Error:", error);
        return {
            name: "Developer Name",
            email: "",
            skills: ["JavaScript", "React"],
            targetRoles: ["Fullstack Engineer"],
            summary: "Web3 developer exploring opportunities.",
            insights: {
                strengths: ["Experienced in Web2 frontend development", "Strong foundation in React & JavaScript"],
                improvements: ["Add public Web3 repositories to GitHub profile", "Learn Smart Contract engineering (Solidity/Rust)"],
                atsScore: 65
            }
        };
    }
}
/**
 * Compares user profile to an opportunity and returns a match percentage, gap analysis, and study roadmap.
 */
async function compareOpportunityWithAI(skills, summary, opp) {
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
        const response = await gemini_1.ai.models.generateContent({
            model: gemini_1.MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        const text = response.text || "{}";
        return JSON.parse(text);
    }
    catch (error) {
        console.error("AI Matching Error:", error);
        return {
            matchScore: 50,
            gapAnalysis: "### Analysis Unavailable\nCould not perform automated comparison. Please verify requirements manually.",
            roadmap: [
                {
                    title: `Study requirements for ${opp.title}`,
                    description: `Analyze the core requirements for ${opp.title} and research standard developer tools for the ${opp.ecosystem} ecosystem.`,
                    resources: ["Official Documentation"],
                    estimatedDays: 7,
                },
            ],
        };
    }
}
/**
 * Generates a full markdown Web3 Grant Proposal.
 */
async function generateGrantProposalWithAI(profile, opp) {
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
        const response = await gemini_1.ai.models.generateContent({
            model: gemini_1.MODEL_NAME,
            contents: prompt,
        });
        return response.text || "Failed to generate proposal.";
    }
    catch (error) {
        console.error("AI Grant Writer Error:", error);
        return "Error: Could not connect to AI services to generate proposal. Please ensure GEMINI_API_KEY is configured.";
    }
}
/**
 * Optimizes resume bullets and suggests keywords for a job/hackathon.
 */
async function optimizeResumeWithAI(profile, opp) {
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
        const response = await gemini_1.ai.models.generateContent({
            model: gemini_1.MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        const text = response.text || "{}";
        return JSON.parse(text);
    }
    catch (error) {
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
