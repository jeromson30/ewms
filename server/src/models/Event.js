import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  planningId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  allDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  type: {
    type: DataTypes.ENUM('meeting', 'deadline', 'milestone', 'oncall', 'other'),
    defaultValue: 'other',
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#6366f1',
  },
}, {
  timestamps: true,
});

export default Event;
