import * as projectService from '../services/projectService.js';

export async function listProjects(req, res, next) {
  try {
    res.json(await projectService.getAllProjects());
  } catch (err) {
    next(err);
  }
}

export async function getProjectTeam(req, res, next) {
  try {
    res.json(await projectService.getProjectTeam(req.params.id));
  } catch (err) {
    next(err);
  }
}
