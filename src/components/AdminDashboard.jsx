import { apiRequest } from '../services/api'

export function AdminDashboard({ adminData, onRefresh, setError, setMessage, setLoading }) {
  const totalRevenue =
    adminData.orders?.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) || 0

  async function handleToggleUser(id) {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/admin/users/${id}/toggle-status`, { method: 'PUT' })
      setMessage('User status updated')
      await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteUser(id) {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/admin/users/${id}`, { method: 'DELETE' })
      setMessage('User deleted successfully')
      await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="dashboard-section">
      <div className="section-head">
        <span>Admin Dashboard</span>
        <h2>Platform oversight and transaction intelligence</h2>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <strong>{adminData.dashboard?.totalUsers ?? 0}</strong>
          <span>Total users</span>
        </article>
        <article className="metric-card">
          <strong>{adminData.dashboard?.totalProducts ?? 0}</strong>
          <span>Products</span>
        </article>
        <article className="metric-card">
          <strong>{adminData.dashboard?.totalOrders ?? 0}</strong>
          <span>Orders</span>
        </article>
        <article className="metric-card">
          <strong>{totalRevenue.toFixed(2)}</strong>
          <span>Revenue tracked</span>
        </article>
      </div>

      <div className="panel-grid">
        <section className="panel-card">
          <h3>Manage user accounts</h3>
          <div className="list-grid">
            {adminData.users.map((user) => (
              <div className="row-card action-row" key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <span>
                    {user.role} | {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="button-group">
                  <button className="ghost-btn small-btn" type="button" onClick={() => handleToggleUser(user.id)}>
                    {user.active ? 'Deactivate' : 'Activate'}
                  </button>
                  {user.role !== 'ADMIN' ? (
                    <button className="danger-btn small-btn" type="button" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <h3>Recent orders</h3>
          <div className="list-grid">
            {adminData.orders.map((order) => (
              <div className="row-card" key={order.id}>
                <strong>{order.product?.name}</strong>
                <span>Buyer: {order.buyer?.name}</span>
                <span>Address: {order.shippingAddress}</span>
                <span>
                  Qty {order.quantity} | {order.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <h3>Products on platform</h3>
          <div className="list-grid">
            {adminData.products.map((product) => (
              <div className="row-card" key={product.id}>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
                <span>Stock: {product.stock}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <h3>Buyer feedback</h3>
          <div className="list-grid">
            {adminData.feedback.map((item) => (
              <div className="row-card" key={item.id}>
                <strong>{item.product?.name}</strong>
                <span>Rating: {item.rating}/5</span>
                <span>{item.comment}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
