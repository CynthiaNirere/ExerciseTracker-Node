import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const ExerciseResult = sequelize.define(
  "ExerciseResult",
  {
    id: {
      type: DataTypes.INTEGER,  // Changed from Sequelize.INTEGER
      primaryKey: true,
      autoIncrement: true,
      field: 'result_id'
    },
    athleteId: {
      type: DataTypes.INTEGER,  // Changed
      allowNull: false,
      field: 'athlete_id'
    },
    athletePlanId: {
      type: DataTypes.INTEGER,  // Changed
      allowNull: true,
      field: 'athlete_plan_id'
    },
    exerciseId: {
      type: DataTypes.INTEGER,  // Changed
      allowNull: true,
      field: 'exercise_id'
    },
    performedDate: {
      type: DataTypes.DATEONLY,  // Changed from Sequelize.DATEONLY
      allowNull: true,
      field: 'performed_date'
    },
    setsDone: {
      type: DataTypes.INTEGER,  // Changed
      allowNull: true,
      field: 'sets_done'
    },
    repsDone: {
      type: DataTypes.INTEGER,  // Changed
      allowNull: true,
      field: 'reps_done'
    },
    weightUsed: {
      type: DataTypes.DECIMAL(6, 2),  // Changed from Sequelize.DECIMAL
      allowNull: true,
      field: 'weight_used'
    },
    durationSeconds: {
      type: DataTypes.INTEGER,  // Changed
      allowNull: true,
      field: 'duration_seconds'
    },
    notes: {
      type: DataTypes.TEXT,  // Changed from Sequelize.TEXT
      allowNull: true
    }
  }, {
    tableName: 'exercise_results',
    timestamps: false,
    underscored: false
  }
);

export default ExerciseResult;