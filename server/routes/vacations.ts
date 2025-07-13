import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

const getTravelTypeCategories = (travelType: string) => {
  const allCategories = [
    // Transportation
    { id: '1', name: 'Airplane Tickets', allocated: 0, spent: 0, color: 'bg-blue-500' },
    { id: '2', name: 'Train Tickets', allocated: 0, spent: 0, color: 'bg-indigo-500' },
    { id: '3', name: 'Bus/Coach', allocated: 0, spent: 0, color: 'bg-cyan-500' },
    { id: '4', name: 'Car Rental', allocated: 0, spent: 0, color: 'bg-teal-500' },
    { id: '5', name: 'Taxi/Uber/Local Transport', allocated: 0, spent: 0, color: 'bg-sky-500' },
    
    // Accommodation
    { id: '6', name: 'Hotels', allocated: 0, spent: 0, color: 'bg-green-500' },
    { id: '7', name: 'Airbnb/Vacation Rentals', allocated: 0, spent: 0, color: 'bg-emerald-500' },
    { id: '8', name: 'Hostels', allocated: 0, spent: 0, color: 'bg-lime-500' },
    
    // Food & Dining
    { id: '9', name: 'Restaurants', allocated: 0, spent: 0, color: 'bg-yellow-500' },
    { id: '10', name: 'Street Food/Local Cuisine', allocated: 0, spent: 0, color: 'bg-amber-500' },
    { id: '11', name: 'Groceries', allocated: 0, spent: 0, color: 'bg-orange-500' },
    { id: '12', name: 'Drinks/Beverages', allocated: 0, spent: 0, color: 'bg-red-500' },
    
    // Activities & Entertainment
    { id: '13', name: 'Tours & Excursions', allocated: 0, spent: 0, color: 'bg-purple-500' },
    { id: '14', name: 'Museums & Attractions', allocated: 0, spent: 0, color: 'bg-violet-500' },
    { id: '15', name: 'Entertainment/Shows', allocated: 0, spent: 0, color: 'bg-fuchsia-500' },
    { id: '16', name: 'Adventure Sports', allocated: 0, spent: 0, color: 'bg-pink-500' },
    
    // Technology & Communication
    { id: '17', name: 'eSIM/Mobile Data', allocated: 0, spent: 0, color: 'bg-slate-500' },
    { id: '18', name: 'WiFi/Internet', allocated: 0, spent: 0, color: 'bg-gray-500' },
    
    // Travel Essentials
    { id: '19', name: 'Travel Insurance', allocated: 0, spent: 0, color: 'bg-zinc-500' },
    { id: '20', name: 'Visa/Documentation', allocated: 0, spent: 0, color: 'bg-stone-500' },
    { id: '21', name: 'Luggage/Travel Gear', allocated: 0, spent: 0, color: 'bg-neutral-500' },
    
    // Shopping & Souvenirs
    { id: '22', name: 'Souvenirs', allocated: 0, spent: 0, color: 'bg-rose-500' },
    { id: '23', name: 'Clothing/Shopping', allocated: 0, spent: 0, color: 'bg-pink-400' },
    
    // Emergency & Miscellaneous
    { id: '24', name: 'Emergency Fund', allocated: 0, spent: 0, color: 'bg-red-600' },
    { id: '25', name: 'Tips & Service Charges', allocated: 0, spent: 0, color: 'bg-yellow-600' },
    { id: '26', name: 'Miscellaneous', allocated: 0, spent: 0, color: 'bg-gray-600' },
  ];

  const travelTypeCategories = {
    domestic: [
      'Train Tickets', 'Bus/Coach', 'Car Rental', 'Taxi/Uber/Local Transport',
      'Hotels', 'Airbnb/Vacation Rentals', 'Restaurants', 'Street Food/Local Cuisine',
      'Groceries', 'Tours & Excursions', 'Museums & Attractions', 'Souvenirs',
      'Emergency Fund', 'Miscellaneous'
    ],
    continental: [
      'Airplane Tickets', 'Train Tickets', 'Car Rental', 'Taxi/Uber/Local Transport',
      'Hotels', 'Airbnb/Vacation Rentals', 'Restaurants', 'Street Food/Local Cuisine',
      'Groceries', 'Tours & Excursions', 'Museums & Attractions', 'eSIM/Mobile Data',
      'Travel Insurance', 'Souvenirs', 'Emergency Fund', 'Miscellaneous'
    ],
    intercontinental: [
      'Airplane Tickets', 'Taxi/Uber/Local Transport', 'Hotels', 'Airbnb/Vacation Rentals',
      'Restaurants', 'Street Food/Local Cuisine', 'Groceries', 'Tours & Excursions',
      'Museums & Attractions', 'Entertainment/Shows', 'eSIM/Mobile Data', 'WiFi/Internet',
      'Travel Insurance', 'Visa/Documentation', 'Luggage/Travel Gear', 'Souvenirs',
      'Clothing/Shopping', 'Emergency Fund', 'Tips & Service Charges', 'Miscellaneous'
    ]
  };

  const selectedCategories = travelTypeCategories[travelType as keyof typeof travelTypeCategories] || travelTypeCategories.domestic;
  
  return allCategories.filter(category => selectedCategories.includes(category.name));
};

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
          categories: JSON.parse(row.categories || '[]'),
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
  const { title, description, startDate, endDate, destinations = [], collaborators = [], travelType = 'domestic' } = req.body;
  
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: 'Title, start date, and end date are required' });
  }

  const db = Database.getInstance();
  const vacationId = uuidv4();
  const budgetId = uuidv4();
  const categories = getTravelTypeCategories(travelType);
  
  db.run(
    'INSERT INTO vacations (id, user_id, title, description, start_date, end_date, destinations, collaborators) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [vacationId, req.user?.id, title, description, startDate, endDate, JSON.stringify(destinations), JSON.stringify(collaborators)],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create vacation' });
      }

      // Create associated budget
      db.run(
        'INSERT INTO budgets (id, vacation_id, categories) VALUES (?, ?, ?)',
        [budgetId, vacationId, JSON.stringify(categories)],
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
              categories,
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
          categories: JSON.parse(row.categories || '[]'),
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
  console.log('🔄 [Server] DELETE vacation request for ID:', req.params.id, 'by user:', req.user?.id);
  
  const db = Database.getInstance();
  
  // First check if vacation exists and belongs to user
  db.get(
    'SELECT id, title FROM vacations WHERE id = ? AND user_id = ?',
    [req.params.id, req.user?.id],
    (err, row: any) => {
      if (err) {
        console.error('❌ [Server] Database error checking vacation:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        console.log('❌ [Server] Vacation not found or unauthorized');
        return res.status(404).json({ error: 'Vacation not found or unauthorized' });
      }
      
      console.log('✅ [Server] Found vacation to delete:', row.title);
      
      // Delete related data first to avoid foreign key constraints
      console.log('🔄 [Server] Deleting related data...');
      
      // Delete tasks first
      db.run('DELETE FROM tasks WHERE vacation_id = ?', [req.params.id], (taskErr) => {
        if (taskErr) {
          console.error('❌ [Server] Error deleting tasks:', taskErr);
        } else {
          console.log('✅ [Server] Tasks deleted');
        }
        
        // Delete documents
        db.run('DELETE FROM documents WHERE vacation_id = ?', [req.params.id], (docErr) => {
          if (docErr) {
            console.error('❌ [Server] Error deleting documents:', docErr);
          } else {
            console.log('✅ [Server] Documents deleted');
          }
          
          // Delete budget and expenses
          db.get('SELECT id FROM budgets WHERE vacation_id = ?', [req.params.id], (budgetErr, budgetRow: any) => {
            if (budgetErr) {
              console.error('❌ [Server] Error finding budget:', budgetErr);
            }
            
            if (budgetRow) {
              // Delete expenses first
              db.run('DELETE FROM expenses WHERE budget_id = ?', [budgetRow.id], (expenseErr) => {
                if (expenseErr) {
                  console.error('❌ [Server] Error deleting expenses:', expenseErr);
                } else {
                  console.log('✅ [Server] Expenses deleted');
                }
                
                // Delete budget
                db.run('DELETE FROM budgets WHERE vacation_id = ?', [req.params.id], (budgetDelErr) => {
                  if (budgetDelErr) {
                    console.error('❌ [Server] Error deleting budget:', budgetDelErr);
                  } else {
                    console.log('✅ [Server] Budget deleted');
                  }
                  
                  // Finally delete the vacation
                  deleteVacationRecord();
                });
              });
            } else {
              console.log('ℹ️ [Server] No budget found for vacation');
              // No budget found, proceed to delete vacation
              deleteVacationRecord();
            }
          });
        });
      });
      
      function deleteVacationRecord() {
        console.log('🔄 [Server] Deleting vacation record...');
        db.run(
          'DELETE FROM vacations WHERE id = ? AND user_id = ?',
          [req.params.id, req.user?.id],
          function(deleteErr) {
            if (deleteErr) {
              console.error('❌ [Server] Error deleting vacation:', deleteErr);
              return res.status(500).json({ error: 'Failed to delete vacation: ' + deleteErr.message });
            }
            
            if (this.changes === 0) {
              console.log('❌ [Server] No vacation was deleted');
              return res.status(404).json({ error: 'Vacation not found or unauthorized' });
            }
            
            console.log('✅ [Server] Vacation deleted successfully, changes:', this.changes);
            res.json({ message: 'Vacation deleted successfully' });
          }
        );
      }
    }
  );
});

export { router as vacationRoutes };