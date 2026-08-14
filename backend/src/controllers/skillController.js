import * as skillService from '../services/skillService.js';

export async function listSkills(req, res, next) {
  try {
    res.json(await skillService.getAllSkills());
  } catch (err) {
    next(err);
  }
}

export async function listDevelopersForSkill(req, res, next) {
  try {
    res.json(await skillService.getDevelopersForSkill(req.params.name));
  } catch (err) {
    next(err);
  }
}
