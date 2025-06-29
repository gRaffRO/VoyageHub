import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get budget for vacation
router.get('/:vacationId', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.get(
    'SELECT * FROM budgets WHERE vacation_id = ?',
    [req.params.vacationId],
    (err, budgetRow: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!budgetRow) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      // Get expenses for this budget
      db.all(
        'SELECT * FROM expenses WHERE budget_id = ? ORDER BY date DESC',
        [budgetRow.id],
        (expenseErr, expenseRows: any[]) => {
          if (expenseErr) {
            return res.status(500).json({ error: 'Database error' });
          }

          const expenses = expenseRows.map(row => ({
            id: row.id,
            budgetId: row.budget_id,
            categoryId: row.category_id,
            title: row.title,
            amount: parseFloat(row.amount),
            currency: row.currency,
            date: row.date,
            receipt: row.receipt,
            description: row.description,
            createdAt: row.created_at,
          }));

          const budget = {
            id: budgetRow.id,
            vacationId: budgetRow.vacation_id,
            totalBudget: parseFloat(budgetRow.total_budget),
            currency: budgetRow.currency,
            categories: JSON.parse(budgetRow.categories || '[]'),
            expenses,
            createdAt: budgetRow.created_at,
            updatedAt: budgetRow.updated_at,
          };

          res.json(budget);
        }
      );
    }
  );
});

// Update budget
router.patch('/:vacationId', (req: AuthRequest, res) => {
  const { totalBudget, currency, categories } = req.body;
  const db = Database.getInstance();
  
  db.run(
    `UPDATE budgets SET 
     total_budget = COALESCE(?, total_budget),
     currency = COALESCE(?, currency),
     categories = ?,
     updated_at = CURRENT_TIMESTAMP
     WHERE vacation_id = ?`,
    [
      totalBudget,
      currency,
      JSON.stringify(categories || []),
      req.params.vacationId
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update budget' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      res.json({ message: 'Budget updated successfully' });
    }
  );
});

// Add expense
router.post('/:vacationId/expenses', (req: AuthRequest, res) => {
  const { categoryId, title, amount, currency = 'USD', date, receipt, description } = req.body;
  
  if (!title || !amount || !date) {
    return res.status(400).json({ error: 'Title, amount, and date are required' });
  }

  const db = Database.getInstance();
  
  // First, get the budget ID
  db.get(
    'SELECT id FROM budgets WHERE vacation_id = ?',
    [req.params.vacationId],
    (err, budgetRow: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!budgetRow) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      const expenseId = uuidv4();
      
      db.run(
        'INSERT INTO expenses (id, budget_id, category_id, title, amount, currency, date, receipt, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [expenseId, budgetRow.id, categoryId, title, amount, currency, date, receipt, description],
        function(expenseErr) {
          if (expenseErr) {
            return res.status(500).json({ error: 'Failed to create expense' });
          }

          const expense = {
            id: expenseId,
            budgetId: budgetRow.id,
            categoryId,
            title,
            amount: parseFloat(amount),
            currency,
            date,
            receipt,
            description,
            createdAt: new Date().toISOString(),
          };

          res.status(201).json(expense);
        }
      );
    }
  );
});

// Update expense
router.patch('/expenses/:id', (req: AuthRequest, res) => {
  const { categoryId, title, amount, currency, date, receipt, description } = req.body;
  const db = Database.getInstance();
  
  db.run(
    `UPDATE expenses SET 
     category_id = COALESCE(?, category_id),
     title = COALESCE(?, title),
     amount = COALESCE(?, amount),
     currency = COALESCE(?, currency),
     date = COALESCE(?, date),
     receipt = COALESCE(?, receipt),
     description = COALESCE(?, description)
     WHERE id = ?`,
    [categoryId, title, amount, currency, date, receipt, description, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update expense' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ message: 'Expense updated successfully' });
    }
  );
});

// Delete expense
router.delete('/expenses/:id', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  db.run(
    'DELETE FROM expenses WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete expense' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ message: 'Expense deleted successfully' });
    }
  );
});

export { router as budgetRoutes };