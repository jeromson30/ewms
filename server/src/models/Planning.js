import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Planning = sequelize.define('Planning', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
});

export default Planning;
