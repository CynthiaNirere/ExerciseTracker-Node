import dbConfig from "../config/db.config.js";
import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

// Models
import User from "./user.model.js";
import Session from "./session.model.js";
import Tutorial from "./tutorial.model.js";
import Lesson from "./lesson.model.js";
import exerciseModel from "./exercise.model.js";
import planModel from "./plan.model.js";
import planExerciseModel from "./plan_exercise.model.js";
import goalModel from "./goal.model.js";  // ADD THIS

// Initialize db object
const db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  users: User,
  user: User,
  session: Session,
  tutorial: Tutorial,
  lesson: Lesson,
  exercises: exerciseModel(sequelize, Sequelize),
  exercise: exerciseModel(sequelize, Sequelize),
  plan: planModel(sequelize, Sequelize),
  planExercise: planExerciseModel(sequelize, Sequelize),
  goals: goalModel(sequelize, Sequelize),  // ADD THIS
  goal: goalModel(sequelize, Sequelize),   // ADD THIS
};

// Define relationships
db.user.hasMany(db.session, {
  foreignKey: "userId",
  sourceKey: "user_id",
});

db.session.belongsTo(db.user, {
  foreignKey: "userId",
  targetKey: "user_id",
});

// Plan relationships
db.plan.belongsToMany(db.exercise, {
  through: db.planExercise,
  foreignKey: 'plan_id',
  otherKey: 'exercise_id'
});

db.exercise.belongsToMany(db.plan, {
  through: db.planExercise,
  foreignKey: 'exercise_id',
  otherKey: 'plan_id'
});

// Goal relationships - ADD THIS
db.user.hasMany(db.goal, {
  foreignKey: 'user_id',
  sourceKey: 'user_id'
});

db.goal.belongsTo(db.user, {
  foreignKey: 'user_id',
  targetKey: 'user_id'
});

// Export db
export default db;