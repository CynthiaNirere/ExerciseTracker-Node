import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const Exercise = sequelize.define("Exercise", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'exercise_id'  // ✓ Maps 'id' to 'exercise_id' in DB
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    muscleGroup: {  // ✓ Use camelCase in model
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'muscle_group'  // ✓ Maps to snake_case in DB
    },
    equipmentNeeded: {  // ✓ Use camelCase in model
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'equipment_needed'  // ✓ Maps to snake_case in DB
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'exercises',
    timestamps: false,
    underscored: false  // ✓ Set to false since we're manually mapping
  });

export default Exercise;