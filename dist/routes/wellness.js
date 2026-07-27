"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nutritionCoach_1 = require("../agents/wellness/nutritionCoach");
const fitnessCoach_1 = require("../agents/wellness/fitnessCoach");
const sleepCoach_1 = require("../agents/wellness/sleepCoach");
const nexus_1 = require("../agents/wellness/nexus");
const gemini_1 = require("../gemini");
const router = (0, express_1.Router)();
// --- 1. OKX.AI MCP Gateway Endpoint ---
router.post("/okx/mcp", async (req, res) => {
    try {
        const { method, name, arguments: toolArguments } = req.body;
        // Handle tool listing
        if (method === "list_tools" || req.body.type === "list_tools" || !method) {
            return res.json({
                tools: [
                    {
                        name: "generate_diet_chart",
                        description: "Generates a customized daily diet chart (calories, macros, meal structure) adjusted to dietary needs, fitness goals, and current recovery status.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                goals: { type: "string", description: "Fitness or health goals (e.g., 'Muscle gain & strength')." },
                                dietaryPreferences: { type: "string", description: "Dietary preferences (e.g., 'Vegetarian', 'Vegan', 'Balanced')." },
                                allergies: { type: "string", description: "Allergies or exclusions (e.g., 'Peanuts')." },
                                currentRecoveryLevel: { type: "string", description: "Current physical fatigue/recovery status (e.g., 'Sore muscles')." }
                            },
                            required: ["goals", "dietaryPreferences"]
                        }
                    },
                    {
                        name: "generate_workout_plan",
                        description: "Generates a tailored workout plan (exercises, sets, reps, intensity) based on current energy, fitness level, goals, or physical limitations.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                fitnessLevel: { type: "string", description: "User's experience level ('Beginner', 'Intermediate', 'Advanced')." },
                                goals: { type: "string", description: "Workout goals (e.g., 'Fat loss & Core stability')." },
                                limitations: { type: "string", description: "Physical limitations or joint pain (e.g., 'Lower back tightness')." },
                                recoveryModifier: { type: "string", description: "Optional recovery trigger (e.g., 'Poor sleep last night')." }
                            },
                            required: ["fitnessLevel", "goals"]
                        }
                    },
                    {
                        name: "analyze_sleep_and_plan_bedtime",
                        description: "Analyzes sleep metrics (hours slept, quality score) and outputs a personalized wind-down schedule and behavior guide to improve restorative sleep.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                sleepHours: { type: "number", description: "Hours of sleep logged." },
                                sleepQuality: { type: "number", description: "Quality of sleep logged (1-100)." },
                                caffeineAfternoon: { type: "boolean", description: "Did the user consume caffeine in the afternoon?" },
                                screenTimeBeforeBed: { type: "boolean", description: "Did the user look at screens/electronic devices before sleeping?" }
                            },
                            required: ["sleepHours", "sleepQuality"]
                        }
                    },
                    {
                        name: "optimize_wellness_collaboration",
                        description: "Runs the multi-agent collaboration engine. Adjusts workouts, nutrition/diet, and mindfulness suggestions dynamically based on daily logs.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                sleepHours: { type: "number", description: "Hours of sleep logged." },
                                sleepQuality: { type: "number", description: "Quality of sleep logged (1-100)." },
                                stressLevel: { type: "number", description: "Stress level from 1 (calm) to 10 (burnout)." },
                                currentFitnessPlan: { type: "string", description: "Today's planned fitness routine (e.g., 'Heavy leg day')." }
                            },
                            required: ["sleepHours", "sleepQuality", "stressLevel"]
                        }
                    }
                ]
            });
        }
        // Handle tool execution
        if (method === "call_tool" || req.body.type === "call_tool") {
            const toolName = name || req.body.tool;
            const args = toolArguments || req.body.arguments || {};
            if (!toolName) {
                return res.status(400).json({ error: "Tool name is required for call_tool" });
            }
            console.log(`[Wellness Companion] Invoking tool: ${toolName}`);
            switch (toolName) {
                case "generate_diet_chart": {
                    const result = await (0, nutritionCoach_1.generateDietChart)(args.goals, args.dietaryPreferences, args.allergies, args.currentRecoveryLevel);
                    return res.json({
                        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                    });
                }
                case "generate_workout_plan": {
                    const result = await (0, fitnessCoach_1.generateWorkoutPlan)(args.fitnessLevel, args.goals, args.limitations, args.recoveryModifier);
                    return res.json({
                        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                    });
                }
                case "analyze_sleep_and_plan_bedtime": {
                    const result = await (0, sleepCoach_1.analyzeSleepAndPlanBedtime)(Number(args.sleepHours), Number(args.sleepQuality), !!args.caffeineAfternoon, !!args.screenTimeBeforeBed);
                    return res.json({
                        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                    });
                }
                case "optimize_wellness_collaboration": {
                    const result = await (0, nexus_1.optimizeWellnessCollaboration)(Number(args.sleepHours), Number(args.sleepQuality), Number(args.stressLevel), args.currentFitnessPlan || "Standard workout");
                    return res.json({
                        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                    });
                }
                default:
                    return res.status(404).json({ error: `Tool ${toolName} not found` });
            }
        }
        return res.status(400).json({ error: "Invalid method. Expected list_tools or call_tool" });
    }
    catch (error) {
        console.error("Wellness MCP Error:", error);
        return res.json({
            content: [{ type: "text", text: `Error processing request: ${error.message}` }],
            isError: true
        });
    }
});
// --- 2. Chat Endpoint ---
router.post("/agent/chat", async (req, res) => {
    try {
        const { message, targetCoach, history = [] } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        let systemInstruction = "";
        let systemRole = "Wellness Companion";
        switch (targetCoach) {
            case "fitness":
                systemRole = "💪 Fitness Coach";
                systemInstruction = "You are the Fitness Coach, an elite personal trainer and kinesiologist. Give specific exercise, mobility, and strength guidance. Keep it motivating, structured, and focused on safety.";
                break;
            case "nutrition":
                systemRole = "🥗 Nutrition Coach";
                systemInstruction = "You are the Nutrition Coach, a sports dietitian. Give detailed dietary advice, meal concepts, macro targets, and hydration logs. Focus on whole foods and nutrition timing.";
                break;
            case "sleep":
                systemRole = "😴 Sleep Coach";
                systemInstruction = "You are the Sleep Coach, a specialist in sleep hygiene and circadian rhythms. Explain wind-down protocols, light control, and habits to improve deep sleep.";
                break;
            case "all":
            default:
                systemRole = "✨ Collaborative Panel";
                systemInstruction = `You are a panel of three expert wellness coaches collaborating on a user question:
1. 💪 Fitness Coach
2. 🥗 Nutrition Coach
3. 😴 Sleep Coach

Provide a conversational response where each coach chimes in with their perspective on the user's question, and then finish with a unified 3-step action checklist. Address the user directly and warmly.`;
                break;
        }
        const messages = [];
        // Add history
        for (const chatMsg of history) {
            messages.push({
                role: chatMsg.sender === "user" ? "user" : "model",
                parts: [{ text: chatMsg.text }]
            });
        }
        // Add current user message
        messages.push({
            role: "user",
            parts: [{ text: message }]
        });
        const response = await gemini_1.ai.models.generateContent({
            model: gemini_1.MODEL_NAME,
            contents: messages,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        const reply = response.text || "I apologize, but I could not formulate a response.";
        return res.json({
            role: systemRole,
            text: reply
        });
    }
    catch (error) {
        console.error("Wellness Chat Error:", error);
        return res.status(500).json({ error: error.message || "Failed to process chat" });
    }
});
// --- 3. Collaboration Sync Endpoint ---
router.post("/agent/collaborate", async (req, res) => {
    try {
        const { sleepHours, sleepQuality, stressLevel, currentFitnessPlan, fitnessLevel = "Intermediate", fitnessGoals = "General Fitness & Health", limitations = "None", dietaryPreferences = "Balanced Diet", allergies = "None", caffeineAfternoon = false, screenTimeBeforeBed = false } = req.body;
        if (sleepHours === undefined || sleepQuality === undefined || stressLevel === undefined) {
            return res.status(400).json({ error: "sleepHours, sleepQuality, and stressLevel are required." });
        }
        // Run Nexus Orchestration
        const nexusResult = await (0, nexus_1.optimizeWellnessCollaboration)(Number(sleepHours), Number(sleepQuality), Number(stressLevel), currentFitnessPlan || "Standard workout");
        const recoveryReason = nexusResult.nexusTriggered
            ? `Low recovery alert (Sleep: ${sleepHours}h, Quality: ${sleepQuality}%, Stress: ${stressLevel}/10). Focus on recovery, mobility, and injury prevention.`
            : undefined;
        const nutritionRecovery = nexusResult.nexusTriggered
            ? `Low energy recovery support. High protein, anti-inflammatory meals, hydration support. Sleep: ${sleepHours}h.`
            : undefined;
        const adaptedWorkout = await (0, fitnessCoach_1.generateWorkoutPlan)(fitnessLevel, fitnessGoals, limitations, recoveryReason);
        const adaptedDiet = await (0, nutritionCoach_1.generateDietChart)(fitnessGoals, dietaryPreferences, allergies, nutritionRecovery);
        const bedtimeRoutine = await (0, sleepCoach_1.analyzeSleepAndPlanBedtime)(Number(sleepHours), Number(sleepQuality), caffeineAfternoon, screenTimeBeforeBed);
        return res.json({
            nexus: nexusResult,
            workout: adaptedWorkout,
            diet: adaptedDiet,
            sleep: bedtimeRoutine
        });
    }
    catch (error) {
        console.error("Wellness Collaborate Error:", error);
        return res.status(500).json({ error: error.message || "Failed to run collaboration engine" });
    }
});
exports.default = router;
