import db from "../models/index.js";

const User = db.user;

const exports = {};

exports.getAthletes = async (req, res) => {
  try {
    console.log("📥 GET /api/coach/athletes");
    console.log("👤 Coach user:", req.user);
    
    // For now, return mock data until you have athlete relationships set up
    const mockAthletes = [
      {
        id: 1,
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        activeGoals: 2,
        totalWorkouts: 15,
        lastActivity: new Date()
      },
      {
        id: 2,
        name: 'John Davis',
        email: 'john@example.com',
        activeGoals: 1,
        totalWorkouts: 8,
        lastActivity: new Date()
      }
    ];
    
    res.json(mockAthletes);
    
    // TODO: Later, fetch real athletes from database
    // const athletes = await User.findAll({
    //   where: { role: 'athlete' }
    // });
    // res.json(athletes);
    
  } catch (error) {
    console.error("❌ Error fetching athletes:", error);
    res.status(500).json({ message: "Error fetching athletes" });
  }
};

exports.assignAthlete = async (req, res) => {
  try {
    const { athleteEmail, notes } = req.body;
    
    console.log("📥 POST /api/coach/athletes/assign");
    console.log("Athlete email:", athleteEmail);
    
    // TODO: Implement athlete assignment logic
    res.json({ message: "Athlete assigned successfully" });
    
  } catch (error) {
    console.error("❌ Error assigning athlete:", error);
    res.status(500).json({ message: "Error assigning athlete" });
  }
};

export default exports;