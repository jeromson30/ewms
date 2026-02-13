import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CardLabel = sequelize.define('CardLabel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#6366f1',
  },
}, {
  timestamps: false,
});

export default CardLabel;
