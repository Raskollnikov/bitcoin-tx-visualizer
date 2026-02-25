import { Router } from "express";
import { getTxInfo } from "../controllers/blockstream";
const router = Router();

router.get("/:txid", getTxInfo);

export default router;
