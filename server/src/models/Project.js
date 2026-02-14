import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'Le nom du projet est requis' } },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#6366f1',
  },
}, {
  timestamps: true,
});

export default Project;
