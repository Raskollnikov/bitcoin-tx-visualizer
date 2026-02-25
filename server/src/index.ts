import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response } from "express";
import txRoute from "./routes/tx";
import addressRoutes from "./routes/address";
import blockRoutes from "./routes/block";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "too many requests from this IP, please try again laterr",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ message: "hello" });
});

app.use("/api/tx", txRoute);
app.use("/api/address", addressRoutes);
app.use("/api/block", blockRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`app is running on PORT: ${PORT}`));
