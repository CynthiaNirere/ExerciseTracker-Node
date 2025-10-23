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
  userId: {  // ADD THIS FIELD
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'user_id'  // Maps to user_id in database
  },
  expirationDate: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'expiration_date'
  },
}, {
  tableName: "sessions",
  timestamps: false
});

export default Session;