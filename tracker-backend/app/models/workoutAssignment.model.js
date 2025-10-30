import Sequelize from "sequelize";
import SequelizeInstance from "../config/sequelizeInstance.js";

const WorkoutAssignment = SequelizeInstance.define("workoutAssignment", {
  athleteId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  coachId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  workoutName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  workoutDescription: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  scheduledDate: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  dueDate: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM('assigned', 'in_progress', 'completed', 'missed'),
    allowNull: false,
    defaultValue: 'assigned',
  },
  priority: {
    type: Sequelize.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium',
  },
});

export default WorkoutAssignment;