import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;
const ENV  = process.env.NODE_ENV || "development";

// ─── Startup ──────────────────────────────────────────────────────────────────

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("─────────────────────────────────────────");
      console.log(`  Server    : http://localhost:${PORT}`);
      console.log(`  Env       : ${ENV}`);
      console.log(`  Started   : ${new Date().toISOString()}`);
      console.log("─────────────────────────────────────────");
    });
  } catch (err) {
    console.error("[Server] Startup failed:", err.message);
    process.exit(1);
  }
};

// ─── Unhandled Rejections & Exceptions ───────────────────────────────────────

process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught exception:", err.message);
  process.exit(1);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

const shutdown = (signal) => {
  console.log(`\n[Server] ${signal} received — shutting down gracefully`);
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ─── Boot ─────────────────────────────────────────────────────────────────────

start();