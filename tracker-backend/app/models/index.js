import dbConfig from "../config/db.config.js";
import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

// Models
import User from "./user.model.js";
import Session from "./session.model.js";
import Tutorial from "./tutorial.model.js";
import Lesson from "./lesson.model.js";

// Initialize db object
const db = {
  Sequelize: Sequelize,
  sequelize: sequelize, // use the imported instance
  user: User,
  session: Session,
  tutorial: Tutorial,
  lesson: Lesson,
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

// Export db
export default db;
