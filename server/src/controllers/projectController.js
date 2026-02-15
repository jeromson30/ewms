import { Project, ProjectMember, User } from '../models/index.js';
import { toPlainWithIds } from '../utils/serialize.js';

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const formatProject = (project) => {
  const json = toPlainWithIds(project);
  if (json.members) {
    json.members = json.members.map(m => ({
      _id: m.id || m._id,
      user: m.user || m.userId,
      role: m.role,
    }));
  }
  return json;
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: User, as: 'owner', attributes: userAttributes },
        {
          model: ProjectMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
        },
      ],
    });

    res.json(projects.map(formatProject));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    if (req.user.role === 'member') {
      return res.status(403).json({ message: 'Seuls les administrateurs et managers peuvent créer un projet.' });
    }

    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      ownerId: req.user.id,
    });

    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: 'admin',
    });

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: userAttributes },
        {
          model: ProjectMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
        },
      ],
    });

    res.status(201).json(formatProject(fullProject));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }

    await project.update(req.body);

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: userAttributes },
        {
          model: ProjectMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
        },
      ],
    });

    res.json(formatProject(fullProject));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: ProjectMember, as: 'members' }],
    });

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }

    const isOwner = project.ownerId === req.user.id;
    const member = project.members.find(m => m.userId === req.user.id);
    const isAdminOrManager = (member && member.role === 'admin') || req.user.role === 'admin' || req.user.role === 'manager';

    if (!isOwner && !isAdminOrManager) {
      return res.status(403).json({ message: "Seuls les administrateurs et managers peuvent supprimer un projet." });
    }

    await project.destroy();
    res.json({ message: 'Projet supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }

    const existing = await ProjectMember.findOne({
      where: { projectId: project.id, userId },
    });
    if (existing) {
      return res.status(400).json({ message: 'Utilisateur déjà membre du projet.' });
    }

    await ProjectMember.create({
      projectId: project.id,
      userId,
      role: role || 'member',
    });

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: userAttributes },
        {
          model: ProjectMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
        },
      ],
    });

    res.json(formatProject(fullProject));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }

    if (parseInt(userId) === project.ownerId) {
      return res.status(400).json({ message: 'Impossible de retirer le propriétaire du projet.' });
    }

    const member = await ProjectMember.findOne({
      where: { projectId: project.id, userId },
    });
    if (!member) {
      return res.status(404).json({ message: 'Membre non trouvé.' });
    }

    await member.destroy();

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: userAttributes },
        {
          model: ProjectMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
        },
      ],
    });

    res.json(formatProject(fullProject));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
