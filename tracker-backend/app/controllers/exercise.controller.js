import db from "../models/index.js";

const Exercise = db.exercise;

const ExerciseController = {
  getAll: async (req, res) => {
    try {
      console.log("📥 GET /exercises");
      const exercises = await Exercise.findAll({
        order: [['created_at', 'DESC']]
      });
      
      const formattedExercises = exercises.map(ex => ({
        id: ex.exercise_id,
        name: ex.name,
        description: ex.description,
        category: 'Strength',
        muscleGroups: ex.muscle_group,
        equipment: ex.equipment_needed,
        type: 'Standard'
      }));
      
      res.json(formattedExercises);
    } catch (error) {
      console.error("❌ Error fetching exercises:", error);
      res.status(500).json({ message: "Error fetching exercises" });
    }
  },

  create: async (req, res) => {
    try {
      const { name, description, muscleGroups, equipment } = req.body;
      
      console.log("📥 POST /exercises", { name, description });
      
      const exercise = await Exercise.create({
        name,
        description,
        muscle_group: muscleGroups,
        equipment_needed: equipment,
        created_by: null
      });
      
      res.json({
        id: exercise.exercise_id,
        name: exercise.name,
        description: exercise.description,
        category: 'Strength',
        muscleGroups: exercise.muscle_group,
        equipment: exercise.equipment_needed,
        type: 'Custom'
      });
    } catch (error) {
      console.error("❌ Error creating exercise:", error);
      res.status(500).json({ message: "Error creating exercise" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log("📥 DELETE /exercises/" + id);
      
      await Exercise.destroy({
        where: { exercise_id: id }
      });
      
      res.json({ message: "Exercise deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting exercise:", error);
      res.status(500).json({ message: "Error deleting exercise" });
    }
  }
};

export default ExerciseController;