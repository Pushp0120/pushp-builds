'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const { username, password } = Object.fromEntries(new FormData(e.currentTarget))
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.success) router.push('/admin/dashboard')
    else { setError('Invalid username or password.'); setLoading(false) }
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0a0a0a;color:#f5f5f0;font-family:'Syne',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background-image:radial-gradient(circle at 20% 50%,rgba(255,107,53,.08),transparent 50%),radial-gradient(circle at 80% 20%,rgba(0,212,170,.05),transparent 40%);}
        .box{width:100%;max-width:420px;padding:2.5rem;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);backdrop-filter:blur(10px);}
        h1{font-family:var(--font-mono),monospace;font-size:1.4rem;color:#ff6b35;margin-bottom:.3rem;}
        p{color:#888;font-size:.85rem;margin-bottom:2rem;}
        label{display:block;font-size:.75rem;color:#888;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.4rem;}
        input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#f5f5f0;padding:.8rem 1rem;font-family:var(--font-mono),monospace;font-size:.9rem;outline:none;transition:border-color .2s;margin-bottom:1.2rem;}
        input:focus{border-color:#ff6b35;}
        .btn{width:100%;background:#ff6b35;color:#0a0a0a;border:none;padding:.9rem;font-family:'Syne',sans-serif;font-weight:700;font-size:.95rem;cursor:pointer;letter-spacing:.05em;text-transform:uppercase;transition:background .2s;}
        .btn:hover:not(:disabled){background:#ff8c5a;} .btn:disabled{opacity:.6;cursor:not-allowed;}
        .err{background:rgba(255,107,53,.1);border:1px solid rgba(255,107,53,.3);color:#ff6b35;padding:.8rem;margin-bottom:1.2rem;font-size:.85rem;}
        .back{display:block;text-align:center;margin-top:1.5rem;color:#888;font-size:.8rem;text-decoration:none;}
        .back:hover{color:#00d4aa;}
      `}</style>
      <div className="box">
        <h1>// ADMIN</h1>
        <p>Restricted access. Authorized personnel only.</p>
        {error && <div className="err">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" name="username" required autoComplete="username" />
          <label>Password</label>
          <input type="password" name="password" required autoComplete="current-password" />
          <button type="submit" className="btn" disabled={loading}>{loading ? 'Checking...' : 'Access Dashboard'}</button>
        </form>
        <a href="/" className="back">← Back to site</a>
      </div>
    </>
  )
}
