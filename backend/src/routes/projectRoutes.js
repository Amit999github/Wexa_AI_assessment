import { Router } from "express";
import {
  listProjects,
  getProjectTeam,
  getProjectDetail,
} from "../controllers/projectController.js";

const router = Router();

router.get("/", listProjects);
router.get("/:id/team", getProjectTeam);
router.get("/:id", getProjectDetail);

export default router;
