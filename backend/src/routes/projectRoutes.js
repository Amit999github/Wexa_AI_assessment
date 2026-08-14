import { Router } from "express";
import * as projectController from "../controllers/projectController.js";

const router = Router();

router.get("/", projectController.listProjects);
router.get("/:id/team", projectController.getProjectTeam);
router.get("/:id", projectController.getProjectDetail);

export default router;
