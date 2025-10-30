import Sequelize from "sequelize";
import SequelizeInstance from "../config/sequelizeInstance.js";

const Coach = SequelizeInstance.define("coach", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  specialty: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  bio: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  certifications: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});

export default Coach;