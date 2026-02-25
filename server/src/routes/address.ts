import { Router } from "express";
import { getAddress } from "../controllers/blockstream";
const router = Router();

router.get("/:addr", getAddress);

export default router;
