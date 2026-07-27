"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeWellnessCollaboration = optimizeWellnessCollaboration;
const ai_client_1 = require("../../ai_client");
async function optimizeWellnessCollaboration(sleepHours, sleepQuality, stressLevel, currentFitnessPlan) {
    const prompt = `You are the Nexus Wellness Orchestration Engine. You coordinate our specialized sub-agents: Sleep Coach, Fitness Coach, Nutrition Coach, and Mental Wellness Coach.
Analyze the user's current wellness logs:
- Sleep Duration: ${sleepHours} hours
- Sleep Quality: ${sleepQuality}/100
- Stress Level: ${stressLevel}/10 (1 = calm, 10 = extreme burnout/stress)
- Current Fitness Plan for today: "${currentFitnessPlan}"

Tasks:
1. Determine if a collaboration alert should be triggered (Trigger if sleep hours < 6.5, sleep quality < 65, or stress level >= 7).
2. Trace the collaboration path (e.g. "Sleep Coach -> Nexus Engine -> Fitness Coach & Mental Wellness Coach").
3. Write a status summary explaining the physiological and mental state of the user.
4. Formulate specific, actionable adjustments for:
   - Fitness Coach: swap high-intensity workouts with recovery activities, prevent muscle injuries.
   - Nutrition Coach: specify energy support meals (protein, complex carbs) and stress-recovery nutrients.
   - Mental Wellness Coach: recommend breathwork, mindfulness, or box-breathing.
5. If metrics are healthy, state that the user is in optimal shape, but still provide minor positive recommendations.

Return a JSON object with:
{
  "nexusTriggered": boolean,
  "collaborationPath": "string",
  "statusSummary": "string",
  "adjustments": {"fitness": "string", "nutrition": "string", "mentalWellness": "string"}
}`;
    try {
        return await (0, ai_client_1.generateJson)(prompt);
    }
    catch (error) {
        console.error("Error in nexus collaboration:", error);
        // Fallback response
        const triggered = sleepHours < 6.5 || sleepQuality < 65 || stressLevel >= 7;
        return {
            nexusTriggered: triggered,
            collaborationPath: triggered
                ? "Sleep Coach -> Nexus Engine -> Fitness & Nutrition & Mental Wellness"
                : "Nexus Engine -> Daily Performance Optimization",
            statusSummary: triggered
                ? "User has compromised recovery parameters (poor sleep or elevated stress). Precautionary adjustments are required."
                : "User recovery metrics are solid. Standard wellness plan is optimal.",
            adjustments: {
                fitness: triggered
                    ? "Switch current fitness plan to light flexibility, walking, or low-intensity active recovery."
                    : "Proceed with today's scheduled workout. Maintain target heart rate zones.",
                nutrition: triggered
                    ? "Prioritize electrolyte hydration, increase protein intake, and incorporate complex carbs for sustained cognitive energy."
                    : "Maintain current caloric and hydration targets (2.5L water minimum).",
                mentalWellness: triggered
                    ? "Perform 5-10 minutes of box-breathing to lower cortisol levels."
                    : "Engage in 5 minutes of reflective journaling or wind-down stretch."
            }
        };
    }
}
