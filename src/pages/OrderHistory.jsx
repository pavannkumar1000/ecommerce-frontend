import { useEffect, useState } from 'react';
import { getOrderHistory, testOrdersEndpoint } from '../services/api';
import { 
  FaBox, 
  FaCalendar, 
  FaRupeeSign, 
  FaEye, 
  FaExclamationTriangle,
  FaRedo,
  FaShoppingCart,
  FaInfoCircle
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    setLoading(true);
    setError('');
    setDebugInfo(null);
    
    try {
      console.log('=== Starting order history fetch ===');
      
      // First test the endpoint
      const testResult = await testOrdersEndpoint();
      console.log('Orders endpoint test result:', testResult);
      
      if (!testResult.success) {
        throw new Error(`API Error: ${testResult.status} - ${testResult.error}`);
      }
      
      // Then get the actual data
      const data = await getOrderHistory();
      console.log('Order history data received:', data);
      
      if (Array.isArray(data)) {
        console.log('Setting orders array:', data);
        setOrders(data);
      } else if (data && typeof data === 'object') {
        // Try different possible keys
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (data.results && Array.isArray(data.results)) {
          setOrders(data.results);
        } else if (data.data && Array.isArray(data.data)) {
          setOrders(data.data);
        } else {
          console.warn('Could not extract orders array from object:', data);
          setOrders([]);
          setDebugInfo({
            message: 'Unexpected data format from API',
            data: data
          });
        }
      } else {
        setOrders([]);
      }
      
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError(`Failed to load order history: ${err.message}`);
      setOrders([]);
      setDebugInfo({
        message: err.message,
        timestamp: new Date().toISOString(),
        userHasToken: !!localStorage.getItem('access')
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const getOrderId = (order) => {
    // Try different possible ID fields
    return order.id || order.order_id || order.orderId || order.pk || 'N/A';
  };

  const getOrderTotal = (order) => {
    if (order.total !== undefined && order.total !== null) {
      return parseFloat(order.total).toFixed(2);
    }
    if (order.total_price !== undefined && order.total_price !== null) {
      return parseFloat(order.total_price).toFixed(2);
    }
    if (order.items && Array.isArray(order.items)) {
      const total = order.items.reduce((sum, item) => {
        const price = item.price || item.product?.price || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0);
      return total.toFixed(2);
    }
    return '0.00';
  };

  const getOrderStatus = (order) => {
    if (order.completed !== undefined) {
      return order.completed ? 'Completed' : 'Processing';
    }
    if (order.status) {
      return order.status;
    }
    if (order.order_status) {
      return order.order_status;
    }
    return 'Processing';
  };

  const getStatusBadgeClass = (order) => {
    const status = getOrderStatus(order).toLowerCase();
    if (status.includes('complete') || status.includes('delivered') || status.includes('success')) {
      return 'bg-success';
    } else if (status.includes('process') || status.includes('pending') || status.includes('confirmed')) {
      return 'bg-warning';
    } else if (status.includes('cancel') || status.includes('failed')) {
      return 'bg-danger';
    }
    return 'bg-info';
  };

  const handleViewDetails = (order) => {
    const orderId = getOrderId(order);
    console.log('Viewing details for order:', orderId, order);
    navigate(`/orders/${orderId}`);
  };

  // Format price with rupee symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '₹0.00';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '₹0.00';
    return `₹${numPrice.toFixed(2)}`;
  };

  // Format item price
  const formatItemPrice = (item) => {
    const price = item.price || item.product?.price || 0;
    return formatPrice(price);
  };

  // Calculate item total
  const getItemTotal = (item) => {
    const price = item.price || item.product?.price || 0;
    const quantity = item.quantity || 1;
    return price * quantity;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            <div>
              <strong>Error Loading Orders</strong>
              <p className="mb-1">{error}</p>
              
              {debugInfo && (
                <div className="mt-3">
                  <details>
                    <summary className="text-danger small">Debug Information</summary>
                    <pre className="mt-2 small bg-dark text-light p-2 rounded">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 d-flex gap-2">
            <button 
              className="btn btn-outline-danger" 
              onClick={fetchOrderHistory}
            >
              <FaRedo className="me-1" /> Try Again
            </button>
            <Link to="/products" className="btn btn-primary">
              <FaShoppingCart className="me-1" /> Go Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="display-1 text-muted mb-4">
          <FaBox />
        </div>
        <h3>No Orders Yet</h3>
        <p className="text-muted mb-4">You haven't placed any orders yet.</p>
        
        <div className="d-flex justify-content-center gap-3">
          <Link to="/products" className="btn btn-primary">
            <FaShoppingCart className="me-2" /> Start Shopping
          </Link>
          <Link to="/cart" className="btn btn-outline-secondary">
            View Cart
          </Link>
        </div>
        
        <div className="mt-4">
          <p className="text-muted small">
            Orders will appear here after you complete a purchase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaBox className="me-2" />
          Your Order History
        </h2>
        <div>
          <span className="badge bg-primary p-2">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
          <button 
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={fetchOrderHistory}
            title="Refresh orders"
          >
            <FaRedo />
          </button>
        </div>
      </div>
      
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center">
          <FaInfoCircle className="me-2" />
          <div>
            <strong>Order Summary:</strong> You have {orders.length} order{orders.length !== 1 ? 's' : ''} in your history.
            Click on "View Details" to see complete order information.
          </div>
        </div>
      </div>
      
      <div className="row">
        {orders.map((order, index) => {
          const orderId = getOrderId(order);
          const orderTotal = getOrderTotal(order);
          const orderStatus = getOrderStatus(order);
          const statusClass = getStatusBadgeClass(order);
          const orderDate = formatDate(order.created_at || order.order_date || order.date || order.created);
          
          return (
            <div key={`${orderId}-${index}`} className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm hover-shadow">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">
                      <FaBox className="me-2" /> 
                      Order #{orderId}
                    </h5>
                    <small className="text-muted">
                      <FaCalendar className="me-1" />
                      {orderDate}
                    </small>
                  </div>
                  <span className={`badge ${statusClass}`}>
                    {orderStatus}
                  </span>
                </div>
                
                <div className="card-body">
                  <h6 className="mb-3">
                    Items ({order.items?.length || order.products?.length || 0}):
                  </h6>
                  
                  {order.items || order.products ? (
                    <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {(order.items || order.products || []).map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center mb-2 p-2 border rounded">
                          <img
                            src={item.product?.image || item.image || 'https://via.placeholder.com/50'}
                            alt={item.product?.title || item.name || 'Product'}
                            className="me-3"
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'contain',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              padding: '4px'
                            }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50';
                            }}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-bold small text-truncate">
                              {item.product?.title || item.name || 'Product'}
                            </div>
                            <div className="text-muted">
                              Qty: {item.quantity || 1} × {formatItemPrice(item)}
                            </div>
                          </div>
                          <div className="fw-bold">
                            {formatPrice(getItemTotal(item))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted py-3">
                      <FaBox className="mb-2" />
                      <p>No items information available</p>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <div>
                      <h5 className="text-primary mb-0">
                        <FaRupeeSign className="me-1" />
                        {formatPrice(orderTotal)}
                      </h5>
                      <small className="text-muted">Total Amount</small>
                    </div>
                    
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      <FaEye className="me-1" /> View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <div className="d-flex justify-content-center gap-3">
          <Link to="/products" className="btn btn-outline-primary">
            Continue Shopping
          </Link>
          <button 
            className="btn btn-outline-secondary" 
            onClick={fetchOrderHistory}
          >
            <FaRedo className="me-1" /> Refresh Orders
          </button>
        </div>
        
        <p className="text-muted mt-3">
          Showing {orders.length} order{orders.length !== 1 ? 's' : ''} 
          {orders.length === 0 ? '. Start shopping to see your orders here!' : ' from your account.'}
        </p>
      </div>
    </div>
  );
};

export default OrderHistory;