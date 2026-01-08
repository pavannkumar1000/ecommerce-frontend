import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaShippingFast, FaCheckCircle } from 'react-icons/fa';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice, checkout } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await checkout();
      if (result) {
        setOrderPlaced(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="text-center py-5">
        <h3>No items in cart</h3>
        <p className="text-muted">Add some products to proceed to checkout</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Browse Products
        </button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="text-center py-5">
        <div className="display-1 text-success mb-4">
          <FaCheckCircle />
        </div>
        <h2>Order Placed Successfully!</h2>
        <p className="text-muted">Thank you for your purchase. Redirecting to home...</p>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        <h2 className="mb-4">Checkout</h2>
        
        {/* Shipping Information */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <FaShippingFast className="me-2" /> Shipping Information
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <FaCreditCard className="me-2" /> Payment Information
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                className="form-control"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Expiry Date</label>
                <input
                  type="text"
                  className="form-control"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">CVV</label>
                <input
                  type="text"
                  className="form-control"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="col-lg-4">
        <div className="card">
          <div className="card-header bg-success text-white">
            Order Summary
          </div>
          <div className="card-body">
            <h5>Items ({cartItems.length})</h5>
            <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {cartItems.map((item, index) => (
                <div key={index} className="d-flex justify-content-between mb-2">
                  <div>
                    <small>{item.product?.title || item.title}</small>
                    <br />
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <small>₹{((item.price || item.product?.price) * item.quantity).toFixed(2)}</small>
                </div>
              ))}
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Shipping</span>
              <span>₹0.00</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Tax</span>
              <span>₹0.00</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-3">
              <strong>Total</strong>
              <strong>₹{totalPrice.toFixed(2)}</strong>
            </div>
            <button
              className="btn btn-success w-100"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
            <small className="text-muted d-block mt-2 text-center">
              By placing your order, you agree to our terms and conditions
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;