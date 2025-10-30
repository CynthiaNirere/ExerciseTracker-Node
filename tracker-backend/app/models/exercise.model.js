import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const Exercise = sequelize.define(
  "Exercise",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'exercise_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    muscleGroup: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'muscle_group'
    },
    equipmentNeeded: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'equipment_needed'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by'
    }
  },
  {
    tableName: "exercises",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

export default Exercise;