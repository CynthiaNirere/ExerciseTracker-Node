import db from "../models/index.js";

const Plan = db.plan;
const Exercise = db.exercise;
const PlanExercise = db.planExercise;

const PlanController = {
  // Get all plans
  getAll: async (req, res) => {
    try {
      console.log("📥 GET /plans");
      const plans = await Plan.findAll({
        order: [['created_at', 'DESC']],
        include: [{
          model: Exercise,
          through: { attributes: ['sets', 'reps', 'order'] }
        }]
      });
      
      const formattedPlans = plans.map(plan => ({
        id: plan.plan_id,
        name: plan.name,
        description: plan.description,
        duration: plan.duration,
        assignedAthletes: plan.assigned_athlete_id ? 1 : 0,
        exercises: plan.exercises ? plan.exercises.length : 0,
        exerciseList: plan.exercises || []
      }));
      
      res.json(formattedPlans);
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      res.status(500).json({ message: "Error fetching plans" });
    }
  },

  // Create a new plan
  create: async (req, res) => {
    try {
      const { name, description, duration, assignTo, exercises } = req.body;
      
      console.log("📥 POST /plans", { name, description, exercises });
      
      // Create the plan
      const plan = await Plan.create({
        name,
        description,
        duration,
        assigned_athlete_id: assignTo === 'template' ? null : assignTo,
        created_by: null // Add user tracking later
      });
      
      // Add exercises to the plan
      if (exercises && exercises.length > 0) {
        const planExercises = exercises.map((exerciseId, index) => ({
          plan_id: plan.plan_id,
          exercise_id: exerciseId,
          order: index + 1
        }));
        
        await PlanExercise.bulkCreate(planExercises);
      }
      
      // Fetch the complete plan with exercises
      const completePlan = await Plan.findByPk(plan.plan_id, {
        include: [{
          model: Exercise,
          through: { attributes: ['sets', 'reps', 'order'] }
        }]
      });
      
      res.json({
        id: completePlan.plan_id,
        name: completePlan.name,
        description: completePlan.description,
        duration: completePlan.duration,
        assignedAthletes: completePlan.assigned_athlete_id ? 1 : 0,
        exercises: completePlan.exercises ? completePlan.exercises.length : 0,
        exerciseList: completePlan.exercises || []
      });
    } catch (error) {
      console.error("❌ Error creating plan:", error);
      res.status(500).json({ message: "Error creating plan" });
    }
  },

  // Delete a plan
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log("📥 DELETE /plans/" + id);
      
      // Delete associated exercises first
      await PlanExercise.destroy({
        where: { plan_id: id }
      });
      
      // Delete the plan
      await Plan.destroy({
        where: { plan_id: id }
      });
      
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting plan:", error);
      res.status(500).json({ message: "Error deleting plan" });
    }
  }
};

export default PlanController;