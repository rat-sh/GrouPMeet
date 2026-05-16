import express from "express";
import { getEmailThreads } from "../controllers/emailController";

const router = express.Router();

router.get("/threads", getEmailThreads);

export default router;
