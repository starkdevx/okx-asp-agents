"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_MODEL_NAME = exports.MODEL_NAME = void 0;
exports.generateText = generateText;
exports.generateJson = generateJson;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const apiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
if (!apiKey) {
    throw new Error("Please define the GROQ_KEY environment variable inside .env");
}
const groq = new groq_sdk_1.default({ apiKey });
exports.MODEL_NAME = "groq/compound";
exports.FALLBACK_MODEL_NAME = "groq/compound-mini";
/**
 * Standard text completions wrapper
 */
async function generateText(prompt, systemInstruction) {
    const messages = [];
    if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
    }
    if (Array.isArray(prompt)) {
        prompt.forEach((msg) => {
            if (msg.role && msg.parts && Array.isArray(msg.parts)) {
                messages.push({
                    role: msg.role === "model" ? "assistant" : "user",
                    content: msg.parts[0]?.text || ""
                });
            }
            else if (msg.role && msg.content !== undefined) {
                messages.push(msg);
            }
        });
    }
    else {
        messages.push({ role: "user", content: prompt });
    }
    try {
        const completion = await groq.chat.completions.create({
            model: exports.MODEL_NAME,
            messages,
        });
        return completion.choices[0]?.message?.content || "";
    }
    catch (error) {
        console.warn(`[Groq] generateText failed with model ${exports.MODEL_NAME}, trying fallback ${exports.FALLBACK_MODEL_NAME}. Error:`, error);
        try {
            const completion = await groq.chat.completions.create({
                model: exports.FALLBACK_MODEL_NAME,
                messages,
            });
            return completion.choices[0]?.message?.content || "";
        }
        catch (fallbackError) {
            console.error("[Groq] Fallback model also failed:", fallbackError);
            throw fallbackError;
        }
    }
}
/**
 * Structured JSON completions wrapper
 */
async function generateJson(prompt, systemInstruction) {
    const messages = [];
    if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
    }
    if (Array.isArray(prompt)) {
        prompt.forEach((msg) => {
            if (msg.role && msg.parts && Array.isArray(msg.parts)) {
                messages.push({
                    role: msg.role === "model" ? "assistant" : "user",
                    content: msg.parts[0]?.text || ""
                });
            }
            else if (msg.role && msg.content !== undefined) {
                messages.push(msg);
            }
        });
    }
    else {
        messages.push({ role: "user", content: prompt });
    }
    let textResponse = "";
    try {
        const completion = await groq.chat.completions.create({
            model: exports.MODEL_NAME,
            messages,
            response_format: { type: "json_object" }
        });
        textResponse = completion.choices[0]?.message?.content || "{}";
    }
    catch (error) {
        console.warn(`[Groq] generateJson failed with model ${exports.MODEL_NAME}, trying fallback ${exports.FALLBACK_MODEL_NAME}. Error:`, error);
        try {
            const completion = await groq.chat.completions.create({
                model: exports.FALLBACK_MODEL_NAME,
                messages,
                response_format: { type: "json_object" }
            });
            textResponse = completion.choices[0]?.message?.content || "{}";
        }
        catch (fallbackError) {
            console.error("[Groq] JSON Fallback model also failed:", fallbackError);
            throw fallbackError;
        }
    }
    // Clean Markdown JSON wrapping if the LLM returned it anyway
    let cleanText = textResponse.trim();
    if (cleanText.includes("```json")) {
        cleanText = cleanText.split("```json")[1].split("```")[0].trim();
    }
    else if (cleanText.includes("```")) {
        cleanText = cleanText.split("```")[1].split("```")[0].trim();
    }
    return JSON.parse(cleanText);
}
