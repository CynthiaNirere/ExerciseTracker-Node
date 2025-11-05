import Sequelize from "sequelize";
import SequelizeInstance from "../config/sequelizeInstance.js";

const User = SequelizeInstance.define("users", {
  user_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password_hash: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  role: {
    type: Sequelize.ENUM('admin', 'coach', 'athlete'),
    defaultValue: 'athlete',
    allowNull: false,
  },
  age: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  height: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  weight: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  bio: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  training_goals: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  injuries: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: false,  
  tableName: 'users'
});

export default User;