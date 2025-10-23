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
  },
  userId: {  
    type: Sequelize.INTEGER,
    allowNull: true,
  }
 
}, {

  timestamps: false,  
  tableName: 'sessions'
});

export default Session;