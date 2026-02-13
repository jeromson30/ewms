import { Op } from 'sequelize';
import { Board, Column, Card, CardAssignee, CardLabel, User } from '../models/index.js';
import sequelize from '../config/db.js';

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const loadFullBoard = async (projectId) => {
  let board = await Board.findOne({
    where: { projectId },
    include: [{
      model: Column,
      as: 'columns',
      include: [{
        model: Card,
        as: 'cards',
        include: [
          { model: User, as: 'assignees', attributes: userAttributes, through: { attributes: [] } },
          { model: CardLabel, as: 'labels' },
        ],
        order: [['position', 'ASC']],
      }],
      order: [['position', 'ASC']],
    }],
    order: [
      [{ model: Column, as: 'columns' }, 'position', 'ASC'],
      [{ model: Column, as: 'columns' }, { model: Card, as: 'cards' }, 'position', 'ASC'],
    ],
  });

  return board;
};

const formatBoard = (board) => {
  const json = board.toJSON();
  if (json.columns) {
    json.columns = json.columns.map(col => ({
      ...col,
      cards: (col.cards || []).map(card => ({
        ...card,
        assignees: (card.assignees || []).map(a => ({ ...a, _id: a.id })),
        labels: (card.labels || []).map(l => ({ ...l, _id: l.id })),
      })),
    }));
  }
  return json;
};

export const getBoard = async (req, res) => {
  try {
    let board = await loadFullBoard(req.params.projectId);

    if (!board) {
      board = await Board.create({
        projectId: parseInt(req.params.projectId),
        name: 'Board principal',
      });

      const defaultColumns = [
        { title: 'À faire', position: 0, color: '#94a3b8' },
        { title: 'En cours', position: 1, color: '#3b82f6' },
        { title: 'En revue', position: 2, color: '#f59e0b' },
        { title: 'Terminé', position: 3, color: '#22c55e' },
      ];

      for (const col of defaultColumns) {
        await Column.create({ ...col, boardId: board.id });
      }

      board = await loadFullBoard(req.params.projectId);
    }

    res.json(formatBoard(board));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addColumn = async (req, res) => {
  try {
    const board = await Board.findOne({ where: { projectId: req.params.projectId } });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const { title, color } = req.body;
    const colCount = await Column.count({ where: { boardId: board.id } });

    await Column.create({
      boardId: board.id,
      title,
      color,
      position: colCount,
    });

    const fullBoard = await loadFullBoard(req.params.projectId);
    res.json(formatBoard(fullBoard));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateColumn = async (req, res) => {
  try {
    const board = await Board.findOne({ where: { projectId: req.params.projectId } });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const column = await Column.findOne({
      where: { id: req.params.columnId, boardId: board.id },
    });
    if (!column) return res.status(404).json({ message: 'Colonne non trouvée.' });

    await column.update(req.body);

    const fullBoard = await loadFullBoard(req.params.projectId);
    res.json(formatBoard(fullBoard));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteColumn = async (req, res) => {
  try {
    const board = await Board.findOne({ where: { projectId: req.params.projectId } });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    await Column.destroy({
      where: { id: req.params.columnId, boardId: board.id },
    });

    const fullBoard = await loadFullBoard(req.params.projectId);
    res.json(formatBoard(fullBoard));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const addCard = async (req, res) => {
  try {
    const board = await Board.findOne({ where: { projectId: req.params.projectId } });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const column = await Column.findOne({
      where: { id: req.params.columnId, boardId: board.id },
    });
    if (!column) return res.status(404).json({ message: 'Colonne non trouvée.' });

    const { title, description, assignees, labels, dueDate, priority } = req.body;
    const cardCount = await Card.count({ where: { columnId: column.id } });

    const card = await Card.create({
      columnId: column.id,
      title,
      description,
      dueDate,
      priority,
      position: cardCount,
    });

    if (assignees && assignees.length > 0) {
      await CardAssignee.bulkCreate(
        assignees.map(userId => ({ cardId: card.id, userId }))
      );
    }

    if (labels && labels.length > 0) {
      await CardLabel.bulkCreate(
        labels.map(l => ({ cardId: card.id, text: l.text, color: l.color }))
      );
    }

    const fullBoard = await loadFullBoard(req.params.projectId);
    res.json(formatBoard(fullBoard));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const board = await Board.findOne({ where: { projectId: req.params.projectId } });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const column = await Column.findOne({
      where: { id: req.params.columnId, boardId: board.id },
    });
    if (!column) return res.status(404).json({ message: 'Colonne non trouvée.' });

    const card = await Card.findOne({
      where: { id: req.params.cardId, columnId: column.id },
    });
    if (!card) return res.status(404).json({ message: 'Carte non trouvée.' });

    const { assignees, labels, ...cardData } = req.body;
    await card.update(cardData);

    if (assignees !== undefined) {
      await CardAssignee.destroy({ where: { cardId: card.id } });
      if (assignees.length > 0) {
        await CardAssignee.bulkCreate(
          assignees.map(userId => ({ cardId: card.id, userId }))
        );
      }
    }

    if (labels !== undefined) {
      await CardLabel.destroy({ where: { cardId: card.id } });
      if (labels.length > 0) {
        await CardLabel.bulkCreate(
          labels.map(l => ({ cardId: card.id, text: l.text, color: l.color }))
        );
      }
    }

    const fullBoard = await loadFullBoard(req.params.projectId);
    res.json(formatBoard(fullBoard));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const board = await Board.findOne({ where: { projectId: req.params.projectId } });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const column = await Column.findOne({
      where: { id: req.params.columnId, boardId: board.id },
    });
    if (!column) return res.status(404).json({ message: 'Colonne non trouvée.' });

    await Card.destroy({
      where: { id: req.params.cardId, columnId: column.id },
    });

    const fullBoard = await loadFullBoard(req.params.projectId);
    res.json(formatBoard(fullBoard));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const moveCard = async (req, res) => {
  try {
    const board = await Board.findOne({ where: { projectId: req.params.projectId } });
    if (!board) return res.status(404).json({ message: 'Board non trouvé.' });

    const { sourceColumnId, targetColumnId, cardId, targetPosition } = req.body;

    const sourceColumn = await Column.findOne({ where: { id: sourceColumnId, boardId: board.id } });
    const targetColumn = await Column.findOne({ where: { id: targetColumnId, boardId: board.id } });
    if (!sourceColumn || !targetColumn) {
      return res.status(404).json({ message: 'Colonne non trouvée.' });
    }

    const card = await Card.findOne({ where: { id: cardId, columnId: sourceColumn.id } });
    if (!card) return res.status(404).json({ message: 'Carte non trouvée.' });

    await sequelize.transaction(async (t) => {
      // Remove from source: shift positions down
      await Card.decrement('position', {
        where: {
          columnId: sourceColumn.id,
          position: { [Op.gt]: card.position },
        },
        transaction: t,
      });

      // Move card to target column
      await card.update({ columnId: targetColumn.id, position: targetPosition }, { transaction: t });

      // Make room in target: shift positions up
      await Card.increment('position', {
        where: {
          columnId: targetColumn.id,
          id: { [Op.ne]: card.id },
          position: { [Op.gte]: targetPosition },
        },
        transaction: t,
      });
    });

    const fullBoard = await loadFullBoard(req.params.projectId);
    res.json(formatBoard(fullBoard));
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
