import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CardAssignee = sequelize.define('CardAssignee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
});

export default CardAssignee;
