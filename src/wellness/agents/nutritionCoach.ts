import { generateJson } from "../../ai_client";

export interface Macros {
  protein: string;
  carbs: string;
  fat: string;
}

export interface MealPlan {
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
}

export interface NutritionCoachResponse {
  dailyCalorieTarget: number;
  macros: Macros;
  mealPlan: MealPlan;
  hydrationAdvice: string;
}

export async function generateDietChart(
  goals: string,
  dietaryPreferences: string,
  allergies?: string,
  currentRecoveryLevel?: string
): Promise<NutritionCoachResponse> {
  const prompt = `You are the Nutrition Coach agent, a registered dietitian and sports nutritionist.
Create a customized daily diet chart for a user with the following profile:
- Primary Fitness/Health Goals: ${goals}
- Dietary Preferences: ${dietaryPreferences}
- Allergies/Exclusions: ${allergies || "None"}
${currentRecoveryLevel ? `- RECOVERY STATUS: ${currentRecoveryLevel}` : ""}

Tasks:
1. Calculate a suitable daily calorie target.
2. Formulate macronutrient targets (protein, carbs, and fat, e.g. "120g", "250g", "70g").
3. Create a daily meal plan with four entries: breakfast, lunch, snack, and dinner. Make sure the meals exclude any allergens and respect dietary preferences (e.g., vegetarian, vegan, etc.).
4. If a RECOVERY STATUS is active (e.g. sore muscles, low sleep, fatigue), adjust the meals and macros:
   - Provide higher protein or recovery-aiding ingredients (e.g. antioxidant-rich foods, magnesium-rich grains).
   - Suggest energy-supporting meals (complex carbohydrates) and electrolyte adjustments.
5. Provide detailed hydration advice.

Return a JSON object with:
{
  "dailyCalorieTarget": number,
  "macros": {"protein": "string", "carbs": "string", "fat": "string"},
  "mealPlan": {"breakfast": "string", "lunch": "string", "snack": "string", "dinner": "string"},
  "hydrationAdvice": "string"
}`;

  try {
    return await generateJson<NutritionCoachResponse>(prompt);
  } catch (error) {
    console.error("Error in nutritionCoach:", error);
    // Fallback response
    return {
      dailyCalorieTarget: 2200,
      macros: {
        protein: "120g",
        carbs: "240g",
        fat: "70g"
      },
      mealPlan: {
        breakfast: "Oatmeal with almonds, banana slices, and a scoop of protein powder.",
        lunch: "Large mixed greens salad with chickpeas, quinoa, cucumber, and olive oil vinaigrette.",
        snack: "Mixed berries and pumpkin seeds.",
        dinner: "Stir-fried tofu with brown rice, broccoli, carrots, and soy sauce."
      },
      hydrationAdvice: "Drink 2.5 - 3.0 liters of water evenly throughout the day."
    };
  }
}
