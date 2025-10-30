import db from "../models/index.js";
const ExercisePlan = db.exercisePlan;
const Exercise = db.exercise;
const { Op } = db.Sequelize;

// Create and Save a new Exercise Plan
export const create = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send({ message: "Plan name is required!" });
    }
    
    const plan = await ExercisePlan.create({
      name: req.body.name,
      description: req.body.description || null,
      difficulty: req.body.difficulty || "Beginner",
      duration_weeks: req.body.duration_weeks || 4,
    });

    if (req.body.exercises && req.body.exercises.length > 0) {
      await plan.setExercises(req.body.exercises);
    }

    const newPlan = await ExercisePlan.findByPk(plan.id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: { attributes: [] } // Exclude join table attributes
      }]
    });

    res.status(201).send(newPlan);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error creating exercise plan."
    });
  }
};

// Retrieve all Exercise Plans
export const findAll = async (req, res) => {
  try {
    const plans = await ExercisePlan.findAll({
      include: [{
        model: Exercise,
        as: 'exercises',
        through: { attributes: [] },
        attributes: ['id', 'name', 'category']
      }]
    });
    res.send(plans);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving exercise plans." });
  }
};

// Find one Exercise Plan by ID
export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const plan = await ExercisePlan.findByPk(id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: { attributes: [] },
        attributes: ['id', 'name', 'category', 'difficulty']
      }]
    });
    
    if (!plan) {
      return res.status(404).send({ message: `Exercise plan not found with id=${id}` });
    }
    
    res.send(plan);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving exercise plan." });
  }
};

// Update an Exercise Plan
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await ExercisePlan.update(req.body, {
      where: { id: id }
    });
    
    if (updated) {
      const plan = await ExercisePlan.findByPk(id);
      
      if (req.body.exercises) {
        await plan.setExercises(req.body.exercises);
      }
      
      const updatedPlan = await ExercisePlan.findByPk(id, {
        include: [{
          model: Exercise,
          as: 'exercises',
          through: { attributes: [] }
        }]
      });
      
      return res.send(updatedPlan);
    }
    
    res.status(404).send({
      message: `Cannot update Exercise Plan with id=${id}. Maybe Exercise Plan was not found!`
    });
  } catch (err) {
    res.status(500).send({
      message: `Error updating Exercise Plan with id=${id}`
    });
  }
};

// Delete an Exercise Plan
export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await ExercisePlan.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      return res.send({ message: "Exercise Plan was deleted successfully!" });
    }
    
    res.status(404).send({
      message: `Cannot delete Exercise Plan with id=${id}. Maybe Exercise Plan was not found!`
    });
  } catch (err) {
    res.status(500).send({
      message: `Could not delete Exercise Plan with id=${id}`
    });
  }
};

// Find plans by difficulty
export const findByDifficulty = async (req, res) => {
  try {
    const difficulty = req.params.difficulty;
    const plans = await ExercisePlan.findAll({
      where: { difficulty: difficulty },
      include: [{
        model: Exercise,
        as: 'exercises',
        through: { attributes: [] },
        attributes: ['id', 'name', 'category']
      }]
    });
    res.send(plans);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Exercise Plans with difficulty=${difficulty}`
    });
  }
};
