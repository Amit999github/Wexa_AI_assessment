import { Router } from "express";
import {
  listDevelopers,
  getDeveloperProfile,
} from "../controllers/developerController.js";
import {
  getEgoGraph,
  getMentors,
  getRecommendations,
} from "../controllers/graphController.js";

const router = Router();

router.get("/", listDevelopers);
router.get("/:id", getDeveloperProfile);
router.get("/:id/graph", getEgoGraph);
router.get("/:id/mentors", getMentors);
router.get("/:id/recommendations", getRecommendations);

export default router;
