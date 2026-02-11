import Planning from '../models/Planning.js';

export const getPlanning = async (req, res) => {
  try {
    let planning = await Planning.findOne({ project: req.params.projectId })
      .populate('events.assignees', 'name email avatar')
      .populate('onCallSchedule.user', 'name email avatar');

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
    await planning.populate('events.assignees', 'name email avatar');

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
    await planning.populate('events.assignees', 'name email avatar');

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
    await planning.populate('onCallSchedule.user', 'name email avatar');

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
    await planning.populate('onCallSchedule.user', 'name email avatar');

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
