import { Router } from "express";
import { getBlock } from "../controllers/blockstream";
const router = Router();

router.get("/:block", getBlock);

export default router;
