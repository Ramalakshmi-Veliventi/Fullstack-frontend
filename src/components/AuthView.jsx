import { useEffect, useState } from 'react'

export function AuthView({ onLogin, onRegister, loading, registerSuccessSignal, error, message }) {
  const [authMode, setAuthMode] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
    phone: '',
    village: '',
  })

  useEffect(() => {
    if (registerSuccessSignal > 0) {
      setAuthMode('login')
    }
  }, [registerSuccessSignal])

  function submitLogin(event) {
    event.preventDefault()
    onLogin(loginForm)
  }

  function submitRegister(event) {
    event.preventDefault()
    onRegister(registerForm)
  }

  return (
    <section className="auth-card">
      <div className="auth-toggle">
        <button
          type="button"
          className={authMode === 'login' ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => setAuthMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={authMode === 'register' ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => setAuthMode('register')}
        >
          Register
        </button>
      </div>

      {authMode === 'login' ? (
        <form className="auth-form" onSubmit={submitLogin}>
          <h2>Login to your workspace</h2>
          {message ? <div className="inline-banner success">{message}</div> : null}
          {error ? <div className="inline-banner error">{error}</div> : null}
          <label>
            Email
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              required
            />
          </label>
          <button className="primary-btn full-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Login'}
          </button>
          <div className="demo-box">
            <strong>Demo users</strong>
            <span>admin@swadesh.com / admin123</span>
            <span>farmer@swadesh.com / farmer123</span>
            <span>buyer@swadesh.com / buyer123</span>
          </div>
        </form>
      ) : (
        <form className="auth-form" onSubmit={submitRegister}>
          <h2>Create a new account</h2>
          {message ? <div className="inline-banner success">{message}</div> : null}
          {error ? <div className="inline-banner error">{error}</div> : null}
          <label>
            Name
            <input
              type="text"
              value={registerForm.name}
              onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
              required
            />
          </label>
          <label>
            Role
            <select
              value={registerForm.role}
              onChange={(event) => setRegisterForm({ ...registerForm, role: event.target.value })}
            >
              <option value="BUYER">Buyer</option>
              <option value="FARMER">Farmer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label>
            Phone
            <input
              type="text"
              value={registerForm.phone}
              onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
            />
          </label>
          <label>
            Village / City
            <input
              type="text"
              value={registerForm.village}
              onChange={(event) => setRegisterForm({ ...registerForm, village: event.target.value })}
            />
          </label>
          <button className="primary-btn full-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Register'}
          </button>
        </form>
      )}
    </section>
  )
}
