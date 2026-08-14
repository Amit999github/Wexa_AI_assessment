import * as graphService from '../services/graphService.js';

export async function getMentors(req, res, next) {
  try {
    res.json(await graphService.findMentorsForSkill(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req, res, next) {
  try {
    res.json(await graphService.findRecommendedPeers(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function getShortestPath(req, res, next) {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Query params "from" and "to" (developer ids) are required.' });
    }
    const path = await graphService.findShortestConnectionPath(from, to);
    if (!path) {
      return res.status(404).json({ error: `No connection found between "${from}" and "${to}".` });
    }
    res.json(path);
  } catch (err) {
    next(err);
  }
}

export async function getEgoGraph(req, res, next) {
  try {
    res.json(await graphService.getDeveloperEgoGraph(req.params.id));
  } catch (err) {
    next(err);
  }
}
