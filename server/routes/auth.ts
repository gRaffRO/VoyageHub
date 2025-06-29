import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import { Database } from '../database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const db = Database.getInstance();
    
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      // Create user
      db.run(
        'INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
        [userId, email, passwordHash, firstName, lastName],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Generate JWT
          const token = jwt.sign(
            { id: userId, email },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          const user = {
            id: userId,
            email,
            firstName,
            lastName,
            preferences: {
              currency: 'USD',
              timezone: 'UTC',
              notifications: {
                email: true,
                push: true,
                reminders: true,
              },
              theme: 'light',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          res.status(201).json({ user, token });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = Database.getInstance();
    
    db.get(
      'SELECT id, email, password_hash, first_name, last_name, preferences FROM users WHERE email = ?',
      [email],
      async (err, row: any) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!row) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await bcrypt.compare(password, row.password_hash);
        if (!isValid) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
          { id: row.id, email: row.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        const user = {
          id: row.id,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          preferences: JSON.parse(row.preferences || '{}'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        res.json({ user, token });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.get(
    'SELECT id, email, first_name, last_name, preferences, created_at, updated_at FROM users WHERE id = ?',
    [req.user?.id],
    (err, row: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        preferences: JSON.parse(row.preferences || '{}'),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      res.json(user);
    }
  );
});

// Update profile
router.patch('/profile', authenticateToken, (req: AuthRequest, res) => {
  const { firstName, lastName, preferences } = req.body;
  const db = Database.getInstance();
  
  db.run(
    'UPDATE users SET first_name = ?, last_name = ?, preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [firstName, lastName, JSON.stringify(preferences), req.user?.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Profile updated successfully' });
    }
  );
});

export { router as authRoutes };