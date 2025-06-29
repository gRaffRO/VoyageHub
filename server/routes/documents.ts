import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Database } from '../database';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'));
    }
  }
});

// Get documents for vacation
router.get('/', (req: AuthRequest, res) => {
  const { vacationId } = req.query;
  
  if (!vacationId) {
    return res.status(400).json({ error: 'Vacation ID is required' });
  }

  const db = Database.getInstance();
  
  db.all(
    'SELECT * FROM documents WHERE vacation_id = ? ORDER BY created_at DESC',
    [vacationId],
    (err, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const documents = rows.map(row => ({
        id: row.id,
        vacationId: row.vacation_id,
        title: row.title,
        type: row.type,
        fileName: row.file_name,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        expirationDate: row.expiration_date,
        sharedWith: JSON.parse(row.shared_with || '[]'),
        uploadedBy: row.uploaded_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      res.json(documents);
    }
  );
});

// Upload document
router.post('/upload', upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { vacationId, title, type, expirationDate } = req.body;
  
  if (!vacationId || !title || !type) {
    return res.status(400).json({ error: 'Vacation ID, title, and type are required' });
  }

  const db = Database.getInstance();
  const documentId = uuidv4();
  const fileUrl = `/uploads/documents/${req.file.filename}`;
  
  db.run(
    'INSERT INTO documents (id, vacation_id, title, type, file_name, file_url, file_size, mime_type, expiration_date, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      documentId,
      vacationId,
      title,
      type,
      req.file.originalname,
      fileUrl,
      req.file.size,
      req.file.mimetype,
      expirationDate,
      req.user?.id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save document' });
      }

      const document = {
        id: documentId,
        vacationId,
        title,
        type,
        fileName: req.file!.originalname,
        fileUrl,
        fileSize: req.file!.size,
        mimeType: req.file!.mimetype,
        expirationDate,
        sharedWith: [],
        uploadedBy: req.user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      res.status(201).json(document);
    }
  );
});

// Update document
router.patch('/:id', (req: AuthRequest, res) => {
  const { title, type, expirationDate, sharedWith } = req.body;
  const db = Database.getInstance();
  
  db.run(
    `UPDATE documents SET 
     title = COALESCE(?, title),
     type = COALESCE(?, type),
     expiration_date = COALESCE(?, expiration_date),
     shared_with = COALESCE(?, shared_with),
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      title,
      type,
      expirationDate,
      sharedWith ? JSON.stringify(sharedWith) : null,
      req.params.id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update document' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({ message: 'Document updated successfully' });
    }
  );
});

// Delete document
router.delete('/:id', (req: AuthRequest, res) => {
  const db = Database.getInstance();
  
  // First get the document to delete the file
  db.get(
    'SELECT file_url FROM documents WHERE id = ?',
    [req.params.id],
    (err, row: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete the file
      const filePath = path.resolve(process.cwd(), row.file_url.replace(/^\//, ''));
      fs.unlink(filePath, (fileErr) => {
        if (fileErr) {
          console.error('Failed to delete file:', fileErr);
        }
      });

      // Delete from database
      db.run(
        'DELETE FROM documents WHERE id = ?',
        [req.params.id],
        function(deleteErr) {
          if (deleteErr) {
            return res.status(500).json({ error: 'Failed to delete document' });
          }

          res.json({ message: 'Document deleted successfully' });
        }
      );
    }
  );
});

// Serve uploaded files
router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve(process.cwd(), 'uploads', 'documents', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export { router as documentRoutes };