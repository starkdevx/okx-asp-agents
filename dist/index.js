"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./wellness/routes"));
const routes_2 = __importDefault(require("./careerpilot/routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// --- NAMESPACED ROUTER REGISTER ---
// 1. Wellness Companion Agent Namespace
app.use("/api/wellness", routes_1.default);
// 2. CareerPilot Agent Namespace
app.use("/api/careerpilot", routes_2.default);
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
            },
            {
                name: "CareerPilot Agent",
                prefix: "/api/careerpilot",
                endpoints: ["/profile/analyze", "/opportunities"]
            }
        ]
    });
});
// Start Server
app.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`   MULTI-AGENT ASP BACKEND ACTIVE (AWS EC2 COMPLIANT)`);
    console.log(`   Running locally on: http://localhost:${PORT}`);
    console.log(`=============================================================`);
    console.log(`   Registered Scopes:`);
    console.log(`   👉 Wellness Companion: http://localhost:${PORT}/api/wellness`);
    console.log(`      - MCP Endpoint:         POST /api/wellness/okx/mcp`);
    console.log(`      - Chat Endpoint:        POST /api/wellness/agent/chat`);
    console.log(`      - Collaborate Endpoint: POST /api/wellness/agent/collaborate`);
    console.log(`   👉 CareerPilot AI:      http://localhost:${PORT}/api/careerpilot`);
    console.log(`      - Profile Analyze:      POST /api/careerpilot/profile/analyze`);
    console.log(`      - Opportunities:        GET /api/careerpilot/opportunities`);
    console.log(`=============================================================`);
});
