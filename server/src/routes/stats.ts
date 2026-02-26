import { Router } from "express";
import { getNetworkStats } from "../controllers/blockstream";
const router = Router();

router.get("/", getNetworkStats);

export default router;
