"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.ApplicationProgress = exports.MatchResult = exports.Opportunity = exports.UserProfile = void 0;
exports.connectDB = connectDB;
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = require("crypto");
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
}
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose_1.default.connect(MONGODB_URI, opts).then((m) => {
            return m;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
const schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
};
const UserProfileSchema = new mongoose_1.Schema({
    _id: { type: String, default: () => (0, crypto_1.randomUUID)() },
    email: { type: String, unique: true, sparse: true },
    name: { type: String },
    resumeText: { type: String, required: true },
    githubUsername: { type: String, required: true },
    skills: { type: [String], default: [] },
    targetRoles: { type: [String], default: [] },
    summary: { type: String, required: true },
    insights: { type: mongoose_1.Schema.Types.Mixed },
}, schemaOptions);
const OpportunitySchema = new mongoose_1.Schema({
    _id: { type: String, default: () => (0, crypto_1.randomUUID)() },
    type: { type: String, required: true }, // "JOB", "GRANT", "HACKATHON"
    title: { type: String, required: true },
    company: { type: String, required: true },
    ecosystem: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    requirements: { type: [String], default: [] },
}, schemaOptions);
const MatchResultSchema = new mongoose_1.Schema({
    _id: { type: String, default: () => (0, crypto_1.randomUUID)() },
    userId: { type: String, required: true },
    opportunityId: { type: String, required: true },
    matchScore: { type: Number, required: true },
    gapAnalysis: { type: String, required: true },
    roadmap: { type: mongoose_1.Schema.Types.Mixed }, // JSON array/object of study roadmap
}, schemaOptions);
MatchResultSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
const ApplicationProgressSchema = new mongoose_1.Schema({
    _id: { type: String, default: () => (0, crypto_1.randomUUID)() },
    userId: { type: String, required: true },
    opportunityId: { type: String, required: true },
    status: { type: String, required: true }, // "DRAFTED", "APPLIED", "INTERVIEWING", "ACCEPTED", "REJECTED"
    notes: { type: String },
}, schemaOptions);
ApplicationProgressSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
exports.UserProfile = mongoose_1.default.models.UserProfile || mongoose_1.default.model("UserProfile", UserProfileSchema);
exports.Opportunity = mongoose_1.default.models.Opportunity || mongoose_1.default.model("Opportunity", OpportunitySchema);
exports.MatchResult = mongoose_1.default.models.MatchResult || mongoose_1.default.model("MatchResult", MatchResultSchema);
exports.ApplicationProgress = mongoose_1.default.models.ApplicationProgress || mongoose_1.default.model("ApplicationProgress", ApplicationProgressSchema);
// Prisma-like object access wrapper
exports.db = {
    userProfile: exports.UserProfile,
    opportunity: exports.Opportunity,
    matchResult: exports.MatchResult,
    applicationProgress: exports.ApplicationProgress,
};
