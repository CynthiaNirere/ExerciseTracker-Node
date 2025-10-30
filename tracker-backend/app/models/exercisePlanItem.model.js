import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const ExercisePlanItem = sequelize.define("ExercisePlanItem", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id'
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exercise_plans',
        key: 'plan_id'
      }
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exercises',
        key: 'exercise_id'
      }
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 7
      }
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    reps: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '8-12'
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'exercise_plan_items',
    timestamps: false,
    underscored: true
  });

export default ExercisePlanItem;
