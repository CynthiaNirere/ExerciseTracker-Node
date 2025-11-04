import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const ExercisePlanItem = sequelize.define("ExercisePlanItem", {
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'exercise_plans',
        key: 'plan_id'
      }
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'exercises',
        key: 'exercise_id'
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
      defaultValue: '10'
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),  // NEW: Weight field
      allowNull: true,
      defaultValue: 0
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'exercise_plan_items',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

export default ExercisePlanItem;