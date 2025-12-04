import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const ExerciseResult = sequelize.define(
  "ExerciseResult",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'result_id'
    },
    athleteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'athlete_id'
    },
    athletePlanId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'athlete_plan_id'
    },
    goalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goal_id',
      references: {
        model: 'goals',
        key: 'goal_id'
      }
    },
    exerciseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'exercise_id'
    },
    performedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'performed_date'
    },
    setsDone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sets_done'
    },
    repsDone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reps_done'
    },
    weightUsed: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      field: 'weight_used'
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'duration_seconds'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'exercise_results',
    timestamps: false,
    underscored: false
  }
);

export default ExerciseResult;