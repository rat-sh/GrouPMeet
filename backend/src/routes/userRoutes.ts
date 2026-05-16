import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { getUsers, getMe, savePhoneNumber, syncContacts } from "../controllers/userController";

const router = Router();

router.get("/", protectRoute, getUsers);
router.get("/me", protectRoute, getMe);
router.post("/verify-phone", protectRoute, savePhoneNumber);
router.post("/sync-contacts", protectRoute, syncContacts);

export default router;