import { Router } from 'express';
import * as skillController from '../controllers/skillController.js';

const router = Router();

router.get('/', skillController.listSkills);
router.get('/:name/developers', skillController.listDevelopersForSkill);

export default router;
