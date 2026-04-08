import { useState } from 'react'
import { apiRequest } from '../services/api'

const emptyOrderForm = {
  productId: '',
  quantity: 1,
  shippingAddress: '',
}

const emptyFeedbackForm = {
  productId: '',
  rating: 5,
  comment: '',
}

export function BuyerDashboard({
  currentUser,
  buyerData,
  setBuyerData,
  onRefresh,
  setError,
  setMessage,
  setLoading,
}) {
  const [orderForm, setOrderForm] = useState(emptyOrderForm)
  const [feedbackForm, setFeedbackForm] = useState(emptyFeedbackForm)
  const [selectedProductId, setSelectedProductId] = useState('')

  async function handlePlaceOrder(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await apiRequest('/buyer/orders', {
        method: 'POST',
        body: JSON.stringify({
          buyerId: currentUser.id,
          productId: Number(orderForm.productId),
          quantity: Number(orderForm.quantity),
          shippingAddress: orderForm.shippingAddress,
        }),
      })
      setOrderForm(emptyOrderForm)
      setMessage('Order placed successfully')
      await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitFeedback(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const targetProductId = Number(feedbackForm.productId || selectedProductId)

      await apiRequest('/buyer/feedback', {
        method: 'POST',
        body: JSON.stringify({
          buyerId: currentUser.id,
          productId: targetProductId,
          rating: Number(feedbackForm.rating),
          comment: feedbackForm.comment,
        }),
      })

      if (targetProductId) {
        await handleViewFeedback(targetProductId)
      }

      setFeedbackForm({ ...emptyFeedbackForm, productId: String(targetProductId || '') })
      setMessage('Feedback submitted successfully')
      await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleViewFeedback(productId) {
    setSelectedProductId(productId)
    setLoading(true)
    setError('')

    try {
      const feedback = await apiRequest(`/buyer/feedback/${productId}`)
      setBuyerData((previous) => ({ ...previous, feedback }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="dashboard-section">
      <div className="section-head">
        <span>Buyer Dashboard</span>
        <h2>Discover products, place orders, and leave feedback</h2>
      </div>

      <div className="buyer-layout">
        <section className="panel-card">
          <h3>Available products</h3>
          <div className="catalog-grid">
            {buyerData.products.map((product) => (
              <article className="catalog-card" key={product.id}>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
                <p>{product.description}</p>
                <div className="catalog-meta">
                  <span>Rs. {product.price}</span>
                  <span>Stock: {product.stock}</span>
                </div>
                <button
                  className="ghost-btn small-btn"
                  type="button"
                  onClick={() => {
                    setOrderForm({ ...orderForm, productId: product.id })
                    setFeedbackForm({ ...feedbackForm, productId: product.id })
                    handleViewFeedback(product.id)
                  }}
                >
                  Select Product
                </button>
              </article>
            ))}
          </div>
        </section>

        <div className="panel-grid">
          <form className="panel-card form-card" onSubmit={handlePlaceOrder}>
            <h3>Place order</h3>
            <label>
              Product
              <select
                value={orderForm.productId}
                onChange={(event) => setOrderForm({ ...orderForm, productId: event.target.value })}
                required
              >
                <option value="">Select a product</option>
                {buyerData.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={orderForm.quantity}
                onChange={(event) => setOrderForm({ ...orderForm, quantity: event.target.value })}
                required
              />
            </label>
            <label>
              Shipping address
              <textarea
                rows="4"
                value={orderForm.shippingAddress}
                onChange={(event) => setOrderForm({ ...orderForm, shippingAddress: event.target.value })}
                required
              />
            </label>
            <button className="primary-btn full-btn" type="submit">
              Place Order
            </button>
          </form>

          <form className="panel-card form-card" onSubmit={handleSubmitFeedback}>
            <h3>Submit feedback</h3>
            <label>
              Product
              <select
                value={feedbackForm.productId}
                onChange={(event) => {
                  setFeedbackForm({ ...feedbackForm, productId: event.target.value })
                  setSelectedProductId(event.target.value)
                }}
                required
              >
                <option value="">Select a product</option>
                {buyerData.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rating
              <input
                type="number"
                min="1"
                max="5"
                value={feedbackForm.rating}
                onChange={(event) => setFeedbackForm({ ...feedbackForm, rating: event.target.value })}
                required
              />
            </label>
            <label>
              Comment
              <textarea
                rows="4"
                value={feedbackForm.comment}
                onChange={(event) => setFeedbackForm({ ...feedbackForm, comment: event.target.value })}
                required
              />
            </label>
            <button className="primary-btn full-btn" type="submit">
              Add Feedback
            </button>
          </form>

          <section className="panel-card">
            <h3>Your orders</h3>
            <div className="list-grid">
              {buyerData.orders.map((order) => (
                <div className="row-card" key={order.id}>
                  <strong>{order.product?.name}</strong>
                  <span>Qty: {order.quantity}</span>
                  <span>Address: {order.shippingAddress}</span>
                  <span>
                    Status: {order.status} | Total: Rs. {order.totalAmount}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-card">
            <h3>Product feedback{selectedProductId ? ` | Product ${selectedProductId}` : ''}</h3>
            <div className="list-grid">
              {buyerData.feedback.map((item) => (
                <div className="row-card" key={item.id}>
                  <strong>{item.buyer?.name}</strong>
                  <span>Rating: {item.rating}/5</span>
                  <span>{item.comment}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
