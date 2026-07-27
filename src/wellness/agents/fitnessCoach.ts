import { ai, MODEL_NAME } from "../../gemini";

export interface ExerciseStep {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface FitnessCoachResponse {
  routineType: string;
  intensity: string;
  durationMinutes: number;
  warmup: string;
  exercises: ExerciseStep[];
  coachingTips: string;
}

export async function generateWorkoutPlan(
  fitnessLevel: string,
  goals: string,
  limitations: string,
  recoveryModifier?: string
): Promise<FitnessCoachResponse> {
  const prompt = `You are the Fitness Coach agent, an expert personal trainer and kinesiologist.
Analyze the user's fitness profile and create a targeted, customized workout:
- Fitness Level: ${fitnessLevel}
- Goals: ${goals}
- Physical Limitations/Injuries: ${limitations || "None"}
${recoveryModifier ? `- IMPORTANT RECOVERY MODIFIER: ${recoveryModifier}` : ""}

Tasks:
1. Determine the routine type (e.g., "Full Body Strength", "HIIT Cardio", "Active Recovery Yoga", "Core & Mobility").
2. Set an appropriate intensity level ("Low", "Medium", or "High") and duration.
3. If a RECOVERY MODIFIER is present (e.g., poor sleep, high stress, sore muscles, injury risk), you MUST adjust the exercises to be low-intensity, focusing on flexibility, active recovery, or mobility. Do NOT recommend heavy weights or high-intensity intervals if recovery is required.
4. List a warmup routine.
5. Create a list of 3-5 specific exercises (providing name, sets, reps/duration, and rest time).
6. Give critical coaching tips regarding execution, posture, and safety.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            routineType: { type: "STRING", description: "Name/Type of workout." },
            intensity: { type: "STRING", description: "Workout intensity (Low, Medium, High)." },
            durationMinutes: { type: "INTEGER", description: "Workout duration in minutes." },
            warmup: { type: "STRING", description: "Brief warmup instruction." },
            exercises: {
              type: "ARRAY",
              description: "List of exercises in the plan.",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING", description: "Name of the exercise." },
                  sets: { type: "INTEGER", description: "Number of sets." },
                  reps: { type: "STRING", description: "Reps count or duration per set (e.g. '12 reps', '45 secs hold')." },
                  restSeconds: { type: "INTEGER", description: "Seconds of rest between sets." }
                },
                required: ["name", "sets", "reps", "restSeconds"]
              }
            },
            coachingTips: { type: "STRING", description: "Safety and execution guidelines." }
          },
          required: ["routineType", "intensity", "durationMinutes", "warmup", "exercises", "coachingTips"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }
    return JSON.parse(text) as FitnessCoachResponse;
  } catch (error) {
    console.error("Error in fitnessCoach:", error);
    // Fallback response
    return {
      routineType: recoveryModifier ? "Active Mobility & Stretching" : "Full Body Cardio & Core",
      intensity: recoveryModifier ? "Low" : "Medium",
      durationMinutes: 30,
      warmup: "5 minutes of neck rolls, shoulder rolls, and light leg swings.",
      exercises: [
        { name: "Bodyweight Squats", sets: 3, reps: "10-12 reps", restSeconds: 45 },
        { name: "Plank Hold", sets: 3, reps: "30-45 seconds", restSeconds: 60 },
        { name: "Bird-Dog Pose", sets: 3, reps: "10 per side", restSeconds: 30 }
      ],
      coachingTips: "Keep your movements controlled. Drink water, focus on your breathing, and stop immediately if you feel pain."
    };
  }
}
