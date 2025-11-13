import db from "../models/index.js";
import authconfig from "../config/auth.config.js";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import jwt from "jsonwebtoken";

const User = db.user;
const Session = db.session;
const Op = db.Sequelize.Op;

let googleUser = {};

const google_id = process.env.CLIENT_ID;
const google_secret = process.env.CLIENT_SECRET;

const exports = {};

exports.login = async (req, res) => {
  console.log("=== LOGIN REQUEST ===");
  var googleToken = req.body.credential;

  const client = new OAuth2Client(google_id);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: google_id,
    });
    googleUser = ticket.getPayload();
    console.log("Google payload is " + JSON.stringify(googleUser));
  }
  await verify().catch(console.error);

  let email = googleUser.email;
  let firstName = googleUser.given_name;
  let lastName = googleUser.family_name;

  // if we don't have their email or name, we need to make another request
  // this is solely for testing purposes
  if (
    (email === undefined ||
      firstName === undefined ||
      lastName === undefined) &&
    req.body.accessToken !== undefined
  ) {
    let oauth2Client = new OAuth2Client(google_id);
    oauth2Client.setCredentials({ access_token: req.body.accessToken });
    let oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });
    let { data } = await oauth2.userinfo.get();
    console.log(data);
    email = data.email;
    firstName = data.given_name;
    lastName = data.family_name;
  }

  let user = {};
  let session = {};

  await User.findOne({
    where: {
      email: email,
    },
  })
    .then((data) => {
      if (data != null) {
        user = data.dataValues;
        console.log("Found existing user:", user);
      } else {
        // create a new User and save to database
        user = {
          fName: firstName,
          lName: lastName,
          email: email,
          role: email.endsWith("@eagles.oc.edu") ? "athlete" : "coach",
        };
        console.log("Creating new user:", user);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
      return; // FIXED: Added return to prevent further execution
    });

  // this lets us get the user id
  if (user.id === undefined) {
    await User.create(user)
      .then((data) => {
        user = data.dataValues;
        console.log("User was registered successfully!");
        // FIXED: Removed the response here - we need to continue to create session
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
        return;
      });
  } else {
    // doing this to ensure that the user's name is the one listed with Google
    user.fName = firstName;
    user.lName = lastName;

    await User.update(user, { where: { id: user.id } })
      .then((num) => {
        if (num == 1) {
          console.log("updated user's name");
        } else {
          console.log(
            `Cannot update User with id=${user.id}. Maybe User was not found or req.body is empty!`
          );
        }
      })
      .catch((err) => {
        console.log("Error updating User with id=" + user.id + " " + err);
      });
  }

  // try to find session first
  await Session.findOne({
    where: {
      email: email,
      token: { [Op.ne]: "" },
    },
  })
    .then(async (data) => {
      if (data !== null) {
        session = data.dataValues;
        if (session.expirationDate < Date.now()) {
          session.token = "";
          // clear session's token if it's expired
          await Session.update(session, { where: { id: session.id } })
            .then((num) => {
              if (num == 1) {
                console.log("successfully logged out expired session");
              } else {
                console.log("failed to clear expired session");
              }
            })
            .catch((err) => {
              console.log(err);
            });
          //reset session to be null since we need to make another one
          session = {};
        } else {
          // if the session is still valid, then send info to the front end
          let userInfo = {
            email: user.email,
            fName: user.fName,
            lName: user.lName,
            userId: user.id,
            role: user.role,
            token: session.token
          };
          console.log("Found existing session - returning user:", userInfo);
          res.send(userInfo);
        }
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving sessions.",
      });
      return; // FIXED: Added return to prevent further execution
    });

  if (session.id === undefined) {
    // create a new Session with an expiration date and save to database
    let token = jwt.sign({ id: email }, authconfig.secret, {
      expiresIn: 86400,
    });
    let tempExpirationDate = new Date();
    tempExpirationDate.setDate(tempExpirationDate.getDate() + 1);
    const newSession = { // FIXED: Changed variable name to avoid conflict
      token: token,
      email: email,
      userId: user.id,
      expirationDate: tempExpirationDate,
    };

    console.log("making a new session");
    console.log(newSession);

    await Session.create(newSession)
      .then(() => {
        let userInfo = {
          email: user.email,
          fName: user.fName,
          lName: user.lName,
          userId: user.id,
          role: user.role,
          token: token
        };
        console.log("New session - returning user:", userInfo);
        res.send(userInfo);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};

exports.logout = async (req, res) => {
  console.log("=== LOGOUT REQUEST ===");
  console.log(req.body);
  
  // Check if request body is null or empty
  if (!req.body || !req.body.token) {
    return res.send({
      message: "User has already been successfully logged out!",
    });
  }

  let session = {};

  try {
    const data = await Session.findAll({ where: { token: req.body.token } });
    if (data[0] !== undefined) {
      session = data[0].dataValues;
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while retrieving sessions.",
    });
  }

  // If session doesn't exist, user is already logged out
  if (session.id === undefined) {
    console.log("already logged out");
    return res.send({
      message: "User has already been successfully logged out!",
    });
  }

  // Clear the session token
  session.token = "";

  try {
    const num = await Session.update(session, { where: { id: session.id } });
    if (num == 1) {
      console.log("successfully logged out");
      return res.send({
        message: "User has been successfully logged out!",
      });
    } else {
      console.log("failed to update session");
      return res.send({
        message: `Error logging out user.`,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error logging out user.",
    });
  }
};

export default exports;