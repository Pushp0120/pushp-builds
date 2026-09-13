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
        body{background:#05080a;color:#eafff7;font-family:var(--font-syne),sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background-image:radial-gradient(circle at 20% 50%,rgba(45,212,168,.07),transparent 50%),radial-gradient(circle at 80% 20%,rgba(20,184,148,.05),transparent 40%);}
        .box{width:100%;max-width:420px;padding:2.5rem;border:1px solid rgba(45,212,168,.18);background:rgba(10,16,19,.55);backdrop-filter:blur(12px);clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px));}
        h1{font-family:var(--font-mono),monospace;font-size:1.4rem;color:#2dd4a8;margin-bottom:.3rem;}
        p{color:#9db4ac;font-size:.85rem;margin-bottom:2rem;}
        label{display:block;font-size:.72rem;color:#6b837b;letter-spacing:.14em;text-transform:uppercase;font-family:var(--font-mono),monospace;margin-bottom:.45rem;}
        input{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(148,233,208,.12);color:#eafff7;padding:.85rem 1rem;font-family:var(--font-mono),monospace;font-size:.9rem;outline:none;transition:border-color .2s;margin-bottom:1.2rem;}
        input:focus{border-color:#2dd4a8;box-shadow:0 0 0 3px rgba(45,212,168,.12);}
        .btn{width:100%;background:linear-gradient(135deg,#2dd4a8,#14b894);color:#04241c;border:none;padding:.9rem;font-family:var(--font-syne),sans-serif;font-weight:800;font-size:.92rem;cursor:pointer;letter-spacing:.06em;text-transform:uppercase;transition:all .25s;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));}
        .btn:hover:not(:disabled){filter:brightness(1.1);box-shadow:0 0 30px rgba(45,212,168,.35);} .btn:disabled{opacity:.6;cursor:not-allowed;}
        .err{background:rgba(255,94,87,.08);border:1px solid rgba(255,94,87,.3);color:#ff8a85;padding:.8rem;margin-bottom:1.2rem;font-size:.85rem;font-family:var(--font-mono),monospace;}
        .back{display:block;text-align:center;margin-top:1.5rem;color:#6b837b;font-size:.8rem;text-decoration:none;font-family:var(--font-mono),monospace;}
        .back:hover{color:#2dd4a8;}
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
