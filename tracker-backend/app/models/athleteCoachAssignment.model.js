import Sequelize from "sequelize";
import SequelizeInstance from "../config/sequelizeInstance.js";

const AthleteCoachAssignment = SequelizeInstance.define("athleteCoachAssignment", {
  athleteId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  coachId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  assignedDate: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('active', 'inactive', 'pending'),
    allowNull: false,
    defaultValue: 'active',
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});

export default AthleteCoachAssignment;