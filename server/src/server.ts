import app from "./app";
import env from "./config/env";

const server = app.listen(env.PORT, async () => {
    try {
        console.log(`🚀 Server is running on http://localhost:${env.PORT}`);
    } catch (error) {
        console.error("🛑 Error starting server:", error);
    }
});

process.on("uncaughtException", (err: Error) => {
    console.error("🛑 Uncaught Exception:", err);
    process.exit(1);
});
process.on("unhandledRejection", (reason: any) => {
    console.error("🔴 Unhandled Rejection:", reason);
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    console.log("🧼 SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        console.log("💤 Server closed.");
    });
});
