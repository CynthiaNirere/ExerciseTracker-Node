import db from "../models/index.js";
const Goal = db.goal;

// Get all goals for a specific athlete
export const getGoalsByAthlete = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    
    console.log("Fetching goals for athlete:", athleteId);
    
    const goals = await Goal.findAll({
      where: { athleteId: athleteId },
      order: [['startDate', 'DESC']]
    });
    
    console.log(`Found ${goals.length} goals`);
    
    // Map to clean JSON response
    const mappedGoals = goals.map(goal => {
      const data = goal.toJSON();
      return {
        id: data.id,
        athleteId: data.athleteId,
        title: data.title,
        description: data.description,
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        unit: data.unit,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate, // This is what frontend needs as targetDate
        targetDate: data.endDate // Also include as targetDate for compatibility
      };
    });
    
    res.send(mappedGoals);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).send({
      message: "Error retrieving goals for athlete.",
      error: err.message
    });
  }
};

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).send({
        message: "Goal title is required!"
      });
    }
    
    if (!req.body.athleteId) {
      return res.status(400).send({
        message: "Athlete ID is required!"
      });
    }
    
    const goal = await Goal.create({
      athleteId: req.body.athleteId,
      title: req.body.title,
      description: req.body.description,
      targetValue: req.body.targetValue,
      currentValue: req.body.currentValue || 0,
      unit: req.body.unit || 'count',
      status: req.body.status || 'in_progress',
      startDate: req.body.startDate || new Date(),
      endDate: req.body.targetDate || req.body.endDate // Map targetDate to endDate
    });
    
    res.status(201).send(goal);
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).send({
      message: "Error creating goal.",
      error: err.message
    });
  }
};

// Update a goal
export const updateGoal = async (req, res) => {
  try {
    const id = req.params.id;
    
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      targetValue: req.body.targetValue,
      currentValue: req.body.currentValue,
      unit: req.body.unit,
      status: req.body.status,
      endDate: req.body.targetDate || req.body.endDate // Map targetDate to endDate
    };
    
    const [updated] = await Goal.update(updateData, {
      where: { id: id }
    });
    
    if (updated === 1) {
      res.send({ message: "Goal updated successfully." });
    } else {
      res.status(404).send({
        message: `Goal not found or no data changed.`
      });
    }
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).send({
      message: "Error updating goal.",
      error: err.message
    });
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Goal.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      res.send({ message: "Goal deleted successfully." });
    } else {
      res.status(404).send({
        message: `Goal not found.`
      });
    }
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).send({
      message: "Error deleting goal.",
      error: err.message
    });
  }
};

// Get all goals (admin)
export const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      order: [['startDate', 'DESC']]
    });
    res.send(goals);
  } catch (err) {
    console.error("Error fetching all goals:", err);
    res.status(500).send({
      message: "Error retrieving goals."
    });
  }
};

// Get single goal by ID
export const getGoalById = async (req, res) => {
  try {
    const id = req.params.id;
    const goal = await Goal.findByPk(id);
    
    if (!goal) {
      return res.status(404).send({
        message: `Goal not found with id=${id}`
      });
    }
    
    res.send(goal);
  } catch (err) {
    console.error("Error fetching goal:", err);
    res.status(500).send({
      message: "Error retrieving goal."
    });
  }
};