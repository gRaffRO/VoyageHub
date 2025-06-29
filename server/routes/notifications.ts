import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get notifications for user
router.get('/', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user?.id],
    (err, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const notifications = rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        read: Boolean(row.read),
        actionUrl: row.action_url,
        createdAt: row.created_at,
      }));

      res.json(notifications);
    }
  );
});

// Create notification
router.post('/', (req: AuthRequest, res) => {
  const { userId, type, title, message, actionUrl } = req.body;
  
  if (!userId || !type || !title || !message) {
    return res.status(400).json({ error: 'User ID, type, title, and message are required' });
  }

  const db = Database.getInstance();
  const notificationId = uuidv4();
  
  db.run(
    'INSERT INTO notifications (id, user_id, type, title, message, action_url) VALUES (?, ?, ?, ?, ?, ?)',
    [notificationId, userId, type, title, message, actionUrl],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create notification' });
      }

      const notification = {
        id: notificationId,
        userId,
        type,
        title,
        message,
        read: false,
        actionUrl,
        createdAt: new Date().toISOString(),
      };

      res.status(201).json(notification);
    }
  );
});

// Mark notification as read
router.patch('/:id/read', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.run(
    'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
    [req.params.id, req.user?.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark notification as read' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification marked as read' });
    }
  );
});

// Mark all notifications as read
router.patch('/read-all', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.run(
    'UPDATE notifications SET read = 1 WHERE user_id = ?',
    [req.user?.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark notifications as read' });
      }

      res.json({ message: 'All notifications marked as read' });
    }
  );
});

// Delete notification
router.delete('/:id', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.run(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [req.params.id, req.user?.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete notification' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification deleted successfully' });
    }
  );
});

export { router as notificationRoutes };