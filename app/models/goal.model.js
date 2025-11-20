import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const Goal = sequelize.define(
  "Goal",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'goal_id'
    },
    athleteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'athlete_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    targetValue: {
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
      field: 'target_value'
    },
    currentValue: {
      type: DataTypes.DECIMAL(9, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'current_value'
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      allowNull: true,
      defaultValue: 'active'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date'
    },
    createdAt: {  // NEW FIELD
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_at'
    },
    updatedAt: {  // NEW FIELD
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at'
    }
  },
  {
    tableName: "goals",
    timestamps: false
  }
);

export default Goal;