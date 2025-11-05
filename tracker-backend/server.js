import routes from "./app/routes/index.js";
import express, { json, urlencoded } from "express"
import cors from "cors";
import db from "./app/models/index.js";

db.sequelize.sync();
const app = express();

// CORS configuration - allow frontend to access backend
var corsOptions = {
  origin: "http://localhost:8081",  // Your frontend URL
  credentials: true
}
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// ROOT ROUTE - shows API is working
app.get("/", (req, res) => {
  res.json({ 
    message: "Exercise Tracker API is running!",
    version: "1.0.0",
    endpoints: {
      api: "/tracker-t1",
      test: "/tracker-t1/test"
    }
  });
});

// Load the routes from the routes folder
// This makes all your routes accessible at: http://localhost:3021/tracker-t1/*
app.use("/tracker-t1", routes); 

// set port, listen for requests
const PORT = process.env.PORT || 3021;
const PORT = process.env.PORT || 3021;
if (process.env.NODE_ENV !== "test") {

  db.sequelize.sync({ alter: true })
    .then(() => {
      console.log("✅ Database synced - plans tables created");
    })
    .catch(err => {
      console.error("❌ Error syncing database:", err);
    });
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);  // ✓ Fixed
  });
}

export default app;