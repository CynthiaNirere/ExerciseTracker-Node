import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
// Import models
import User from "./user.model.js";
import Session from "./session.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Register models (lowercase to match auth.controller)
db.user = User;
db.session = Session;

export default db;