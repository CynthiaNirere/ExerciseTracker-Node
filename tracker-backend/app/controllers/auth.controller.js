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
  try {
    var googleToken = req.body.credential;

    const client = new OAuth2Client(google_id);
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: google_id,
    });
    googleUser = ticket.getPayload();
    console.log("Google payload:", googleUser.email);

    let email = googleUser.email;
    let firstName = googleUser.given_name;
    let lastName = googleUser.family_name;

    // Find or prepare user object
    let user = await User.findOne({ where: { email: email } });

    if (!user) {
      // Determine role based on email
      let role = 'athlete';
      if (email === 'tessy.p.mugisha@eagles.oc.edu') {
        role = 'coach';
      } else if (email.includes('@admin.')) {
        role = 'admin';
      } else if (email.includes('@eagles.oc.edu')) {
        role = 'coach';
      }

      // Create new user
      user = await User.create({
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role,
      });
      console.log('✅ New user created:', user.dataValues);
    } else {
      // Update existing user's name
      await User.update(
        {
          first_name: firstName,
          last_name: lastName
        },
        { where: { user_id: user.user_id } }
      );
      console.log("✅ Updated user's name");
    }

    // Get fresh user data
    const userData = user.dataValues || user;

    // Check for existing valid session
    let session = await Session.findOne({
      where: {
        email: email,
        token: { [Op.ne]: "" },
      },
    });

    // If session exists and is valid, return it
    if (session) {
      const sessionData = session.dataValues || session;
      
      if (sessionData.expirationDate > Date.now()) {
        let userInfo = {
          id: userData.user_id,
          user_id: userData.user_id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || 'athlete',
          token: sessionData.token,
          created_at: userData.created_at,
        };
        
        console.log("✅ Found existing valid session");
        console.log("User info:", userInfo);
        
        res.cookie("token", sessionData.token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        return res.send(userInfo); // RETURN HERE - STOP EXECUTION
      } else {
        // Session expired, clear it
        await Session.update(
          { token: "" },
          { where: { id: sessionData.id } }
        );
        console.log("Old session expired, creating new one");
      }
    }

    // Create new session
    let token = jwt.sign({ id: email }, authconfig.secret, {
      expiresIn: 86400,
    });
    
    let tempExpirationDate = new Date();
    tempExpirationDate.setDate(tempExpirationDate.getDate() + 1);
    
    await Session.create({
      token: token,
      email: email,
      userId: userData.user_id,
      expirationDate: tempExpirationDate,
    });

    let userInfo = {
      id: userData.user_id,
      user_id: userData.user_id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role || 'athlete',
      token: token,
      created_at: userData.created_at,
    };
    
    console.log("✅ New session created");
    console.log("User info:", userInfo);
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    return res.send(userInfo);
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send({ message: error.message || "Login failed" });
  }
};

exports.authorize = async (req, res) => {
  try {
    console.log("authorize client");
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "postmessage"
    );

    let { tokens } = await oauth2Client.getToken(req.body.code);
    oauth2Client.setCredentials(tokens);

    let user = await User.findOne({
      where: {
        user_id: req.params.id,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const userData = user.dataValues || user;
    
    let tempExpirationDate = new Date();
    tempExpirationDate.setDate(tempExpirationDate.getDate() + 100);

    await User.update(
      {
        refresh_token: tokens.refresh_token,
        expiration_date: tempExpirationDate
      },
      { where: { user_id: userData.user_id } }
    );

    let userInfo = {
      refresh_token: tokens.refresh_token,
      expiration_date: tempExpirationDate,
    };
    
    return res.send(userInfo);
    
  } catch (error) {
    console.error("Authorize error:", error);
    return res.status(500).send({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    if (!req.body || !req.body.token) {
      return res.send({
        message: "User has already been successfully logged out!",
      });
    }

    let session = await Session.findOne({
      where: { token: req.body.token }
    });

    if (session) {
      await Session.update(
        { token: "" },
        { where: { id: session.id } }
      );
      
      res.clearCookie("token");
      
      return res.send({
        message: "User has been successfully logged out!",
      });
    } else {
      return res.send({
        message: "User has already been successfully logged out!",
      });
    }
    
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).send({
      message: "Error logging out user.",
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    console.log("📥 /current-user request received");
    console.log("🍪 Cookies:", req.cookies);
    
    const token = req.cookies?.token;
    
    if (!token) {
      console.log("❌ No token found");
      return res.status(401).json({ user: null, message: "No token" });
    }
    
    const decoded = jwt.verify(token, authconfig.secret);
    console.log("🔓 Token decoded:", decoded);
    
    const user = await User.findOne({
      where: { email: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ user: null, message: "User not found" });
    }
    
    const userData = user.dataValues || user;
    const userInfo = {
      id: userData.user_id,
      user_id: userData.user_id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role || 'athlete',
      token: token,
    };
    
    console.log("✅ User found:", userInfo);
    return res.json({ user: userInfo });
    
  } catch (error) {
    console.error("❌ getCurrentUser error:", error.message);
    return res.status(401).json({ user: null, message: "Invalid token" });
  }
};

export default exports;