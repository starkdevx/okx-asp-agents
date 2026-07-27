import { generateJson } from "../../ai_client";

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
6. Give critical coaching tips regarding execution, posture, and safety.

Return a JSON object with:
{
  "routineType": "string",
  "intensity": "string",
  "durationMinutes": number,
  "warmup": "string",
  "exercises": [{"name": "string", "sets": number, "reps": "string", "restSeconds": number}],
  "coachingTips": "string"
}`;

  try {
    return await generateJson<FitnessCoachResponse>(prompt);
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
