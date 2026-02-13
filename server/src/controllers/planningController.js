import { Planning, Event, EventAssignee, OnCall, Project, User } from '../models/index.js';

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];
const createdByAttributes = ['id', 'firstName', 'lastName', 'email'];

const loadPlanning = async (projectId) => {
  return Planning.findOne({
    where: { projectId },
    include: [
      {
        model: Event,
        as: 'events',
        include: [
          { model: User, as: 'assignees', attributes: userAttributes, through: { attributes: [] } },
          { model: User, as: 'createdBy', attributes: createdByAttributes },
        ],
      },
      {
        model: OnCall,
        as: 'onCallSchedule',
        include: [
          { model: User, as: 'user', attributes: userAttributes },
        ],
      },
    ],
    order: [
      [{ model: Event, as: 'events' }, 'startDate', 'ASC'],
      [{ model: OnCall, as: 'onCallSchedule' }, 'startDate', 'ASC'],
    ],
  });
};

const formatPlanning = (planning) => {
  const json = planning.toJSON();
  if (json.events) {
    json.events = json.events.map(e => ({
      ...e,
      assignees: (e.assignees || []).map(a => ({ ...a, _id: a.id })),
      createdBy: e.createdBy ? { ...e.createdBy, _id: e.createdBy.id } : null,
    }));
  }
  if (json.onCallSchedule) {
    json.onCallSchedule = json.onCallSchedule.map(o => ({
      ...o,
      user: o.user ? { ...o.user, _id: o.user.id } : null,
    }));
  }
  return json;
};

export const getGlobalPlanning = async (req, res) => {
  try {
    const projects = await Project.findAll({
      attributes: ['id', 'name', 'color'],
    });

    const projectIds = projects.map(p => p.id);

    const plannings = await Planning.findAll({
      where: { projectId: projectIds },
      include: [
        { model: Project, attributes: ['id', 'name', 'color'] },
        {
          model: Event,
          as: 'events',
          include: [
            { model: User, as: 'assignees', attributes: userAttributes, through: { attributes: [] } },
            { model: User, as: 'createdBy', attributes: createdByAttributes },
          ],
        },
        {
          model: OnCall,
          as: 'onCallSchedule',
          include: [
            { model: User, as: 'user', attributes: userAttributes },
          ],
        },
      ],
    });

    const allEvents = [];
    const allOnCalls = [];

    for (const planning of plannings) {
      const projectInfo = {
        _id: planning.Project.id,
        name: planning.Project.name,
        color: planning.Project.color,
      };

      for (const event of planning.events || []) {
        const eventJson = event.toJSON();
        eventJson.assignees = (eventJson.assignees || []).map(a => ({ ...a, _id: a.id }));
        eventJson.createdBy = eventJson.createdBy ? { ...eventJson.createdBy, _id: eventJson.createdBy.id } : null;
        allEvents.push({ ...eventJson, project: projectInfo });
      }

      for (const onCall of planning.onCallSchedule || []) {
        const onCallJson = onCall.toJSON();
        onCallJson.user = onCallJson.user ? { ...onCallJson.user, _id: onCallJson.user.id } : null;
        allOnCalls.push({ ...onCallJson, project: projectInfo });
      }
    }

    allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    allOnCalls.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const formattedProjects = projects.map(p => ({ ...p.toJSON() }));

    res.json({ events: allEvents, onCallSchedule: allOnCalls, projects: formattedProjects });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const getPlanning = async (req, res) => {
  try {
    let planning = await loadPlanning(req.params.projectId);

    if (!planning) {
      planning = await Planning.create({
        projectId: parseInt(req.params.projectId),
      });
      planning = await loadPlanning(req.params.projectId);
    }

    res.json(formatPlanning(planning));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addEvent = async (req, res) => {
  try {
    const planning = await Planning.findOne({ where: { projectId: req.params.projectId } });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    const { assignees, ...eventData } = req.body;
    const event = await Event.create({
      ...eventData,
      planningId: planning.id,
      createdById: req.user.id,
    });

    if (assignees && assignees.length > 0) {
      await EventAssignee.bulkCreate(
        assignees.map(userId => ({ eventId: event.id, userId }))
      );
    }

    const fullPlanning = await loadPlanning(req.params.projectId);
    res.json(formatPlanning(fullPlanning));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const planning = await Planning.findOne({ where: { projectId: req.params.projectId } });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    const event = await Event.findOne({
      where: { id: req.params.eventId, planningId: planning.id },
    });
    if (!event) return res.status(404).json({ message: 'Événement non trouvé.' });

    const isCreator = event.createdById === req.user.id;
    const isAdminOrManager = req.user.role === 'admin' || req.user.role === 'manager';
    if (!isCreator && !isAdminOrManager) {
      return res.status(403).json({ message: 'Vous n\'avez pas les droits pour modifier cet événement.' });
    }

    const { createdBy, createdById: _cb, assignees, ...updates } = req.body;
    await event.update(updates);

    if (assignees !== undefined) {
      await EventAssignee.destroy({ where: { eventId: event.id } });
      if (assignees.length > 0) {
        await EventAssignee.bulkCreate(
          assignees.map(userId => ({ eventId: event.id, userId }))
        );
      }
    }

    const fullPlanning = await loadPlanning(req.params.projectId);
    res.json(formatPlanning(fullPlanning));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const planning = await Planning.findOne({ where: { projectId: req.params.projectId } });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    const event = await Event.findOne({
      where: { id: req.params.eventId, planningId: planning.id },
    });
    if (!event) return res.status(404).json({ message: 'Événement non trouvé.' });

    const isCreator = event.createdById === req.user.id;
    const isAdminOrManager = req.user.role === 'admin' || req.user.role === 'manager';
    if (!isCreator && !isAdminOrManager) {
      return res.status(403).json({ message: 'Vous n\'avez pas les droits pour supprimer cet événement.' });
    }

    await event.destroy();

    const fullPlanning = await loadPlanning(req.params.projectId);
    res.json(formatPlanning(fullPlanning));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addOnCall = async (req, res) => {
  try {
    const planning = await Planning.findOne({ where: { projectId: req.params.projectId } });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    const { user: userId, ...onCallData } = req.body;
    await OnCall.create({
      ...onCallData,
      userId: userId || req.body.userId,
      planningId: planning.id,
    });

    const fullPlanning = await loadPlanning(req.params.projectId);
    res.json(formatPlanning(fullPlanning));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateOnCall = async (req, res) => {
  try {
    const planning = await Planning.findOne({ where: { projectId: req.params.projectId } });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    const onCall = await OnCall.findOne({
      where: { id: req.params.onCallId, planningId: planning.id },
    });
    if (!onCall) return res.status(404).json({ message: 'Astreinte non trouvée.' });

    const { user: userId, ...updates } = req.body;
    if (userId) updates.userId = userId;
    await onCall.update(updates);

    const fullPlanning = await loadPlanning(req.params.projectId);
    res.json(formatPlanning(fullPlanning));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteOnCall = async (req, res) => {
  try {
    const planning = await Planning.findOne({ where: { projectId: req.params.projectId } });
    if (!planning) return res.status(404).json({ message: 'Planning non trouvé.' });

    const onCall = await OnCall.findOne({
      where: { id: req.params.onCallId, planningId: planning.id },
    });
    if (!onCall) return res.status(404).json({ message: 'Astreinte non trouvée.' });

    await onCall.destroy();

    const fullPlanning = await loadPlanning(req.params.projectId);
    res.json(formatPlanning(fullPlanning));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
