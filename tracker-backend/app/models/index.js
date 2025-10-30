import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

// Import models
import User from "./user.model.js";
import Session from "./session.model.js";
import AthleteProfile from "./athleteProfile.model.js";
import Exercise from "./exercise.model.js";
import ExerciseResult from "./exerciseResult.model.js";
import Goal from "./goal.model.js";

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Register models
db.user = User;
db.session = Session;
db.athleteProfile = AthleteProfile;
db.exercise = Exercise;
db.exerciseResult = ExerciseResult;
db.goal = Goal;

// ========================================
// Define associations
// ========================================

// User ↔ AthleteProfile (One-to-One)
User.hasOne(AthleteProfile, {
  foreignKey: 'athlete_id', // Use snake_case to match database
  as: 'athleteProfile'
});
AthleteProfile.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'user'
});

// User ↔ Goals (One-to-Many)
User.hasMany(Goal, {
  foreignKey: 'athlete_id', // Use snake_case to match database
  as: 'goals'
});
Goal.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'athlete'
});

// Exercise ↔ ExerciseResults (One-to-Many)
Exercise.hasMany(ExerciseResult, {
  foreignKey: 'exercise_id', // Use snake_case to match database
  as: 'results'
});
ExerciseResult.belongsTo(Exercise, {
  foreignKey: 'exercise_id',
  as: 'exercise'
});

// User ↔ ExerciseResults (One-to-Many)
User.hasMany(ExerciseResult, {
  foreignKey: 'athlete_id', // Use snake_case to match database
  as: 'exerciseResults'
});
ExerciseResult.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'athlete'
});

// User ↔ Exercise (Creator)
User.hasMany(Exercise, {
  foreignKey: 'created_by', // Use snake_case to match database
  as: 'createdExercises'
});
Exercise.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

export default db;