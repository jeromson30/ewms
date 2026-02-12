import Planning from '../models/Planning.js';
import Project from '../models/Project.js';

export const getGlobalPlanning = async (req, res) => {
  try {
    const projects = await Project.find().select('_id name color');

    const projectIds = projects.map(p => p._id);

    const plannings = await Planning.find({ project: { $in: projectIds } })
      .populate('project', 'name color')
      .populate('events.assignees', 'firstName lastName email avatar')
      .populate('onCallSchedule.user', 'firstName lastName email avatar');

    const allEvents = [];
    const allOnCalls = [];

    for (const planning of plannings) {
      const projectInfo = { _id: planning.project._id, name: planning.project.name, color: planning.project.color };

      for (const event of planning.events) {
        allEvents.push({ ...event.toObject(), project: projectInfo });
      }

      for (const onCall of planning.onCallSchedule) {
        allOnCalls.push({ ...onCall.toObject(), project: projectInfo });
      }
    }

    allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    allOnCalls.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    res.json({ events: allEvents, onCallSchedule: allOnCalls, projects });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const getPlanning = async (req, res) => {
  try {
    let planning = await Planning.findOne({ project: req.params.projectId })
      .populate('events.assignees', 'firstName lastName email avatar')
      .populate('onCallSchedule.user', 'firstName lastName email avatar');

    if (!planning) {
      planning = await Planning.create({
        project: req.params.projectId,
        events: [],
        onCallSchedule: [],
      });
    }

    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addEvent = async (req, res) => {
  try {
    const planning = await Planning.findOne({ project: req.params.projectId });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    planning.events.push(req.body);
    await planning.save();
    await planning.populate('events.assignees', 'firstName lastName email avatar');

    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const planning = await Planning.findOne({ project: req.params.projectId });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    const event = planning.events.id(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Événement non trouvé.' });

    Object.assign(event, req.body);
    await planning.save();
    await planning.populate('events.assignees', 'firstName lastName email avatar');

    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const planning = await Planning.findOne({ project: req.params.projectId });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    planning.events.pull(req.params.eventId);
    await planning.save();

    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addOnCall = async (req, res) => {
  try {
    const planning = await Planning.findOne({ project: req.params.projectId });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    planning.onCallSchedule.push(req.body);
    await planning.save();
    await planning.populate('onCallSchedule.user', 'firstName lastName email avatar');

    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateOnCall = async (req, res) => {
  try {
    const planning = await Planning.findOne({ project: req.params.projectId });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    const onCall = planning.onCallSchedule.id(req.params.onCallId);
    if (!onCall) return res.status(404).json({ message: 'Astreinte non trouvée.' });

    Object.assign(onCall, req.body);
    await planning.save();
    await planning.populate('onCallSchedule.user', 'firstName lastName email avatar');

    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteOnCall = async (req, res) => {
  try {
    const planning = await Planning.findOne({ project: req.params.projectId });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    planning.onCallSchedule.pull(req.params.onCallId);
    await planning.save();

    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
