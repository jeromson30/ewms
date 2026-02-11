import Board from '../models/Board.js';

export const getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId })
      .populate('columns.cards.assignees', 'name email avatar');

    if (!board) {
      const newBoard = await Board.create({
        project: req.params.projectId,
        name: 'Board principal',
        columns: [
          { title: 'À faire', position: 0, color: '#94a3b8', cards: [] },
          { title: 'En cours', position: 1, color: '#3b82f6', cards: [] },
          { title: 'En revue', position: 2, color: '#f59e0b', cards: [] },
          { title: 'Terminé', position: 3, color: '#22c55e', cards: [] },
        ],
      });
      return res.json(newBoard);
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addColumn = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const { title, color } = req.body;
    board.columns.push({ title, color, position: board.columns.length, cards: [] });
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateColumn = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const column = board.columns.id(req.params.columnId);
    if (!column) return res.status(404).json({ message: 'Colonne non trouvée.' });

    Object.assign(column, req.body);
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteColumn = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    board.columns.pull(req.params.columnId);
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addCard = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const column = board.columns.id(req.params.columnId);
    if (!column) return res.status(404).json({ message: 'Colonne non trouvée.' });

    const { title, description, assignees, labels, dueDate, priority } = req.body;
    column.cards.push({
      title,
      description,
      assignees,
      labels,
      dueDate,
      priority,
      position: column.cards.length,
    });
    await board.save();

    await board.populate('columns.cards.assignees', 'name email avatar');
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const column = board.columns.id(req.params.columnId);
    if (!column) return res.status(404).json({ message: 'Colonne non trouvée.' });

    const card = column.cards.id(req.params.cardId);
    if (!card) return res.status(404).json({ message: 'Carte non trouvée.' });

    Object.assign(card, req.body);
    await board.save();

    await board.populate('columns.cards.assignees', 'name email avatar');
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const column = board.columns.id(req.params.columnId);
    if (!column) return res.status(404).json({ message: 'Colonne non trouvée.' });

    column.cards.pull(req.params.cardId);
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const moveCard = async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const { sourceColumnId, targetColumnId, cardId, targetPosition } = req.body;

    const sourceColumn = board.columns.id(sourceColumnId);
    const targetColumn = board.columns.id(targetColumnId);
    if (!sourceColumn || !targetColumn) {
      return res.status(404).json({ message: 'Colonne non trouvée.' });
    }

    const card = sourceColumn.cards.id(cardId);
    if (!card) return res.status(404).json({ message: 'Carte non trouvée.' });

    const cardData = card.toObject();
    sourceColumn.cards.pull(cardId);

    targetColumn.cards.splice(targetPosition, 0, cardData);
    targetColumn.cards.forEach((c, i) => { c.position = i; });

    await board.save();
    await board.populate('columns.cards.assignees', 'name email avatar');

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
