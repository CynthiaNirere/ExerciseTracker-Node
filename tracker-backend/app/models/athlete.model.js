import Sequelize from "sequelize";
import SequelizeInstance from "../config/sequelizeInstance.js";

const Athlete = SequelizeInstance.define("athlete", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  dateOfBirth: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  height: {
    type: Sequelize.DECIMAL(5, 2),
    allowNull: true,
  },
  weight: {
    type: Sequelize.DECIMAL(5, 2),
    allowNull: true,
  },
  sport: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  position: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  emergencyContact: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  emergencyPhone: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

export default Athlete;