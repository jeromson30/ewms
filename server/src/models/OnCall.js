import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OnCall = sequelize.define('OnCall', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  planningId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('primary', 'secondary', 'backup'),
    defaultValue: 'primary',
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  timestamps: false,
});

OnCall.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

export default OnCall;
