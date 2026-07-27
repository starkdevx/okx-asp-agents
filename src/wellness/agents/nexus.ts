import { ai, MODEL_NAME } from "../../gemini";

export interface Adjustments {
  fitness: string;
  nutrition: string;
  mentalWellness: string;
}

export interface NexusResponse {
  nexusTriggered: boolean;
  collaborationPath: string;
  statusSummary: string;
  adjustments: Adjustments;
}

export async function optimizeWellnessCollaboration(
  sleepHours: number,
  sleepQuality: number,
  stressLevel: number,
  currentFitnessPlan: string
): Promise<NexusResponse> {
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
5. If metrics are healthy, state that the user is in optimal shape, but still provide minor positive recommendations.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            nexusTriggered: { type: "BOOLEAN", description: "Whether a collaboration alert was triggered." },
            collaborationPath: { type: "STRING", description: "The agentic communication path (e.g., 'Sleep Agent -> Nexus -> Fitness Agent')." },
            statusSummary: { type: "STRING", description: "Assessment of the user's combined wellness state." },
            adjustments: {
              type: "OBJECT",
              properties: {
                fitness: { type: "STRING", description: "Adjustments to exercise/fitness routine." },
                nutrition: { type: "STRING", description: "Adjustments to hydration and meal plans." },
                mentalWellness: { type: "STRING", description: "Mindfulness and stress-reduction actions." }
              },
              required: ["fitness", "nutrition", "mentalWellness"]
            }
          },
          required: ["nexusTriggered", "collaborationPath", "statusSummary", "adjustments"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }
    return JSON.parse(text) as NexusResponse;
  } catch (error) {
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
