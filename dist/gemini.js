"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRO_MODEL_NAME = exports.MODEL_NAME = exports.ai = void 0;
const genai_1 = require("@google/genai");
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
}
exports.ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
exports.MODEL_NAME = "gemini-2.0-flash";
exports.PRO_MODEL_NAME = "gemini-2.0-pro";
