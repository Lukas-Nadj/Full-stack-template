import { useState, useEffect } from 'react'

interface Item {
  id: number
  title: string
  description: string | null
  created_at: string
}

interface HealthStatus {
  status: 'ok' | 'error' | 'loading'
  db: 'connected' | 'disconnected' | 'unknown'
  message?: string
}

export default function App() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'loading',
    db: 'unknown',
  })
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch health status
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setHealth({
        status: data.status === 'ok' ? 'ok' : 'error',
        db: data.db === 'connected' ? 'connected' : 'disconnected',
      })
    } catch (err) {
      setHealth({
        status: 'error',
        db: 'disconnected',
        message: err instanceof Error ? err.message : 'API unreachable',
      })
    }
  }

  // Fetch items from DB
  const fetchItems = async () => {
    try {
      setLoadingItems(true)
      const res = await fetch('/api/items')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoadingItems(false)
    }
  }

  useEffect(() => {
    checkHealth()
    fetchItems()
  }, [])

  // Create item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTitle('')
      setDescription('')
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete item
  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div>
          <h1>Full-Stack Starter</h1>
          <p>React + Vite • Node Express API • MySQL 8.4</p>
        </div>
        <div className="status-badge">
          <span
            className={`status-dot ${
              health.status === 'loading'
                ? 'loading'
                : health.db === 'connected'
                ? 'connected'
                : 'disconnected'
            }`}
          />
          <span>
            {health.status === 'loading'
              ? 'Checking status...'
              : health.db === 'connected'
              ? 'Stack Healthy'
              : 'API/DB Offline'}
          </span>
        </div>
      </header>

      {/* Main interactive demo card */}
      <section className="card">
        <div className="card-title">
          <span>Items Database Demo</span>
          <button
            onClick={() => {
              checkHealth()
              fetchItems()
            }}
            className="btn"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
          >
            Refresh
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              color: '#fca5a5',
              fontSize: '0.9rem',
            }}
          >
            Error: {error}
          </div>
        )}

        <form onSubmit={handleAddItem} className="form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Item title (required)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit" className="btn" disabled={submitting || !title.trim()}>
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>

        <div className="items-list">
          {loadingItems ? (
            <div className="empty-state">Loading items from database...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">No items found in database. Add one above!</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="item">
                <div className="item-content">
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                  <div className="item-meta">
                    ID: {item.id} • Added: {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="btn btn-danger"
                  title="Delete item"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Template Architecture Reference */}
      <section className="card">
        <h2 className="card-title" style={{ fontSize: '1.1rem' }}>Project Structure</h2>
        <div className="tech-grid">
          <div className="tech-box">
            <h4>/app</h4>
            <p>React 19 + Vite frontend Single Page App. Served in production via high-performance Nginx reverse proxy.</p>
          </div>
          <div className="tech-box">
            <h4>/api</h4>
            <p>Node.js Express backend with MySQL connection pool. Exposes clean REST endpoints at <span className="code-pill">/api/*</span>.</p>
          </div>
          <div className="tech-box">
            <h4>/db</h4>
            <p>MySQL schema auto-initialization scripts in <span className="code-pill">db/init/</span> and persistent data in <span className="code-pill">db/volume/</span>.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
