import db from "../models/index.js";
const User = db.user;
const { Op } = db.Sequelize;

// Create and Save a new User
export const create = async (req, res) => {
  try {
    if (!req.body.fName || !req.body.email) {
      return res.status(400).send({ message: "Required fields missing!" });
    }

    const user = await User.create({
      fName: req.body.fName,
      lName: req.body.lName,
      email: req.body.email,
      password_hash: req.body.password_hash || null,
      role: req.body.role || "athlete",
    });

    res.status(201).send(user);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error creating user.",
    });
  }
};

// Retrieve all Users
export const findAll = async (req, res) => {
  try {
    const id = req.query.id;
    const condition = id ? { user_id: { [Op.like]: `%${id}%` } } : undefined;
    const users = await User.findAll({ where: condition });
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving users." });
  }
};

// Find one User by ID
export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).send({ message: `User not found with id=${id}` });
    res.send(user);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving user." });
  }
};

// Find by email
export const findByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send({ message: "Email not found." });
    res.send(user);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving user by email." });
  }
};

// Update a User
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await User.update(req.body, { where: { user_id: id } });

    if (updated === 1)
      res.send({ message: "User updated successfully." });
    else
      res.status(404).send({ message: `User not found or no data changed.` });
  } catch (err) {
    res.status(500).send({ message: "Error updating user." });
  }
};

// Delete a User
export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await User.destroy({ where: { user_id: id } });

    if (deleted)
      res.send({ message: "User deleted successfully." });
    else
      res.status(404).send({ message: `User not found.` });
  } catch (err) {
    res.status(500).send({ message: "Error deleting user." });
  }
};
