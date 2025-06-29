import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Database {
  private static instance: sqlite3.Database;

  static initialize() {
    // Ensure the server directory exists
    if (!fs.existsSync(__dirname)) {
      fs.mkdirSync(__dirname, { recursive: true });
    }
    
    const dbPath = path.resolve(__dirname, 'voyagehub.db');
    console.log('Initializing database at:', dbPath);
    
    // Enable verbose mode for debugging
    sqlite3.verbose();
    
    this.instance = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
    
    this.createTables();
  }

  static getInstance(): sqlite3.Database {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }

  private static createTables() {
    const db = this.instance;
    
    console.log('Creating database tables...');

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        avatar TEXT,
        preferences TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err);
      else console.log('Users table created/verified');
    });

    // Vacations table
    db.run(`
      CREATE TABLE IF NOT EXISTS vacations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT DEFAULT 'planning',
        destinations TEXT DEFAULT '[]',
        collaborators TEXT DEFAULT '[]',
        is_public BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) console.error('Error creating vacations table:', err);
      else console.log('Vacations table created/verified');
    });

    // Tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        vacation_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        assigned_to TEXT,
        due_date DATETIME,
        completed_at DATETIME,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vacation_id) REFERENCES vacations (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `, (err) => {
      if (err) console.error('Error creating tasks table:', err);
      else console.log('Tasks table created/verified');
    });

    // Budgets table
    db.run(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        vacation_id TEXT NOT NULL,
        total_budget DECIMAL(10,2) DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        categories TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vacation_id) REFERENCES vacations (id)
      )
    `, (err) => {
      if (err) console.error('Error creating budgets table:', err);
      else console.log('Budgets table created/verified');
    });

    // Expenses table
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        budget_id TEXT NOT NULL,
        category_id TEXT,
        title TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        date DATE NOT NULL,
        receipt TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (budget_id) REFERENCES budgets (id)
      )
    `, (err) => {
      if (err) console.error('Error creating expenses table:', err);
      else console.log('Expenses table created/verified');
    });

    // Documents table
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        vacation_id TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        expiration_date DATE,
        shared_with TEXT DEFAULT '[]',
        uploaded_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vacation_id) REFERENCES vacations (id),
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
      )
    `, (err) => {
      if (err) console.error('Error creating documents table:', err);
      else console.log('Documents table created/verified');
    });

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) console.error('Error creating notifications table:', err);
      else console.log('Notifications table created/verified');
    });

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_vacations_user_id ON vacations (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_vacation_id ON tasks (vacation_id)',
      'CREATE INDEX IF NOT EXISTS idx_budgets_vacation_id ON budgets (vacation_id)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses (budget_id)',
      'CREATE INDEX IF NOT EXISTS idx_documents_vacation_id ON documents (vacation_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id)'
    ];

    indexes.forEach((indexSQL, i) => {
      db.run(indexSQL, (err) => {
        if (err) console.error(`Error creating index ${i + 1}:`, err);
        else console.log(`Index ${i + 1} created/verified`);
      });
    });

    console.log('Database initialization complete');
  }

  static close() {
    if (this.instance) {
      this.instance.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}