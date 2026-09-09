import app from "./app";
import connectDB from "./config/dbConnection";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
