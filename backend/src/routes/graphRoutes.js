import { Router } from 'express';
import * as graphController from '../controllers/graphController.js';

const router = Router();

// GET /api/graph/path?from=dev6&to=dev8
router.get('/path', graphController.getShortestPath);

export default router;
