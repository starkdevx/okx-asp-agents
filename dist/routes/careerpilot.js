"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../agents/careerpilot/db");
const ai_1 = require("../agents/careerpilot/ai");
const router = (0, express_1.Router)();
// --- 1. Profile Onboarding Analysis Endpoint ---
// Analyzes user resume + GitHub user repos to outline profile insights (improvements, scores, projects to build).
router.post("/profile/analyze", async (req, res) => {
    try {
        const { resumeText, githubUsername, email } = req.body;
        if (!resumeText || !githubUsername) {
            return res.status(400).json({ error: "Resume text and GitHub username are required" });
        }
        console.log(`[CareerPilot] Running simplified profile analysis for GitHub: ${githubUsername}`);
        await (0, db_1.connectDB)();
        // Fetch GitHub Repositories (with mock fallback for safety/rate limits)
        let repos = [];
        try {
            const gitResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`, {
                headers: {
                    "User-Agent": "CareerPilot-Agent",
                },
            });
            if (gitResponse.ok) {
                repos = await gitResponse.json();
            }
            else {
                console.warn(`GitHub API returned status ${gitResponse.status}, using mock repositories fallback.`);
                repos = getMockRepos(githubUsername);
            }
        }
        catch (err) {
            console.warn("Failed to fetch from GitHub API, using mock repositories fallback:", err);
            repos = getMockRepos(githubUsername);
        }
        // Call Gemini to analyze profile
        const parsed = await (0, ai_1.analyzeProfileWithAI)(resumeText, repos);
        const targetEmail = email || parsed.email || `${githubUsername.toLowerCase()}@careerpilot.ai`;
        // Save/Upsert Profile in MongoDB
        const profile = await db_1.db.userProfile.findOneAndUpdate({ email: targetEmail }, {
            name: parsed.name || githubUsername,
            email: targetEmail,
            resumeText,
            githubUsername,
            skills: parsed.skills,
            targetRoles: parsed.targetRoles,
            summary: parsed.summary,
            insights: parsed.insights || null,
        }, { upsert: true, new: true });
        console.log(`[CareerPilot] Profile saved: ${profile.name} (${profile.id}). Pre-calculating opportunity matches...`);
        // Match profile against stored opportunities (grants, jobs, hackathons)
        const opportunities = await db_1.db.opportunity.find();
        for (const opp of opportunities) {
            try {
                const requirementsList = Array.isArray(opp.requirements)
                    ? opp.requirements
                    : JSON.parse(opp.requirements || "[]");
                const matchData = await (0, ai_1.compareOpportunityWithAI)(parsed.skills, parsed.summary, {
                    title: opp.title,
                    company: opp.company,
                    ecosystem: opp.ecosystem,
                    description: opp.description,
                    requirements: requirementsList.join(", "),
                });
                await db_1.db.matchResult.findOneAndUpdate({ userId: profile.id, opportunityId: opp.id }, {
                    userId: profile.id,
                    opportunityId: opp.id,
                    matchScore: matchData.matchScore,
                    gapAnalysis: matchData.gapAnalysis,
                    roadmap: matchData.roadmap,
                }, { upsert: true, new: true });
            }
            catch (oppErr) {
                console.error(`Failed to calculate match for opportunity ${opp.id}:`, oppErr);
            }
        }
        return res.json({
            success: true,
            profile: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                githubUsername: profile.githubUsername,
                skills: parsed.skills,
                targetRoles: parsed.targetRoles,
                summary: profile.summary,
                insights: parsed.insights || null,
            },
        });
    }
    catch (error) {
        console.error("Profile onboarding error:", error);
        return res.status(500).json({ error: error.message || "Failed to process profile" });
    }
});
// --- 2. Get Matched Opportunities Feed Endpoint ---
// Returns jobs, hackathons, and grants with matching scores, gap analyses, and study roadmaps.
router.get("/opportunities", async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        await (0, db_1.connectDB)();
        // Fetch all opportunities from database
        const opportunities = await db_1.db.opportunity.find().sort({ createdAt: -1 });
        // Fetch matches for this specific user
        const matches = await db_1.db.matchResult.find({ userId });
        // Fetch user application statuses
        const applications = await db_1.db.applicationProgress.find({ userId });
        // Convert mongoose documents to JSON
        const opportunityDocs = opportunities.map((opp) => opp.toJSON());
        const matchDocs = matches.map((m) => m.toJSON());
        const appDocs = applications.map((a) => a.toJSON());
        // Combine opportunities with user matching data
        const matchedFeed = opportunityDocs.map((opp) => {
            const match = matchDocs.find((m) => m.opportunityId === opp.id);
            const app = appDocs.find((a) => a.opportunityId === opp.id);
            return {
                ...opp,
                requirements: Array.isArray(opp.requirements) ? opp.requirements : JSON.parse(opp.requirements || "[]"),
                matchScore: match ? match.matchScore : 0,
                gapAnalysis: match ? match.gapAnalysis : "",
                roadmap: match
                    ? (typeof match.roadmap === "string" ? JSON.parse(match.roadmap) : match.roadmap)
                    : [],
                applicationStatus: app ? app.status : null,
            };
        });
        return res.json({
            success: true,
            opportunities: matchedFeed,
        });
    }
    catch (error) {
        console.error("Opportunities fetch error:", error);
        return res.status(500).json({ error: error.message || "Failed to fetch opportunities" });
    }
});
// Mock repositories fallback
function getMockRepos(username) {
    return [
        {
            name: `${username}-defi-vault`,
            description: "A secure yield optimizer and token vault written in Solidity for EVM networks. Supports ERC-4626 standard vaults.",
            language: "Solidity",
        },
        {
            name: `solana-escrow-anchor`,
            description: "An escrow smart contract built on Solana using the Anchor framework. Implements token exchanges between two parties.",
            language: "Rust",
        },
        {
            name: "portfolio-website",
            description: "My personal developer portfolio and landing page. React, Tailwind CSS, and Framer Motion for animations.",
            language: "TypeScript",
        },
    ];
}
exports.default = router;
