import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Request, Response } from "express";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ message: "hello" });
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`app is running in PORT: ${PORT}`));
