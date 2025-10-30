import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
// Import models
import User from "./user.model.js";
import Session from "./session.model.js";
import Exercise from "./exercise.model.js";
import ExercisePlan from "./exercisePlan.model.js";
import ExercisePlanItem from "./exercisePlanItem.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Register models (lowercase to match auth.controller)
db.user = User;
db.session = Session;
db.exercise = Exercise;
db.exercisePlan = ExercisePlan;
db.exercisePlanItem = ExercisePlanItem;

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;