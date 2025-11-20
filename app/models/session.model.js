import Sequelize from "sequelize";
import SequelizeInstance from "../config/sequelizeInstance.js";

const Session = SequelizeInstance.define("sessions", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'session_id'  // CRITICAL FIX: Maps to session_id in database
  },
  token: {
    type: Sequelize.STRING(3000),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'user_id'  // Maps to user_id in database
  },
  expirationDate: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'expiration_date'  // Maps to expiration_date in database
  },
}, {
  tableName: "sessions",
  timestamps: false  // No createdAt/updatedAt
});

export default Session;