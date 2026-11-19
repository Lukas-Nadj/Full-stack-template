import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from './db.js'

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(cors())
app.use(express.json())

export interface ItemRow extends RowDataPacket {
  id: number
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

// Health check endpoint (checks API and DB status)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 AS healthy')
    res.json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      result: rows,
    })
  } catch (error) {
    console.error('Database connection error in /api/health:', error)
    res.status(500).json({
      status: 'error',
      db: 'disconnected',
      error: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString(),
    })
  }
})

// GET /api/items - list items
app.get('/api/items', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<ItemRow[]>('SELECT * FROM items ORDER BY id DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching items:', error)
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

// POST /api/items - create item
app.post('/api/items', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const cleanTitle = title.trim()
    const cleanDesc = typeof description === 'string' && description.trim() ? description.trim() : null

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO items (title, description) VALUES (?, ?)',
      [cleanTitle, cleanDesc]
    )

    res.status(201).json({
      id: result.insertId,
      title: cleanTitle,
      description: cleanDesc,
    })
  } catch (error) {
    console.error('Error creating item:', error)
    res.status(500).json({ error: 'Failed to create item' })
  }
})

// DELETE /api/items/:id - delete item
app.delete('/api/items/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM items WHERE id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' })
    }

    res.json({ success: true, deletedId: id })
  } catch (error) {
    console.error('Error deleting item:', error)
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

// 404 handler for unknown API routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`Backend API listening on port ${port}`)
})
