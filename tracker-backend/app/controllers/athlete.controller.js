import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Register new athlete
export const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            dateOfBirth,
            height,
            weight,
            sport,
            position,
            emergencyContact,
            emergencyPhone
        } = req.body;

        // Check if user already exists
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start transaction
        await db.query('START TRANSACTION');

        try {
            // Insert into users table
            const [userResult] = await db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, 'athlete']
            );

            const userId = userResult.insertId;

            // Insert into athletes table
            await db.query(
                `INSERT INTO athletes (user_id, date_of_birth, height, weight, sport, position, emergency_contact, emergency_phone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, dateOfBirth, height, weight, sport, position, emergencyContact, emergencyPhone]
            );

            await db.query('COMMIT');

            res.status(201).json({
                message: 'Athlete registered successfully',
                userId
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Get athlete dashboard data
export const getDashboard = async (req, res) => {
    try {
        if (req.user.role !== 'athlete') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get athlete info
        const [athlete] = await db.query(
            `SELECT a.*, u.name, u.email 
            FROM athletes a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ?`,
            [req.user.userId]
        );

        if (athlete.length === 0) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        // Get assigned coaches count
        const [coaches] = await db.query(
            `SELECT COUNT(*) as count 
            FROM athlete_coach_assignments 
            WHERE athlete_id = ? AND status = 'active'`,
            [athlete[0].id]
        );

        // Get active workout assignments count
        const [activeWorkouts] = await db.query(
            `SELECT COUNT(*) as count 
            FROM workout_assignments 
            WHERE athlete_id = ? AND status IN ('assigned', 'in_progress')`,
            [athlete[0].id]
        );

        // Get completed workouts count (last 30 days)
        const [completedWorkouts] = await db.query(
            `SELECT COUNT(*) as count 
            FROM workout_logs 
            WHERE athlete_id = ? AND completed_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            [athlete[0].id]
        );

        // Get recent workout assignments
        const [recentWorkouts] = await db.query(
            `SELECT wa.*, u.name as coach_name
            FROM workout_assignments wa
            JOIN coaches c ON wa.coach_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE wa.athlete_id = ?
            ORDER BY wa.scheduled_date DESC
            LIMIT 5`,
            [athlete[0].id]
        );

        res.json({
            athlete: athlete[0],
            stats: {
                coaches: coaches[0].count,
                activeWorkouts: activeWorkouts[0].count,
                completedWorkouts: completedWorkouts[0].count
            },
            recentWorkouts
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get athlete's assigned workouts
export const getWorkouts = async (req, res) => {
    try {
        if (req.user.role !== 'athlete') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [athlete] = await db.query(
            'SELECT id FROM athletes WHERE user_id = ?',
            [req.user.userId]
        );

        if (athlete.length === 0) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        const [workouts] = await db.query(
            `SELECT wa.*, u.name as coach_name, u.email as coach_email
            FROM workout_assignments wa
            JOIN coaches c ON wa.coach_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE wa.athlete_id = ?
            ORDER BY wa.scheduled_date DESC`,
            [athlete[0].id]
        );

        res.json(workouts);
    } catch (error) {
        console.error('Workouts fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Log workout completion
export const completeWorkout = async (req, res) => {
    try {
        if (req.user.role !== 'athlete') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { assignmentId } = req.params;
        const { duration, notes, rating, exercises } = req.body;

        const [athlete] = await db.query(
            'SELECT id FROM athletes WHERE user_id = ?',
            [req.user.userId]
        );

        if (athlete.length === 0) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        await db.query('START TRANSACTION');

        try {
            // Create workout log
            const [logResult] = await db.query(
                `INSERT INTO workout_logs (workout_assignment_id, athlete_id, duration_minutes, notes, rating)
                VALUES (?, ?, ?, ?, ?)`,
                [assignmentId, athlete[0].id, duration, notes, rating]
            );

            // Update workout assignment status
            await db.query(
                'UPDATE workout_assignments SET status = ? WHERE id = ?',
                ['completed', assignmentId]
            );

            // Log individual exercises if provided
            if (exercises && exercises.length > 0) {
                for (const exercise of exercises) {
                    await db.query(
                        `INSERT INTO exercise_logs (workout_log_id, exercise_name, sets_completed, reps_completed, weight_used, notes)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [logResult.insertId, exercise.name, exercise.sets, exercise.reps, exercise.weight, exercise.notes]
                    );
                }
            }

            await db.query('COMMIT');

            res.json({ message: 'Workout logged successfully', logId: logResult.insertId });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Workout log error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get athlete's workout history
export const getHistory = async (req, res) => {
    try {
        if (req.user.role !== 'athlete') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [athlete] = await db.query(
            'SELECT id FROM athletes WHERE user_id = ?',
            [req.user.userId]
        );

        if (athlete.length === 0) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        const [history] = await db.query(
            `SELECT wl.*, wa.workout_name, u.name as coach_name
            FROM workout_logs wl
            JOIN workout_assignments wa ON wl.workout_assignment_id = wa.id
            JOIN coaches c ON wa.coach_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE wl.athlete_id = ?
            ORDER BY wl.completed_date DESC`,
            [athlete[0].id]
        );

        res.json(history);
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get athlete profile
export const getProfile = async (req, res) => {
    try {
        if (req.user.role !== 'athlete') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [athlete] = await db.query(
            `SELECT a.*, u.name, u.email 
            FROM athletes a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ?`,
            [req.user.userId]
        );

        if (athlete.length === 0) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        res.json(athlete[0]);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update athlete profile
export const updateProfile = async (req, res) => {
    try {
        if (req.user.role !== 'athlete') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const {
            name,
            dateOfBirth,
            height,
            weight,
            sport,
            position,
            emergencyContact,
            emergencyPhone
        } = req.body;

        const [athlete] = await db.query(
            'SELECT id FROM athletes WHERE user_id = ?',
            [req.user.userId]
        );

        if (athlete.length === 0) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        await db.query('START TRANSACTION');

        try {
            // Update users table
            await db.query(
                'UPDATE users SET name = ? WHERE id = ?',
                [name, req.user.userId]
            );

            // Update athletes table
            await db.query(
                `UPDATE athletes SET 
                date_of_birth = ?, height = ?, weight = ?, sport = ?, 
                position = ?, emergency_contact = ?, emergency_phone = ?
                WHERE id = ?`,
                [dateOfBirth, height, weight, sport, position, emergencyContact, emergencyPhone, athlete[0].id]
            );

            await db.query('COMMIT');

            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export default {
    register,
    getDashboard,
    getWorkouts,
    completeWorkout,
    getHistory,
    getProfile,
    updateProfile
};