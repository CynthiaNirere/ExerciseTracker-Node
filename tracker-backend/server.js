import routes from "./app/routes/index.js";
import express, { json, urlencoded } from "express"
import cors from "cors";

import db from "./app/models/index.js";


db.sequelize
  .authenticate()
  .then(() => {
    console.log(' Database connection established successfully.');
  })
  .catch(err => {
    console.error(' Unable to connect to the database:', err);
  });

const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
  credentials: true
}
app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  
app.use("/tracker-t1", routes); 


// set port, listen for requests
const PORT = process.env.PORT || 3100;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

export default app;