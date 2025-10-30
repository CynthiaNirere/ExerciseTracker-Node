import db from '../config/database.js';

// Get all athletes assigned to a coach
export const getAllAthletes = async (req, res) => {
    try {
        if (req.user.role !== 'coach') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [coach] = await db.query(
            'SELECT id FROM coaches WHERE user_id = ?',
            [req.user.userId]
        );

        if (coach.length === 0) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        const [athletes] = await db.query(
            `SELECT 
                a.id, 
                u.name, 
                u.email, 
                a.sport, 
                a.position,
                aca.assigned_date,
                aca.status,
                COUNT(DISTINCT wa.id) as total_workouts,
                COUNT(DISTINCT CASE WHEN wa.status = 'completed' THEN wa.id END) as completed_workouts
            FROM athlete_coach_assignments aca
            JOIN athletes a ON aca.athlete_id = a.id
            JOIN users u ON a.user_id = u.id
            LEFT JOIN workout_assignments wa ON wa.athlete_id = a.id AND wa.coach_id = ?
            WHERE aca.coach_id = ? AND aca.status = 'active'
            GROUP BY a.id, u.name, u.email, a.sport, a.position, aca.assigned_date, aca.status`,
            [coach[0].id, coach[0].id]
        );

        res.json(athletes);
    } catch (error) {
        console.error('Get athletes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Assign athlete to coach
export const assignAthlete = async (req, res) => {
    try {
        if (req.user.role !== 'coach') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { athleteEmail, notes } = req.body;

        const [coach] = await db.query(
            'SELECT id FROM coaches WHERE user_id = ?',
            [req.user.userId]
        );

        if (coach.length === 0) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        // Find athlete by email
        const [athlete] = await db.query(
            `SELECT a.id 
            FROM athletes a
            JOIN users u ON a.user_id = u.id
            WHERE u.email = ?`,
            [athleteEmail]
        );

        if (athlete.length === 0) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        // Check if assignment already exists
        const [existing] = await db.query(
            'SELECT * FROM athlete_coach_assignments WHERE athlete_id = ? AND coach_id = ?',
            [athlete[0].id, coach[0].id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Athlete already assigned to this coach' });
        }

        // Create assignment
        await db.query(
            `INSERT INTO athlete_coach_assignments (athlete_id, coach_id, assigned_date, status, notes)
            VALUES (?, ?, CURDATE(), 'active', ?)`,
            [athlete[0].id, coach[0].id, notes]
        );

        res.json({ message: 'Athlete assigned successfully' });
    } catch (error) {
        console.error('Assign athlete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create workout assignment
export const assignWorkout = async (req, res) => {
    try {
        if (req.user.role !== 'coach') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const {
            athleteId,
            workoutName,
            workoutDescription,
            scheduledDate,
            dueDate,
            priority
        } = req.body;

        const [coach] = await db.query(
            'SELECT id FROM coaches WHERE user_id = ?',
            [req.user.userId]
        );

        if (coach.length === 0) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        // Verify athlete is assigned to this coach
        const [assignment] = await db.query(
            'SELECT * FROM athlete_coach_assignments WHERE athlete_id = ? AND coach_id = ? AND status = "active"',
            [athleteId, coach[0].id]
        );

        if (assignment.length === 0) {
            return res.status(403).json({ message: 'Athlete not assigned to this coach' });
        }

        const [result] = await db.query(
            `INSERT INTO workout_assignments 
            (athlete_id, coach_id, workout_name, workout_description, scheduled_date, due_date, priority, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'assigned')`,
            [athleteId, coach[0].id, workoutName, workoutDescription, scheduledDate, dueDate, priority]
        );

        res.json({
            message: 'Workout assigned successfully',
            assignmentId: result.insertId
        });
    } catch (error) {
        console.error('Assign workout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get athlete's workout progress
export const getAthleteProgress = async (req, res) => {
    try {
        if (req.user.role !== 'coach') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { athleteId } = req.params;

        const [coach] = await db.query(
            'SELECT id FROM coaches WHERE user_id = ?',
            [req.user.userId]
        );

        if (coach.length === 0) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        // Verify athlete is assigned to this coach
        const [assignment] = await db.query(
            'SELECT * FROM athlete_coach_assignments WHERE athlete_id = ? AND coach_id = ? AND status = "active"',
            [athleteId, coach[0].id]
        );

        if (assignment.length === 0) {
            return res.status(403).json({ message: 'Athlete not assigned to this coach' });
        }

        // Get workout statistics
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total_assigned,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed
            FROM workout_assignments
            WHERE athlete_id = ? AND coach_id = ?`,
            [athleteId, coach[0].id]
        );

        // Get recent workout logs
        const [recentLogs] = await db.query(
            `SELECT wl.*, wa.workout_name
            FROM workout_logs wl
            JOIN workout_assignments wa ON wl.workout_assignment_id = wa.id
            WHERE wl.athlete_id = ? AND wa.coach_id = ?
            ORDER BY wl.completed_date DESC
            LIMIT 10`,
            [athleteId, coach[0].id]
        );

        res.json({
            stats: stats[0],
            recentLogs
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get specific athlete details
export const getAthleteDetails = async (req, res) => {
    try {
        if (req.user.role !== 'coach') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { athleteId } = req.params;

        const [coach] = await db.query(
            'SELECT id FROM coaches WHERE user_id = ?',
            [req.user.userId]
        );

        if (coach.length === 0) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        // Verify athlete is assigned to this coach
        const [assignment] = await db.query(
            'SELECT * FROM athlete_coach_assignments WHERE athlete_id = ? AND coach_id = ? AND status = "active"',
            [athleteId, coach[0].id]
        );

        if (assignment.length === 0) {
            return res.status(403).json({ message: 'Athlete not assigned to this coach' });
        }

        const [athlete] = await db.query(
            `SELECT a.*, u.name, u.email
            FROM athletes a
            JOIN users u ON a.user_id = u.id
            WHERE a.id = ?`,
            [athleteId]
        );

        if (athlete.length === 0) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        res.json(athlete[0]);
    } catch (error) {
        console.error('Get athlete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove athlete assignment
export const removeAthlete = async (req, res) => {
    try {
        if (req.user.role !== 'coach') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { athleteId } = req.params;

        const [coach] = await db.query(
            'SELECT id FROM coaches WHERE user_id = ?',
            [req.user.userId]
        );

        if (coach.length === 0) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        // Update assignment status to inactive
        const [result] = await db.query(
            'UPDATE athlete_coach_assignments SET status = "inactive" WHERE athlete_id = ? AND coach_id = ?',
            [athleteId, coach[0].id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.json({ message: 'Athlete removed successfully' });
    } catch (error) {
        console.error('Remove athlete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export default {
    getAllAthletes,
    assignAthlete,
    assignWorkout,
    getAthleteProgress,
    getAthleteDetails,
    removeAthlete
};