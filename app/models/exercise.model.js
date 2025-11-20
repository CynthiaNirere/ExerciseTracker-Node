import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const Exercise = sequelize.define("Exercise", {
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
    isStandard: {  // NEW FIELD
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'is_standard'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {  // NEW FIELD
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at'
    }
  }, {
    tableName: 'exercises',
    timestamps: false,
    underscored: false
  });

export default Exercise;