import db from "../models/index.js";
const Session = db.session;

const authenticate = (req, res, next) => {
  let token = null;
  let authHeader = req.get("authorization");
  
  if (authHeader == null) {
    return res.status(401).send({
      message: "Unauthorized! No Auth Header",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).send({
      message: "Unauthorized! Invalid Auth Header Format",
    });
  }

  token = authHeader.slice(7);

  Session.findAll({ where: { token: token } })
    .then((data) => {
      // Check if session exists
      if (!data || data.length === 0) {
        return res.status(401).send({
          message: "Unauthorized! Invalid Token",
        });
      }

      let session = data[0];
      
      // Check if token is expired
      if (session.expirationDate < Date.now()) {
        return res.status(401).send({
          message: "Unauthorized! Expired Token, Logout and Login again",
        });
      }

      // Token is valid - proceed
      next();
    })
    .catch((err) => {
      console.error("Auth error:", err.message);
      return res.status(500).send({
        message: "Error validating authentication",
      });
    });
};

export default authenticate;