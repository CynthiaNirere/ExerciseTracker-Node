import User from "./user.model.js";
import AthleteProfile from "./athleteProfile.model.js";
import Coach from "./coach.model.js";
import Exercise from "./exercise.model.js";
import ExerciseResult from "./exerciseResult.model.js";
import Goal from "./goal.model.js";
import ExercisePlan from "./exercisePlan.model.js";
import ExercisePlanItem from "./exercisePlanItem.model.js";
import AthletePlan from "./athletePlan.model.js";
import Session from "./session.model.js";
import sequelize from "../config/sequelizeInstance.js";
import { Sequelize } from "sequelize";

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.user = User;
db.athleteProfile = AthleteProfile;
db.coach = Coach;
db.exercise = Exercise;
db.exerciseResult = ExerciseResult;
db.goal = Goal;
db.exercisePlan = ExercisePlan;
db.exercisePlanItem = ExercisePlanItem;
db.session = Session;
db.athletePlan = AthletePlan;



// User <-> AthleteProfile (One-to-One)
User.hasOne(AthleteProfile, {
  foreignKey: 'athleteId',  
  as: 'athleteProfile'
});
AthleteProfile.belongsTo(User, {
  foreignKey: 'athleteId',  
  as: 'user'
});

// User <-> Coach (One-to-One)
User.hasOne(Coach, {
  foreignKey: 'coachId',  
  as: 'coachProfile'
});
Coach.belongsTo(User, {
  foreignKey: 'coachId',  
  as: 'user'
});

// User <-> Goal (One-to-Many)
User.hasMany(Goal, {
  foreignKey: 'athleteId',  
  as: 'goals'
});
Goal.belongsTo(User, {
  foreignKey: 'athleteId',  
  as: 'athlete'
});

// User <-> ExerciseResult (One-to-Many)
User.hasMany(ExerciseResult, {
  foreignKey: 'athleteId',  
  as: 'exerciseResults'
});
ExerciseResult.belongsTo(User, {
  foreignKey: 'athleteId',  
  as: 'athlete'
});

// Exercise <-> ExerciseResult (One-to-Many)
Exercise.hasMany(ExerciseResult, {
  foreignKey: 'exerciseId',  
  as: 'results'
});
ExerciseResult.belongsTo(Exercise, {
  foreignKey: 'exerciseId',  
  as: 'exercise'
});

// ExercisePlan <-> Exercise (Many-to-Many through ExercisePlanItem)
ExercisePlan.belongsToMany(Exercise, {
  through: ExercisePlanItem,
  foreignKey: 'planId',  
  otherKey: 'exerciseId',  
  as: 'exercises'
});
Exercise.belongsToMany(ExercisePlan, {
  through: ExercisePlanItem,
  foreignKey: 'exerciseId',  
  otherKey: 'planId',  
  as: 'plans'
});

// AthletePlan associations
AthletePlan.belongsTo(User, {
  foreignKey: 'athleteId',
  as: 'athlete'
});
AthletePlan.belongsTo(ExercisePlan, {
  foreignKey: 'planId',
  as: 'plan'
});
ExercisePlan.hasMany(AthletePlan, {
  foreignKey: 'planId',
  as: 'assignments'
});
User.hasMany(AthletePlan, {
  foreignKey: 'athleteId',
  as: 'assignedPlans'
});

export default db;