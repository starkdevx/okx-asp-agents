import { ai, MODEL_NAME } from "../../gemini";

export interface WindDownStep {
  time: string;
  activity: string;
}

export interface SleepCoachResponse {
  sleepAssessment: string;
  bedtimeTarget: string;
  windDownRoutine: WindDownStep[];
  sleepHygieneRules: string;
}

export async function analyzeSleepAndPlanBedtime(
  sleepHours: number,
  sleepQuality: number,
  caffeineAfternoon: boolean,
  screenTimeBeforeBed: boolean
): Promise<SleepCoachResponse> {
  const prompt = `You are the Sleep Coach agent, an expert in circadian rhythm, sleep hygiene, and recovery.
Analyze the user's sleep logs and habits:
- Sleep Hours: ${sleepHours} hours
- Sleep Quality Score: ${sleepQuality}/100
- Had Afternoon Caffeine: ${caffeineAfternoon ? "Yes" : "No"}
- Screen Time Before Bed: ${screenTimeBeforeBed ? "Yes" : "No"}

Tasks:
1. Provide a detailed assessment of their sleep, explaining how caffeine/screens or low duration impacts their recovery.
2. Recommend a realistic target bedtime (e.g., "10:30 PM").
3. Create a step-by-step wind-down routine (3-4 steps with relative times like "9:30 PM", "9:45 PM", "10:15 PM") to prepare for that target bedtime.
4. List critical sleep hygiene rules they must follow.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            sleepAssessment: {
              type: "STRING",
              description: "Detailed analysis of the user's sleep quality and habits."
            },
            bedtimeTarget: {
              type: "STRING",
              description: "Target bedtime time (e.g., '10:15 PM')."
            },
            windDownRoutine: {
              type: "ARRAY",
              description: "Step-by-step evening wind-down routine.",
              items: {
                type: "OBJECT",
                properties: {
                  time: { type: "STRING", description: "Target time for the activity." },
                  activity: { type: "STRING", description: "Action to take." }
                },
                required: ["time", "activity"]
              }
            },
            sleepHygieneRules: {
              type: "STRING",
              description: "Critical rules regarding lights, temperature, and substances."
            }
          },
          required: ["sleepAssessment", "bedtimeTarget", "windDownRoutine", "sleepHygieneRules"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }
    return JSON.parse(text) as SleepCoachResponse;
  } catch (error) {
    console.error("Error in sleepCoach:", error);
    // Fallback response in case of API failure
    return {
      sleepAssessment: `You slept for ${sleepHours} hours with a quality of ${sleepQuality}%. Screen use: ${screenTimeBeforeBed ? "Yes" : "No"}. Caffeine: ${caffeineAfternoon ? "Yes" : "No"}.`,
      bedtimeTarget: "10:30 PM",
      windDownRoutine: [
        { time: "9:30 PM", activity: "Turn off all electronic devices and screens." },
        { time: "10:00 PM", activity: "Dim lights, read a paper book, or do light stretching." },
        { time: "10:30 PM", activity: "Target sleep time. Ensure room is dark and cool." }
      ],
      sleepHygieneRules: "Avoid afternoon caffeine, limit blue light exposure before bed, and sleep in a dark, quiet, cool room."
    };
  }
}
