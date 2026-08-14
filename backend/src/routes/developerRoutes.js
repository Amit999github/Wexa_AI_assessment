import { Router } from 'express';
import * as developerController from '../controllers/developerController.js';
import * as graphController from '../controllers/graphController.js';

const router = Router();

router.get('/', developerController.listDevelopers);
router.get('/:id', developerController.getDeveloperProfile);
router.get('/:id/graph', graphController.getEgoGraph);
router.get('/:id/mentors', graphController.getMentors);
router.get('/:id/recommendations', graphController.getRecommendations);

export default router;
