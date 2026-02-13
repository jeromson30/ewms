import { User } from '../models/index.js';
import { generateToken } from '../utils/token.js';

const formatUser = (user) => ({
  id: user.id,
  _id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const user = await User.scope('withPassword').create({ firstName, lastName, email, password });
    const token = generateToken(user.id);

    res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = generateToken(user.id);

    res.json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

export const getUsers = async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'avatar'],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
