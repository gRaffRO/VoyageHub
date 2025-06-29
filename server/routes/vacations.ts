import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all vacations for user
router.get('/', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.all(
    'SELECT * FROM vacations WHERE user_id = ? ORDER BY created_at DESC',
    [req.user?.id],
    (err, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const vacations = rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        destinations: JSON.parse(row.destinations || '[]'),
        collaborators: JSON.parse(row.collaborators || '[]'),
        isPublic: Boolean(row.is_public),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        budget: {
          id: '',
          vacationId: row.id,
          totalBudget: 0,
          currency: 'USD',
          categories: [],
          expenses: [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
      }));

      res.json(vacations);
    }
  );
});

// Create vacation
router.post('/', (req: AuthRequest, res) => {
  const { title, description, startDate, endDate, destinations = [], collaborators = [] } = req.body;
  
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: 'Title, start date, and end date are required' });
  }

  const db = Database.getInstance();
  const vacationId = uuidv4();
  const budgetId = uuidv4();
  
  db.run(
    'INSERT INTO vacations (id, user_id, title, description, start_date, end_date, destinations, collaborators) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [vacationId, req.user?.id, title, description, startDate, endDate, JSON.stringify(destinations), JSON.stringify(collaborators)],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create vacation' });
      }

      // Create associated budget
      db.run(
        'INSERT INTO budgets (id, vacation_id) VALUES (?, ?)',
        [budgetId, vacationId],
        (budgetErr) => {
          if (budgetErr) {
            console.error('Failed to create budget for vacation:', budgetErr);
            // Don't fail the vacation creation if budget creation fails
          }

          const vacation = {
            id: vacationId,
            userId: req.user?.id,
            title,
            description,
            startDate,
            endDate,
            status: 'planning',
            destinations,
            collaborators,
            isPublic: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            budget: {
              id: budgetId,
              vacationId,
              totalBudget: 0,
              currency: 'USD',
              categories: [],
              expenses: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          };

          res.status(201).json(vacation);
        }
      );
    }
  );
});

// Get vacation by ID
router.get('/:id', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.get(
    'SELECT * FROM vacations WHERE id = ? AND (user_id = ? OR collaborators LIKE ?)',
    [req.params.id, req.user?.id, `%${req.user?.id}%`],
    (err, row: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Vacation not found' });
      }

      const vacation = {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        destinations: JSON.parse(row.destinations || '[]'),
        collaborators: JSON.parse(row.collaborators || '[]'),
        isPublic: Boolean(row.is_public),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        budget: {
          id: '',
          vacationId: row.id,
          totalBudget: 0,
          currency: 'USD',
          categories: [],
          expenses: [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
      };

      res.json(vacation);
    }
  );
});

// Update vacation
router.patch('/:id', (req: AuthRequest, res) => {
  const { title, description, startDate, endDate, status, destinations, collaborators, isPublic } = req.body;
  const db = Database.getInstance();
  
  db.run(
    `UPDATE vacations SET 
     title = COALESCE(?, title),
     description = COALESCE(?, description),
     start_date = COALESCE(?, start_date),
     end_date = COALESCE(?, end_date),
     status = COALESCE(?, status),
     destinations = COALESCE(?, destinations),
     collaborators = COALESCE(?, collaborators),
     is_public = COALESCE(?, is_public),
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [
      title,
      description,
      startDate,
      endDate,
      status,
      destinations ? JSON.stringify(destinations) : null,
      collaborators ? JSON.stringify(collaborators) : null,
      isPublic,
      req.params.id,
      req.user?.id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update vacation' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Vacation not found or unauthorized' });
      }

      res.json({ message: 'Vacation updated successfully' });
    }
  );
});

// Delete vacation
router.delete('/:id', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.run(
    'DELETE FROM vacations WHERE id = ? AND user_id = ?',
    [req.params.id, req.user?.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete vacation' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Vacation not found or unauthorized' });
      }

      res.json({ message: 'Vacation deleted successfully' });
    }
  );
});

export { router as vacationRoutes };