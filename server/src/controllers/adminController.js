import User from '../models/User.js';
import Board from '../models/Board.js';

export const getUsersWithStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs et managers.' });
    }

    const users = await User.find().select('firstName lastName email role avatar createdAt');

    const boards = await Board.find();

    const statsMap = {};
    for (const user of users) {
      statsMap[user._id.toString()] = { assigned: 0, completed: 0 };
    }

    for (const board of boards) {
      const doneColumns = board.columns.filter(col =>
        col.title.toLowerCase().includes('terminé') || col.title.toLowerCase().includes('done')
      );
      const doneColumnIds = new Set(doneColumns.map(c => c._id.toString()));

      for (const column of board.columns) {
        const isDone = doneColumnIds.has(column._id.toString());
        for (const card of column.cards) {
          for (const assigneeId of card.assignees) {
            const key = assigneeId.toString();
            if (statsMap[key]) {
              statsMap[key].assigned++;
              if (isDone) {
                statsMap[key].completed++;
              }
            }
          }
        }
      }
    }

    const result = users.map(u => ({
      ...u.toObject(),
      stats: statsMap[u._id.toString()] || { assigned: 0, completed: 0 },
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs et managers.' });
    }

    const { firstName, lastName, email, role } = req.body;

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    if (req.user.role === 'manager' && (targetUser.role === 'admin' || role === 'admin')) {
      return res.status(403).json({ message: 'Un manager ne peut pas modifier un administrateur.' });
    }

    if (email && email !== targetUser.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }
    }

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (role && ['admin', 'manager', 'member'].includes(role)) updates.role = role;

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('firstName lastName email role avatar createdAt');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
