import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: { msg: 'Le prénom est requis' } },
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: { msg: 'Le nom est requis' } },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 255] },
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'member'),
    defaultValue: 'member',
  },
}, {
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
  scopes: {
    withPassword: {
      attributes: {},
    },
  },
});

User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  values._id = values.id;
  return values;
};

export default User;
