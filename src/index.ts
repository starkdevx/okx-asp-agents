import "dotenv/config";
import express from "express";
import cors from "cors";
import wellnessRouter from "./wellness/routes";

const app = express();
const PORT = process.env.PORT || 3002;

// Pretty-print JSON responses
app.set("json spaces", 2);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- NAMESPACED ROUTER REGISTER ---

// 1. Wellness Companion Agent Namespace
app.use("/api/wellness", wellnessRouter);

// Base server healthcheck route
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    activeNamespaces: [
      {
        name: "Wellness Companion Agent",
        prefix: "/api/wellness",
        endpoints: ["/okx/mcp", "/agent/chat", "/agent/collaborate"]
      }
    ]
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`   WELLNESS COMPANION ASP BACKEND ACTIVE (AWS EC2 COMPLIANT)`);
  console.log(`   Running locally on: http://localhost:${PORT}`);
  console.log(`=============================================================`);
  console.log(`   Registered Scopes:`);
  console.log(`   👉 Wellness Companion: http://localhost:${PORT}/api/wellness`);
  console.log(`      - MCP Endpoint:         POST /api/wellness/okx/mcp`);
  console.log(`      - Chat Endpoint:        POST /api/wellness/agent/chat`);
  console.log(`      - Collaborate Endpoint: POST /api/wellness/agent/collaborate`);
  console.log(`=============================================================`);
});
