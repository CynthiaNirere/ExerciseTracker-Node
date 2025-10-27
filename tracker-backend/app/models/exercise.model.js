import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const Exercise = sequelize.define(
  "Exercise",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'exercise_id'  // Maps to exercise_id in database
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'exercise_name'  // Maps to exercise_name in database
    },
    category: {
      type: DataTypes.ENUM("Strength", "Cardio", "Plyometrics", "Flexibility", "Balance"),
      allowNull: false,
      defaultValue: "Strength",
    },
    muscleGroups: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'muscle_groups'  // Maps to muscle_groups in database
    },
    equipment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'required_equipment'  // Maps to required_equipment in database
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced"),
      allowNull: true,
      defaultValue: "Beginner",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "exercises",
    timestamps: false,
  }
);

export default Exercise;
