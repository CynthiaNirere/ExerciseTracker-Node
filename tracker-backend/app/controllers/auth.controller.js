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

const exports = {};

exports.login = async (req, res) => {
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
      } else {
        // Determine role based on email
        let role = 'athlete';
        if (email === 'cynthia.nirere@eagles.oc.edu') {
          role = 'coach';
        } else if (email.includes('@admin.')) {
          role = 'admin';
        } else if (email.includes('@eagles.oc.edu')) {
          role = 'coach';
        }

        user = {
          fName: firstName,
          lName: lastName,
          email: email,
          role: role,
        };
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });

  if (user.user_id === undefined) {
    await User.create(user)
      .then((data) => {
        user = data.dataValues;
        console.log(' New user created:', user);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
        return;
      });
  } else {
    // Update user's name
    user.fName = firstName;
    user.lName = lastName;

    await User.update(user, { where: { user_id: user.user_id } })
      .then((num) => {
        if (num == 1) {
          console.log("updated user's name");
        } else {
          console.log(
            `Cannot update User with user_id=${user.user_id}. Maybe User was not found!`
          );
        }
      })
      .catch((err) => {
        console.log("Error updating User with user_id=" + user.user_id + " " + err);
      });
  }

  // Try to find session first
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
          await Session.update(session, { where: { id: session.id } })
            .then((num) => {
              if (num == 1) {
                console.log("successfully logged out");
              } else {
                console.log("failed");
                res.send({
                  message: `Error logging out user.`,
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send({
                message: "Error logging out user.",
              });
            });
          session = {};
        } else {
          let userInfo = {
            id: user.user_id,
            user_id: user.user_id,
            email: user.email,
            fName: user.fName,
            lName: user.lName,
            first_name: user.fName,
            last_name: user.lName,
            userId: user.user_id,
            role: user.role || 'athlete',
            token: session.token,
            created_at: user.created_at,
          };
          console.log(" Found existing session, returning user info:");
          console.log(userInfo);
          res.send(userInfo);
        }
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving sessions.",
      });
    });

  if (session.id === undefined) {
    // Create a new Session
    let token = jwt.sign({ id: email }, authconfig.secret, {
      expiresIn: 86400,
    });
    let tempExpirationDate = new Date();
    tempExpirationDate.setDate(tempExpirationDate.getDate() + 1);
    
    const newSession = {
      token: token,
      email: email,
      userId: user.user_id,
      expirationDate: tempExpirationDate,
    };

    console.log("making a new session");
    console.log(newSession);

    await Session.create(newSession)
      .then(() => {
        let userInfo = {
          id: user.user_id,
          user_id: user.user_id,
          email: user.email,
          fName: user.fName,
          lName: user.lName,
          first_name: user.fName,
          last_name: user.lName,
          userId: user.user_id,
          role: user.role || 'athlete',
          token: token,
          created_at: user.created_at,
        };
        console.log(" New session created, returning user info:");
        console.log(userInfo);
        res.send(userInfo);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};

exports.authorize = async (req, res) => {
  console.log("authorize client");
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "postmessage"
  );

  console.log("authorize token");
  let { tokens } = await oauth2Client.getToken(req.body.code);
  oauth2Client.setCredentials(tokens);

  let user = {};
  console.log("findUser");

  await User.findOne({
    where: {
      user_id: req.params.id,
    },
  })
    .then((data) => {
      if (data != null) {
        user = data.dataValues;
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
      return;
    });
  console.log("user");
  console.log(user);
  user.refresh_token = tokens.refresh_token;
  let tempExpirationDate = new Date();
  tempExpirationDate.setDate(tempExpirationDate.getDate() + 100);
  user.expiration_date = tempExpirationDate;

  await User.update(user, { where: { user_id: user.user_id } })
    .then((num) => {
      if (num == 1) {
        console.log("updated user's google token stuff");
      } else {
        console.log(
          `Cannot update User with user_id=${user.user_id}. Maybe User was not found!`
        );
      }
      let userInfo = {
        refresh_token: user.refresh_token,
        expiration_date: user.expiration_date,
      };
      console.log(userInfo);
      res.send(userInfo);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });

  console.log(tokens);
  console.log(oauth2Client);
};

exports.logout = async (req, res) => {
  console.log(req.body);
  if (req.body === null) {
    res.send({
      message: "User has already been successfully logged out!",
    });
    return;
  }

  let session = {};

  await Session.findAll({ where: { token: req.body.token } })
    .then((data) => {
      if (data[0] !== undefined) session = data[0].dataValues;
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving sessions.",
      });
      return;
    });

  session.token = "";

  if (session.id !== undefined) {
    Session.update(session, { where: { id: session.id } })
      .then((num) => {
        if (num == 1) {
          console.log("successfully logged out");
          res.send({
            message: "User has been successfully logged out!",
          });
        } else {
          console.log("failed");
          res.send({
            message: `Error logging out user.`,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({
          message: "Error logging out user.",
        });
      });
  } else {
    console.log("already logged out");
    res.send({
      message: "User has already been successfully logged out!",
    });
  }
};

export default exports;