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
        body{background:#05060b;color:#eef1ff;font-family:var(--font-syne),sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;cursor:auto !important;overflow-x:hidden;}
        body::before{display:none !important;}
        .box{position:relative;z-index:2;width:100%;max-width:420px;padding:2.5rem;border:1px solid rgba(110,122,255,.22);background:rgba(9,11,20,.62);backdrop-filter:blur(14px);clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px));animation:boxIn .5s ease both;}
        @keyframes boxIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
        h1{font-family:var(--font-mono),monospace;font-size:1.4rem;margin-bottom:.3rem;background:linear-gradient(120deg,#2e8bff,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent;}
        p{color:#9aa3c0;font-size:.85rem;margin-bottom:2rem;}
        label{display:block;font-size:.72rem;color:#6b7292;letter-spacing:.14em;text-transform:uppercase;font-family:var(--font-mono),monospace;margin-bottom:.45rem;}
        input{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(122,140,255,.16);color:#eef1ff;padding:.85rem 1rem;font-family:var(--font-mono),monospace;font-size:.9rem;outline:none;transition:border-color .2s;margin-bottom:1.2rem;}
        input:focus{border-color:#6d5cff;box-shadow:0 0 0 3px rgba(110,122,255,.14);}
        .btn{width:100%;background:linear-gradient(135deg,#2e8bff,#8b5cf6);color:#fff;border:none;padding:.9rem;font-family:var(--font-syne),sans-serif;font-weight:800;font-size:.92rem;cursor:pointer;letter-spacing:.06em;text-transform:uppercase;transition:all .25s;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));}
        .btn:hover:not(:disabled){filter:brightness(1.1);box-shadow:0 0 30px rgba(110,122,255,.4);} .btn:disabled{opacity:.6;cursor:not-allowed;}
        .err{background:rgba(255,94,87,.08);border:1px solid rgba(255,94,87,.3);color:#ff8a85;padding:.8rem;margin-bottom:1.2rem;font-size:.85rem;font-family:var(--font-mono),monospace;}
        .back{display:block;text-align:center;margin-top:1.5rem;color:#6b7292;font-size:.8rem;text-decoration:none;font-family:var(--font-mono),monospace;}
        .back:hover{color:#8b5cf6;}
      `}</style>
      <div className="aurora" aria-hidden="true">
        <span className="orb orb1" />
        <span className="orb orb2" />
        <span className="orb orb3" />
      </div>
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
