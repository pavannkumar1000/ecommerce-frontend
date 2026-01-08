import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { 
    cartItems, 
    loading, 
    removeFromCart, 
    addToCart,
    decreaseQty,
    totalPrice,
    fetchCart,
    clearCart
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="display-1 text-muted mb-4">
          <FaShoppingCart />
        </div>
        <h3>Your cart is empty</h3>
        <p className="text-muted mb-4">Add some products to your cart</p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
          <Link to="/orders" className="btn btn-outline-secondary">
            <FaHistory className="me-1" /> View Order History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Shopping Cart</h2>
        <span className="badge bg-primary fs-6">
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>Product</th>
              <th className="text-center">Price</th>
              <th className="text-center">Quantity</th>
              <th className="text-end">Subtotal</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id || `${item.product?.id}-${item.quantity}`}>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={item.product?.image || item.image}
                      alt={item.product?.title || item.title}
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'contain', 
                        marginRight: '15px',
                        borderRadius: '8px',
                        backgroundColor: '#f8f9fa',
                        padding: '5px'
                      }}
                    />
                    <div>
                      <h6 className="mb-1">{item.product?.title || item.title}</h6>
                      <small className="text-muted">{item.product?.category || item.category}</small>
                    </div>
                  </div>
                </td>
                <td className="text-center">₹{item.price || item.product?.price}</td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center">
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-circle"
                      onClick={() => decreaseQty(item.product?.id || item.id)}
                      disabled={item.quantity <= 1}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="mx-3 fw-bold">{item.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-circle"
                      onClick={() => addToCart(item.product || item)}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </td>
                <td className="text-end fw-bold">
                  ₹{((item.price || item.product?.price) * item.quantity).toFixed(2)}
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeFromCart(item.product?.id || item.id)}
                    title="Remove item"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-light">
            <tr>
              <td colSpan="3" className="text-end"><strong>Total Amount:</strong></td>
              <td className="text-end"><strong className="text-primary fs-5">₹{totalPrice.toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="d-flex justify-content-between mt-4 flex-wrap gap-3">
        <div className="d-flex gap-2">
          <Link to="/products" className="btn btn-outline-primary">
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn btn-outline-secondary">
            <FaHistory className="me-1" /> Order History
          </Link>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-danger" 
            onClick={handleClearCart}
            disabled={cartItems.length === 0}
          >
            <FaTrash className="me-1" /> Clear Cart
          </button>
          <Link 
            to="/checkout" 
            className="btn btn-success"
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout (₹{totalPrice.toFixed(2)})
          </Link>
        </div>
      </div>

      <div className="alert alert-info mt-4">
        <div className="d-flex align-items-center">
          <FaShoppingCart className="me-2" />
          <div>
            <strong>Cart Summary:</strong> You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart.
            Total amount: <strong className="text-primary">₹{totalPrice.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;