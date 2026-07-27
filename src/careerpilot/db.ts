import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

interface ICached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: ICached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
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
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

const UserProfileSchema = new Schema({
  _id: { type: String, default: () => randomUUID() },
  email: { type: String, unique: true, sparse: true },
  name: { type: String },
  resumeText: { type: String, required: true },
  githubUsername: { type: String, required: true },
  skills: { type: [String], default: [] },
  targetRoles: { type: [String], default: [] },
  summary: { type: String, required: true },
  insights: { type: Schema.Types.Mixed },
}, schemaOptions);

const OpportunitySchema = new Schema({
  _id: { type: String, default: () => randomUUID() },
  type: { type: String, required: true }, // "JOB", "GRANT", "HACKATHON"
  title: { type: String, required: true },
  company: { type: String, required: true },
  ecosystem: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  requirements: { type: [String], default: [] },
}, schemaOptions);

const MatchResultSchema = new Schema({
  _id: { type: String, default: () => randomUUID() },
  userId: { type: String, required: true },
  opportunityId: { type: String, required: true },
  matchScore: { type: Number, required: true },
  gapAnalysis: { type: String, required: true },
  roadmap: { type: Schema.Types.Mixed }, // JSON array/object of study roadmap
}, schemaOptions);
MatchResultSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

const ApplicationProgressSchema = new Schema({
  _id: { type: String, default: () => randomUUID() },
  userId: { type: String, required: true },
  opportunityId: { type: String, required: true },
  status: { type: String, required: true }, // "DRAFTED", "APPLIED", "INTERVIEWING", "ACCEPTED", "REJECTED"
  notes: { type: String },
}, schemaOptions);
ApplicationProgressSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

export const UserProfile = mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);
export const Opportunity = mongoose.models.Opportunity || mongoose.model("Opportunity", OpportunitySchema);
export const MatchResult = mongoose.models.MatchResult || mongoose.model("MatchResult", MatchResultSchema);
export const ApplicationProgress = mongoose.models.ApplicationProgress || mongoose.model("ApplicationProgress", ApplicationProgressSchema);

// Prisma-like object access wrapper
export const db = {
  userProfile: UserProfile,
  opportunity: Opportunity,
  matchResult: MatchResult,
  applicationProgress: ApplicationProgress,
};
