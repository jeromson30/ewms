import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Column = sequelize.define('Column', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  boardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#94a3b8',
  },
}, {
  timestamps: false,
});

export default Column;
