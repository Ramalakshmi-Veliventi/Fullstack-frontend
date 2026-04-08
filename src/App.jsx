import { useEffect, useState } from 'react'
import './App.css'
import { apiRequest } from './services/api'
import { AuthView } from './components/AuthView'
import { AdminDashboard } from './components/AdminDashboard'
import { FarmerDashboard } from './components/FarmerDashboard'
import { BuyerDashboard } from './components/BuyerDashboard'

const roleNotes = {
  ADMIN: {
    title: 'Admin Control Room',
    description: 'Manage user accounts, oversee transactions, and maintain the platform ecosystem.',
  },
  FARMER: {
    title: 'Farmer Entrepreneurship Desk',
    description: 'List products, manage inventory, and interact with buyers through live marketplace data.',
  },
  BUYER: {
    title: 'Buyer Marketplace Hub',
    description: 'Browse products, place orders, and share feedback with rural producers.',
  },
}

const landingRoles = [
  {
    title: 'Admin',
    description: 'Manage users, review platform activity, and maintain the overall marketplace.',
    controls: ['User accounts', 'Transactions', 'Platform monitoring'],
  },
  {
    title: 'Farmer',
    description: 'List value-added products, manage inventory, and monitor buyer orders.',
    controls: ['Product listing', 'Inventory control', 'Buyer interaction'],
  },
  {
    title: 'Buyer',
    description: 'Browse products, place orders, and provide feedback to rural entrepreneurs.',
    controls: ['Product discovery', 'Order placement', 'Ratings and feedback'],
  },
]

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('swadesh-user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [registerSuccessCount, setRegisterSuccessCount] = useState(0)
  const [adminData, setAdminData] = useState({
    dashboard: null,
    users: [],
    products: [],
    orders: [],
    feedback: [],
  })
  const [farmerData, setFarmerData] = useState({ products: [], orders: [] })
  const [buyerData, setBuyerData] = useState({ products: [], orders: [], feedback: [] })

  async function loadAdminData() {
    const [dashboard, users, products, orders, feedback] = await Promise.all([
      apiRequest('/admin/dashboard'),
      apiRequest('/admin/users'),
      apiRequest('/admin/products'),
      apiRequest('/admin/orders'),
      apiRequest('/admin/feedback'),
    ])

    setAdminData({ dashboard, users, products, orders, feedback })
  }

  async function loadFarmerData(userId) {
    const [products, orders] = await Promise.all([
      apiRequest(`/farmer/products/${userId}`),
      apiRequest(`/farmer/orders/${userId}`),
    ])
    setFarmerData({ products, orders })
  }

  async function loadBuyerData(userId) {
    const [products, orders] = await Promise.all([
      apiRequest('/buyer/products'),
      apiRequest(`/buyer/orders/${userId}`),
    ])
    setBuyerData((previous) => ({ ...previous, products, orders }))
  }

  async function refreshData(user = currentUser) {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      if (user.role === 'ADMIN') {
        await loadAdminData()
      }
      if (user.role === 'FARMER') {
        await loadFarmerData(user.id)
      }
      if (user.role === 'BUYER') {
        await loadBuyerData(user.id)
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [currentUser])

  async function handleLogin(loginForm) {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })
      setCurrentUser(response.user)
      localStorage.setItem('swadesh-user', JSON.stringify(response.user))
      setMessage(`Welcome back, ${response.user.name}`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(registerForm) {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const user = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      })
      setMessage(`Registration completed for ${user.name}. You can login now.`)
      setRegisterSuccessCount((count) => count + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('swadesh-user')
    setCurrentUser(null)
    setMessage('Logged out successfully')
    setError('')
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <nav className="topbar">
          <div className="brand">
            <div className="brand-mark">SG</div>
            <div>
              <p className="brand-name">Swadesh Group</p>
              <span className="brand-copy">Value-added agriculture for rural entrepreneurship</span>
            </div>
          </div>
          <div className="top-actions">
            {currentUser ? (
              <>
                <span className="user-pill">{currentUser.name} | {currentUser.role}</span>
                <button className="ghost-btn" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </nav>

        <section className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Full-stack rural entrepreneurship platform</span>
            <h1>Support farmers to create value-added products and connect with global buyers.</h1>
            <p>
              Swadesh Group helps farmers turn crops into processed foods and handmade goods,
              gives buyers a trusted marketplace, and equips admins to keep the platform healthy.
            </p>
            <div className="hero-stats">
              <article>
                <strong>Admin</strong>
                <span>Manage platform operations</span>
              </article>
              <article>
                <strong>Farmer</strong>
                <span>List and manage products</span>
              </article>
              <article>
                <strong>Buyer</strong>
                <span>Order and review products</span>
              </article>
            </div>
          </div>

          {!currentUser ? (
            <AuthView
              onLogin={handleLogin}
              onRegister={handleRegister}
              loading={loading}
              registerSuccessSignal={registerSuccessCount}
              error={error}
              message={message}
            />
          ) : (
            <section className="hero-note">
              <span className="eyebrow alt">{currentUser.role} workspace active</span>
              <h2>{roleNotes[currentUser.role]?.title}</h2>
              <p>{roleNotes[currentUser.role]?.description}</p>
              <button className="primary-btn" type="button" onClick={() => refreshData()}>
                Refresh Data
              </button>
            </section>
          )}
        </section>
      </header>

      {(message || error) && (
        <section className="status-wrap">
          {message ? <div className="status-banner success">{message}</div> : null}
          {error ? <div className="status-banner error">{error}</div> : null}
        </section>
      )}

      {!currentUser ? (
        <main className="landing-content">
          <section className="project-strip">
            <div className="strip-card">
              <span className="eyebrow">Project Goal</span>
              <h2>Promoting rural entrepreneurship through value-added agricultural products.</h2>
              <p>
                The platform helps farmers convert crops into processed foods and handmade goods,
                connects them with buyers, and gives admins full control over the system.
              </p>
            </div>
          </section>

          <section className="info-grid">
            {landingRoles.map((item) => (
              <article className="info-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="chip-row">
                  {item.controls.map((control) => (
                    <span className="chip" key={control}>
                      {control}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </main>
      ) : (
        <main className="dashboard-shell">
          {loading ? <div className="loading-card">Loading live data from backend...</div> : null}
          {currentUser.role === 'ADMIN' ? (
            <AdminDashboard
              adminData={adminData}
              onRefresh={() => refreshData()}
              setError={setError}
              setMessage={setMessage}
              setLoading={setLoading}
            />
          ) : null}
          {currentUser.role === 'FARMER' ? (
            <FarmerDashboard
              currentUser={currentUser}
              farmerData={farmerData}
              onRefresh={() => refreshData()}
              setError={setError}
              setMessage={setMessage}
              setLoading={setLoading}
            />
          ) : null}
          {currentUser.role === 'BUYER' ? (
            <BuyerDashboard
              currentUser={currentUser}
              buyerData={buyerData}
              setBuyerData={setBuyerData}
              onRefresh={() => refreshData()}
              setError={setError}
              setMessage={setMessage}
              setLoading={setLoading}
            />
          ) : null}
        </main>
      )}
    </div>
  )
}

export default App
