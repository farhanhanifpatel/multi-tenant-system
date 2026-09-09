import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbUrl: string = process.env.MONGO_URL || "";

const connectDatabase = () => {
  mongoose
    .connect(dbUrl, {} as ConnectOptions)
    .then(() => {
      console.log("✅ DataBase Connected Successfully...");
    })
    .catch((error) => console.log("❌ Error:", error));
};

export default connectDatabase;
