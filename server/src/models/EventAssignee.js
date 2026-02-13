import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const EventAssignee = sequelize.define('EventAssignee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  eventId: {
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

export default EventAssignee;
