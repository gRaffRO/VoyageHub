import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Database {
  private static instance: sqlite3.Database;
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    // Ensure the server directory exists
    if (!fs.existsSync(__dirname)) {
      fs.mkdirSync(__dirname, { recursive: true });
    }
    
    const dbPath = path.resolve(__dirname, 'voyagehub.db');
    console.log('Initializing database at:', dbPath);
    
    return new Promise<void>((resolve, reject) => {
      // Enable verbose mode for debugging
      sqlite3.verbose();
      
      this.instance = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.isInitialized = true;
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  static getInstance(): sqlite3.Database {
    if (!this.instance) {
      throw new Error('Database not initialized. Call Database.initialize() first.');
    }
    return this.instance;
  }

  private static createTables(): Promise<void> {
    const db = this.instance;
    
    console.log('Creating database tables...');

    return new Promise<void>((resolve, reject) => {
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err);
          reject(err);
          return;
        }

        const tables = [
          {
            name: 'users',
            sql: `CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              first_name TEXT NOT NULL,
              last_name TEXT NOT NULL,
              avatar TEXT,
              preferences TEXT DEFAULT '{}',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
          },
          {
            name: 'vacations',
            sql: `CREATE TABLE IF NOT EXISTS vacations (
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
            )`
          },
          {
            name: 'tasks',
            sql: `CREATE TABLE IF NOT EXISTS tasks (
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
            )`
          },
          {
            name: 'budgets',
            sql: `CREATE TABLE IF NOT EXISTS budgets (
              id TEXT PRIMARY KEY,
              vacation_id TEXT NOT NULL,
              total_budget DECIMAL(10,2) DEFAULT 0,
              currency TEXT DEFAULT 'USD',
              categories TEXT DEFAULT '[]',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (vacation_id) REFERENCES vacations (id)
            )`
          },
          {
            name: 'expenses',
            sql: `CREATE TABLE IF NOT EXISTS expenses (
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
            )`
          },
          {
            name: 'documents',
            sql: `CREATE TABLE IF NOT EXISTS documents (
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
            )`
          },
          {
            name: 'notifications',
            sql: `CREATE TABLE IF NOT EXISTS notifications (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              type TEXT NOT NULL,
              title TEXT NOT NULL,
              message TEXT NOT NULL,
              read BOOLEAN DEFAULT 0,
              action_url TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users (id)
            )`
          }
        ];

        let completed = 0;
        let hasError = false;

        const checkComplete = () => {
          completed++;
          if (completed === tables.length && !hasError) {
            this.createIndexes()
              .then(() => {
                console.log('Database initialization complete');
                resolve();
              })
              .catch(reject);
          }
        };

        tables.forEach(table => {
          db.run(table.sql, (err) => {
            if (err) {
              console.error(`Error creating ${table.name} table:`, err);
              hasError = true;
              reject(err);
            } else {
              console.log(`${table.name} table created/verified`);
              checkComplete();
            }
          });
        });
      });
    });
  }

  private static createIndexes(): Promise<void> {
    const db = this.instance;
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_vacations_user_id ON vacations (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_vacation_id ON tasks (vacation_id)',
      'CREATE INDEX IF NOT EXISTS idx_budgets_vacation_id ON budgets (vacation_id)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses (budget_id)',
      'CREATE INDEX IF NOT EXISTS idx_documents_vacation_id ON documents (vacation_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id)'
    ];

    return new Promise<void>((resolve, reject) => {
      let completed = 0;
      let hasError = false;

      const checkComplete = () => {
        completed++;
        if (completed === indexes.length && !hasError) {
          resolve();
        }
      };

      indexes.forEach((indexSQL, i) => {
        db.run(indexSQL, (err) => {
          if (err) {
            console.error(`Error creating index ${i + 1}:`, err);
            hasError = true;
            reject(err);
          } else {
            console.log(`Index ${i + 1} created/verified`);
            checkComplete();
          }
        });
      });
    });
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