import db from "../models/index.js";
const Exercise = db.exercise;
const { Op } = db.Sequelize;

// Create and Save a new Exercise
export const create = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send({ message: "Exercise name is required!" });
    }
    const exercise = await Exercise.create({
      name: req.body.name,
      category: req.body.category || "Strength",
      muscleGroup: req.body.muscleGroup || null,        
      equipmentNeeded: req.body.equipmentNeeded || null, 
      description: req.body.description || null,
      instructions: req.body.instructions || null,
      difficulty: req.body.difficulty || "Beginner",
    });
    res.status(201).send(exercise);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error creating exercise.",
    });
  }
};

// Retrieve all Exercises
export const findAll = async (req, res) => {
  try {
    const id = req.query.id;
    const condition = id ? { exercise_id: { [Op.like]: `%${id}%` } } : undefined;
    const exercises = await Exercise.findAll({ where: condition });
    res.send(exercises);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving exercises." });
  }
};

// Find one Exercise by ID
export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const exercise = await Exercise.findByPk(id);
    if (!exercise)
      return res.status(404).send({ message: `Exercise not found with id=${id}` });
    res.send(exercise);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving exercise." });
  }
};

// Find exercises by category
export const findByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const exercises = await Exercise.findAll({ where: { category } });
    res.send(exercises);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving exercises by category." });
  }
};

// Update an Exercise
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await Exercise.update(req.body, { where: { exercise_id: id } });

    if (updated === 1)
      res.send({ message: "Exercise updated successfully." });
    else
      res.status(404).send({ message: `Exercise not found or no data changed.` });
  } catch (err) {
    res.status(500).send({ message: "Error updating exercise." });
  }
};

// Delete an Exercise
export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Exercise.destroy({ where: { exercise_id: id } });

    if (deleted)
      res.send({ message: "Exercise deleted successfully." });
    else
      res.status(404).send({ message: `Exercise not found.` });
  } catch (err) {
    res.status(500).send({ message: "Error deleting exercise." });
  }
};
