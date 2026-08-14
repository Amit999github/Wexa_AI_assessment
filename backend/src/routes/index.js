import { Router } from 'express';
import developerRoutes from './developerRoutes.js';
import skillRoutes from './skillRoutes.js';
import projectRoutes from './projectRoutes.js';
import graphRoutes from './graphRoutes.js';

const router = Router();

router.use('/developers', developerRoutes);
router.use('/skills', skillRoutes);
router.use('/projects', projectRoutes);
router.use('/graph', graphRoutes);

export default router;
