const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialItems = ['Item 1', 'Item 2', 'Item 3'];
const insertStmt = db.prepare('INSERT INTO items (name, due_date) VALUES (?, ?)');

initialItems.forEach(item => {
  insertStmt.run(item, null);
});

console.log('In-memory database initialized with sample data');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT * FROM items
      ORDER BY due_date IS NULL, due_date ASC, created_at ASC, id ASC
    `).all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name, due_date: dueDate = null } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (!isValidDueDate(dueDate)) {
      return res.status(400).json({ error: 'Due date must be a valid YYYY-MM-DD date' });
    }

    const result = insertStmt.run(name.trim(), dueDate);
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.patch('/api/items/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const hasName = Object.prototype.hasOwnProperty.call(req.body, 'name');
    const hasDueDate = Object.prototype.hasOwnProperty.call(req.body, 'due_date');
    if (!hasName && !hasDueDate) {
      return res.status(400).json({ error: 'At least one item field is required' });
    }

    if (hasName && (typeof req.body.name !== 'string' || req.body.name.trim() === '')) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const dueDate = hasDueDate ? req.body.due_date : null;
    if (hasDueDate && !isValidDueDate(dueDate)) {
      return res.status(400).json({ error: 'Due date must be a valid YYYY-MM-DD date' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db.prepare(`
      UPDATE items
      SET name = ?, due_date = ?
      WHERE id = ?
    `).run(
      hasName ? req.body.name.trim() : existingItem.name,
      hasDueDate ? dueDate : existingItem.due_date,
      id
    );

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

function isValidDueDate(value) {
  if (value === null) {
    return true;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().startsWith(value);
}

module.exports = { app, db, insertStmt };