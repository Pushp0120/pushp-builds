'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', reviewing: '#3b82f6', quoted: '#8b5cf6',
  accepted: '#06b6d4', in_progress: '#ff6b35', completed: '#00d4aa', rejected: '#ef4444'
}
const STATUSES = Object.keys(STATUS_COLORS)

type Project = {
  id: number; name: string; email: string; phone: string; project_type: string;
  project_name: string; description: string; features: string; budget_range: string;
  timeline: string; reference_links: string; status: string; admin_notes: string;
  quoted_price: number | null; created_at: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Project | null>(null)
  const [updateForm, setUpdateForm] = useState({ status: '', admin_notes: '', quoted_price: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  async function fetchProjects() {
    const res = await fetch('/api/admin/projects' + (filter ? `?status=${filter}` : ''))
    if (res.status === 401) { router.push('/admin'); return }
    const data = await res.json()
    setProjects(data)
  }

  useEffect(() => { fetchProjects() }, [filter])

  function openProject(p: Project) {
    setSelected(p)
    setUpdateForm({ status: p.status, admin_notes: p.admin_notes || '', quoted_price: p.quoted_price?.toString() || '' })
    setMsg('')
  }

  async function saveProject() {
    if (!selected) return
    setSaving(true)
    const res = await fetch('/api/admin/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, ...updateForm })
    })
    const data = await res.json()
    if (data.success) {
      setMsg('✓ Project updated successfully!')
      fetchProjects()
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  async function logout() {
    await fetch('/api/admin', { method: 'DELETE' })
    router.push('/admin')
  }

  const stats = STATUSES.reduce((acc, s) => ({ ...acc, [s]: projects.filter(p => p.status === s).length }), {} as Record<string, number>)

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--black:#0a0a0a;--surface:#111;--surface2:#1a1a1a;--border:rgba(255,255,255,.07);--accent:#ff6b35;--accent2:#00d4aa;--white:#f5f5f0;--gray:#666;--gray2:#999;}
        body{background:var(--black);color:var(--white);font-family:'Syne',sans-serif;min-height:100vh;display:flex;}
        .sidebar{width:240px;min-height:100vh;background:var(--surface);border-right:1px solid var(--border);padding:1.5rem;flex-shrink:0;display:flex;flex-direction:column;}
        .logo{font-family:var(--font-mono),monospace;font-size:1rem;color:var(--accent);margin-bottom:2rem;}
        .logo span{color:var(--white);}
        .nav a{display:flex;align-items:center;justify-content:space-between;padding:.5rem .8rem;color:var(--gray2);text-decoration:none;font-size:.82rem;border-radius:4px;margin-bottom:.15rem;transition:all .2s;cursor:pointer;}
        .nav a:hover,.nav a.active{background:rgba(255,107,53,.1);color:var(--accent);}
        .sidebar-bottom{margin-top:auto;}
        .logout{display:block;width:100%;padding:.6rem;background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2);font-size:.8rem;cursor:pointer;text-align:center;transition:all .2s;font-family:var(--font-mono),monospace;}
        .logout:hover{background:rgba(239,68,68,.2);}
        .main{flex:1;padding:2rem;overflow-x:hidden;}
        .page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;}
        .page-header h1{font-size:1.5rem;font-weight:800;}
        .page-header span{color:var(--gray2);font-size:.85rem;font-family:var(--font-mono),monospace;}
        .stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:1rem;margin-bottom:2rem;}
        .stat{background:var(--surface);border:1px solid var(--border);padding:1rem;text-align:center;}
        .stat .n{font-family:var(--font-mono),monospace;font-size:1.8rem;font-weight:700;}
        .stat .l{font-size:.7rem;color:var(--gray2);text-transform:uppercase;letter-spacing:.08em;margin-top:.2rem;}
        .alert{background:rgba(0,212,170,.1);border:1px solid rgba(0,212,170,.3);color:var(--accent2);padding:.8rem 1rem;margin-bottom:1.5rem;font-size:.85rem;}
        .table-wrap{background:var(--surface);border:1px solid var(--border);overflow-x:auto;}
        table{width:100%;border-collapse:collapse;}
        th{background:var(--surface2);padding:.8rem 1rem;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--gray2);font-weight:600;white-space:nowrap;}
        td{padding:.8rem 1rem;border-top:1px solid var(--border);font-size:.85rem;vertical-align:middle;}
        tr:hover td{background:rgba(255,255,255,.02);}
        .badge{display:inline-block;padding:.2rem .6rem;font-size:.7rem;font-family:var(--font-mono),monospace;border-radius:2px;text-transform:uppercase;}
        .btn-view{background:rgba(255,107,53,.1);border:1px solid rgba(255,107,53,.3);color:var(--accent);padding:.3rem .7rem;font-size:.75rem;cursor:pointer;font-family:var(--font-mono),monospace;transition:all .2s;}
        .btn-view:hover{background:rgba(255,107,53,.2);}
        .empty{text-align:center;padding:3rem;color:var(--gray);font-family:var(--font-mono),monospace;font-size:.85rem;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:100;display:flex;align-items:flex-start;justify-content:center;padding:2rem;overflow-y:auto;}
        .modal{background:var(--surface);border:1px solid var(--border);width:100%;max-width:700px;padding:2rem;position:relative;margin:auto;}
        .modal-close{position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--gray2);font-size:1.5rem;cursor:pointer;line-height:1;}
        .modal-close:hover{color:var(--accent);}
        .modal h2{font-size:1.2rem;margin-bottom:1.5rem;color:var(--accent);font-family:var(--font-mono),monospace;}
        .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;}
        .detail-item label{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--gray2);display:block;margin-bottom:.2rem;}
        .detail-item p{font-size:.88rem;line-height:1.5;}
        .detail-full{grid-column:1/-1;}
        .update-form{border-top:1px solid var(--border);padding-top:1.5rem;margin-top:1rem;}
        .update-form h3{font-size:.85rem;color:var(--gray2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:1rem;}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;}
        .fg label{display:block;font-size:.72rem;color:var(--gray2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem;}
        select,textarea,input[type=number]{width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--white);padding:.7rem .8rem;font-family:var(--font-mono),monospace;font-size:.85rem;outline:none;transition:border-color .2s;}
        select:focus,textarea:focus,input[type=number]:focus{border-color:var(--accent);}
        textarea{resize:vertical;min-height:80px;}
        .btn-save{background:var(--accent);color:var(--black);border:none;padding:.7rem 1.5rem;font-family:'Syne',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;text-transform:uppercase;letter-spacing:.05em;transition:background .2s;}
        .btn-save:hover:not(:disabled){background:#ff8c5a;} .btn-save:disabled{opacity:.6;cursor:not-allowed;}
        .save-msg{margin-top:.8rem;font-size:.85rem;color:var(--accent2);}
      `}</style>

      <div className="sidebar">
        <div className="logo">dev<span>folio</span> //</div>
        <nav className="nav">
          <a onClick={() => setFilter('')} className={!filter ? 'active' : ''}>📋 All Projects</a>
          {STATUSES.map(s => (
            <a key={s} onClick={() => setFilter(s)} className={filter === s ? 'active' : ''} style={{ color: STATUS_COLORS[s] }}>
              • {s.replace('_', ' ')} <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{stats[s] || 0}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="logout" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="main">
        <div className="page-header">
          <h1>Project Requests</h1>
          <span>Admin Dashboard</span>
        </div>

        <div className="stats">
          <div className="stat"><div className="n">{projects.length}</div><div className="l">Total</div></div>
          {(['pending', 'in_progress', 'completed'] as string[]).map(s => (
            <div className="stat" key={s}><div className="n" style={{ color: STATUS_COLORS[s] }}>{stats[s] || 0}</div><div className="l">{s.replace('_', ' ')}</div></div>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Client</th><th>Project</th><th>Type</th><th>Budget</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan={8}><div className="empty">// No projects found</div></td></tr>
              ) : projects.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gray2)' }}>#{p.id}</td>
                  <td><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--gray2)' }}>{p.email}</div></td>
                  <td>{p.project_name}</td>
                  <td style={{ color: 'var(--accent2)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{p.project_type}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--gray2)' }}>{p.budget_range || '—'}</td>
                  <td>
                    <span className="badge" style={{ background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status], border: `1px solid ${STATUS_COLORS[p.status]}44` }}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--gray2)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td><button className="btn-view" onClick={() => openProject(p)}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            <h2>// PROJECT #{selected.id}</h2>
            <div className="detail-grid">
              <div className="detail-item"><label>Client Name</label><p>{selected.name}</p></div>
              <div className="detail-item"><label>Email</label><p>{selected.email}</p></div>
              <div className="detail-item"><label>Phone</label><p>{selected.phone || '—'}</p></div>
              <div className="detail-item"><label>Project Type</label><p>{selected.project_type}</p></div>
              <div className="detail-item detail-full"><label>Project Name</label><p>{selected.project_name}</p></div>
              <div className="detail-item detail-full"><label>Description</label><p style={{ whiteSpace: 'pre-wrap' }}>{selected.description}</p></div>
              {selected.features && <div className="detail-item detail-full"><label>Features</label><p style={{ whiteSpace: 'pre-wrap' }}>{selected.features}</p></div>}
              <div className="detail-item"><label>Budget</label><p>{selected.budget_range || '—'}</p></div>
              <div className="detail-item"><label>Timeline</label><p>{selected.timeline || '—'}</p></div>
              {selected.quoted_price && <div className="detail-item"><label>Quoted Price</label><p style={{ color: 'var(--accent2)', fontWeight: 700 }}>₹{selected.quoted_price}</p></div>}
            </div>
            <div className="update-form">
              <h3>// Update Project</h3>
              <div className="form-row">
                <div className="fg">
                  <label>Status</label>
                  <select value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Quoted Price (₹)</label>
                  <input type="number" step="0.01" min="0" placeholder="e.g. 5000" value={updateForm.quoted_price} onChange={e => setUpdateForm(f => ({ ...f, quoted_price: e.target.value }))} />
                </div>
              </div>
              <div className="fg" style={{ marginBottom: '1rem' }}>
                <label>Admin Notes</label>
                <textarea value={updateForm.admin_notes} onChange={e => setUpdateForm(f => ({ ...f, admin_notes: e.target.value }))} />
              </div>
              <button className="btn-save" onClick={saveProject} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              {msg && <div className="save-msg">{msg}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
