import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import {
    createGroup,
    getGroup,
    updateGroup,
    addMembers,
    removeMember,
    promoteToAdmin,
    leaveGroup,
    deleteGroup,
} from "../controllers/groupController";

const router = Router();
router.use(protectRoute);

router.post("/", createGroup);                                    // Create group
router.get("/:groupId", getGroup);                                // Get group info
router.patch("/:groupId", updateGroup);                           // Update name / avatar
router.delete("/:groupId", deleteGroup);                          // Delete group (admin)
router.post("/:groupId/members", addMembers);                     // Add members (admin)
router.delete("/:groupId/members/:memberId", removeMember);       // Remove member
router.post("/:groupId/admins/:memberId", promoteToAdmin);        // Promote to admin
router.post("/:groupId/leave", leaveGroup);                       // Leave group

export default router;
