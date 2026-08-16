import { Router } from "express";
import { listSkills, listDevelopersForSkill, getSkillDetail } from "../controllers/skillController.js";

const router = Router();

router.get("/", listSkills);
router.get("/:name/developers", listDevelopersForSkill);
router.get("/:name", getSkillDetail);

export default router;
