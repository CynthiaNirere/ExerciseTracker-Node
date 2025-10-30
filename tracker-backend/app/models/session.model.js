import Sequelize from "sequelize";
import SequelizeInstance from "../config/sequelizeInstance.js";

const Session = SequelizeInstance.define("sessions", {
  id: {  
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: Sequelize.STRING(3000),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expirationDate: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'expirationDate'  // Keep camelCase if that's what's in DB
  },
  userId: {  
    type: Sequelize.INTEGER,
    allowNull: true,
    field: 'user_id'  // ← ADD THIS: Map to snake_case in database
  }
}, {
  timestamps: false,  
  tableName: 'sessions'
});

export default Session;