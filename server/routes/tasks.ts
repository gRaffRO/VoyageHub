import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get tasks for a vacation
router.get('/', (req: AuthRequest, res) => {
  const { vacationId } = req.query;
  
  if (!vacationId) {
    return res.status(400).json({ error: 'Vacation ID is required' });
  }

  const db = Database.getInstance();
  
  db.all(
    'SELECT * FROM tasks WHERE vacation_id = ? ORDER BY created_at DESC',
    [vacationId],
    (err, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const tasks = rows.map(row => ({
        id: row.id,
        vacationId: row.vacation_id,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assigned_to,
        dueDate: row.due_date,
        completedAt: row.completed_at,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      res.json(tasks);
    }
  );
});

// Create task
router.post('/', (req: AuthRequest, res) => {
  const { vacationId, title, description, priority = 'medium', assignedTo, dueDate } = req.body;
  
  if (!vacationId || !title) {
    return res.status(400).json({ error: 'Vacation ID and title are required' });
  }

  const db = Database.getInstance();
  const taskId = uuidv4();
  
  db.run(
    'INSERT INTO tasks (id, vacation_id, title, description, priority, assigned_to, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [taskId, vacationId, title, description, priority, assignedTo, dueDate, req.user?.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }

      const task = {
        id: taskId,
        vacationId,
        title,
        description,
        status: 'pending',
        priority,
        assignedTo,
        dueDate,
        completedAt: null,
        createdBy: req.user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      res.status(201).json(task);
    }
  );
});

// Update task
router.patch('/:id', (req: AuthRequest, res) => {
  const { title, description, status, priority, assignedTo, dueDate } = req.body;
  const db = Database.getInstance();
  
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  
  db.run(
    `UPDATE tasks SET 
     title = COALESCE(?, title),
     description = COALESCE(?, description),
     status = COALESCE(?, status),
     priority = COALESCE(?, priority),
     assigned_to = COALESCE(?, assigned_to),
     due_date = COALESCE(?, due_date),
     completed_at = ?,
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, description, status, priority, assignedTo, dueDate, completedAt, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update task' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task updated successfully' });
    }
  );
});

// Delete task
router.delete('/:id', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.run(
    'DELETE FROM tasks WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete task' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task deleted successfully' });
    }
  );
});

export { router as taskRoutes };