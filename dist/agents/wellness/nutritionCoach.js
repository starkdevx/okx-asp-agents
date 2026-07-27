"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDietChart = generateDietChart;
const gemini_1 = require("../../gemini");
async function generateDietChart(goals, dietaryPreferences, allergies, currentRecoveryLevel) {
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
5. Provide detailed hydration advice.`;
    try {
        const response = await gemini_1.ai.models.generateContent({
            model: gemini_1.MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        dailyCalorieTarget: { type: "INTEGER", description: "Target daily calories." },
                        macros: {
                            type: "OBJECT",
                            properties: {
                                protein: { type: "STRING", description: "Protein target (e.g., '140g')." },
                                carbs: { type: "STRING", description: "Carbohydrates target (e.g., '300g')." },
                                fat: { type: "STRING", description: "Fat target (e.g., '70g')." }
                            },
                            required: ["protein", "carbs", "fat"]
                        },
                        mealPlan: {
                            type: "OBJECT",
                            properties: {
                                breakfast: { type: "STRING", description: "Breakfast description." },
                                lunch: { type: "STRING", description: "Lunch description." },
                                snack: { type: "STRING", description: "Snack description." },
                                dinner: { type: "STRING", description: "Dinner description." }
                            },
                            required: ["breakfast", "lunch", "snack", "dinner"]
                        },
                        hydrationAdvice: { type: "STRING", description: "Hydration instructions." }
                    },
                    required: ["dailyCalorieTarget", "macros", "mealPlan", "hydrationAdvice"]
                }
            }
        });
        const text = response.text;
        if (!text) {
            throw new Error("No response text from Gemini");
        }
        return JSON.parse(text);
    }
    catch (error) {
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
