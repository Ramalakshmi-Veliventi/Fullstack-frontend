import { useState } from 'react'
import { apiRequest } from '../services/api'

const emptyProductForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  stock: '',
  origin: '',
  imageUrl: '',
  status: 'AVAILABLE',
}

export function FarmerDashboard({
  currentUser,
  farmerData,
  onRefresh,
  setError,
  setMessage,
  setLoading,
}) {
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [editingProductId, setEditingProductId] = useState(null)

  async function handleAddOrUpdateProduct(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        ...productForm,
        farmerId: currentUser.id,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      }

      if (editingProductId) {
        await apiRequest(`/farmer/products/${editingProductId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setMessage('Product updated successfully')
      } else {
        await apiRequest('/farmer/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setMessage('Product added successfully')
      }

      setProductForm(emptyProductForm)
      setEditingProductId(null)
      await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  function handleEditProduct(product) {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name ?? '',
      category: product.category ?? '',
      description: product.description ?? '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      origin: product.origin ?? '',
      imageUrl: product.imageUrl ?? '',
      status: product.status ?? 'AVAILABLE',
    })
  }

  function handleCancelEdit() {
    setEditingProductId(null)
    setProductForm(emptyProductForm)
  }

  async function handleDeleteProduct(id) {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/farmer/products/${id}`, { method: 'DELETE' })
      setMessage('Product deleted successfully')
      await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkDelivered(orderId) {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/farmer/orders/${orderId}/status?status=DELIVERED`, {
        method: 'PUT',
      })
      setMessage('Order marked as delivered')
      await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAcceptOrder(orderId) {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/farmer/orders/${orderId}/status?status=ACCEPTED`, {
        method: 'PUT',
      })
      setMessage('Order accepted successfully')
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
        <span>Farmer Dashboard</span>
        <h2>Manage your product catalog, inventory, and buyer orders</h2>
      </div>

      <div className="farmer-layout">
        <form className="panel-card form-card" onSubmit={handleAddOrUpdateProduct}>
          <h3>{editingProductId ? 'Edit product and inventory' : 'Add a value-added product'}</h3>
          <label>
            Product name
            <input
              type="text"
              value={productForm.name}
              onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              required
            />
          </label>
          <label>
            Category
            <input
              type="text"
              value={productForm.category}
              onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows="4"
              value={productForm.description}
              onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
              required
            />
          </label>
          <div className="split-inputs">
            <label>
              Price
              <input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                required
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                value={productForm.stock}
                onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                required
              />
            </label>
          </div>
          <label>
            Origin
            <input
              type="text"
              value={productForm.origin}
              onChange={(event) => setProductForm({ ...productForm, origin: event.target.value })}
            />
          </label>
          <label>
            Image URL
            <input
              type="text"
              value={productForm.imageUrl}
              onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
            />
          </label>
          <label>
            Status
            <select
              value={productForm.status}
              onChange={(event) => setProductForm({ ...productForm, status: event.target.value })}
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </label>
          <button className="primary-btn full-btn" type="submit">
            {editingProductId ? 'Update Product' : 'Add Product'}
          </button>
          {editingProductId ? (
            <button className="ghost-btn full-btn" type="button" onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          ) : null}
        </form>

        <section className="panel-stack">
          <section className="panel-card">
            <h3>Your listed products</h3>
            <div className="list-grid">
              {farmerData.products.map((product) => (
                <div className="row-card action-row" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>
                      {product.category} | Stock {product.stock}
                    </span>
                    <span>
                      {product.origin} | {product.status}
                    </span>
                  </div>
                  <div className="button-group">
                    <button className="ghost-btn small-btn" type="button" onClick={() => handleEditProduct(product)}>
                      Edit
                    </button>
                    <button className="danger-btn small-btn" type="button" onClick={() => handleDeleteProduct(product.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-card">
            <h3>Orders for your products</h3>
            <div className="list-grid">
              {farmerData.orders.map((order) => (
                <div className="row-card action-row" key={order.id}>
                  <div>
                    <strong>{order.product?.name}</strong>
                    <span>Buyer: {order.buyer?.name}</span>
                    <span>Email: {order.buyer?.email || 'Not available'}</span>
                    <span>Phone: {order.buyer?.phone || 'Not available'}</span>
                    <span>Delivery address: {order.shippingAddress}</span>
                    <span>
                      Qty {order.quantity} | {order.status}
                    </span>
                  </div>
                  <div className="button-group">
                    {order.status === 'PLACED' ? (
                      <button
                        className="ghost-btn small-btn"
                        type="button"
                        onClick={() => handleAcceptOrder(order.id)}
                      >
                        Accept
                      </button>
                    ) : null}
                    {order.status !== 'DELIVERED' ? (
                      <button
                        className="primary-btn small-btn"
                        type="button"
                        onClick={() => handleMarkDelivered(order.id)}
                      >
                        Delivered
                      </button>
                    ) : (
                      <span className="chip">Delivered</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </section>
  )
}
