import * as developerService from '../services/developerService.js';

export async function listDevelopers(req, res, next) {
  try {
    const developers = await developerService.getAllDevelopers();
    res.json(developers);
  } catch (err) {
    next(err);
  }
}

export async function getDeveloperProfile(req, res, next) {
  try {
    const profile = await developerService.getDeveloperProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: `No developer found with id "${req.params.id}"` });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}
