import { Router } from "express";
import { getShortestPath } from "../controllers/graphController.js";

const router = Router();

// GET /api/graph/path?from=dev6&to=dev8
router.get("/path", getShortestPath);

export default router;
