import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../services/api';
import { 
  FaArrowLeft, FaBox, FaCalendar, FaRupeeSign, 
  FaShoppingCart, FaCheckCircle, FaPrint,
  FaShippingFast, FaCreditCard, FaUser,
  FaHome, FaShoppingBag
} from 'react-icons/fa';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      console.log('Fetching order detail for ID:', orderId);
      const data = await getOrderDetail(orderId);
      console.log('Order detail received:', data);
      
      if (data) {
        setOrder(data);
      } else {
        setError('Order not found or empty response');
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      setError('Failed to load order details: ' + (err.message || 'Unknown error'));
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
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  // Format price with rupee symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '₹0.00';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '₹0.00';
    return `₹${numPrice.toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const getOrderStatus = (order) => {
    if (order.completed !== undefined) {
      return order.completed ? 'Completed' : 'Processing';
    }
    if (order.status) {
      return order.status;
    }
    return 'Processing';
  };

  const getStatusBadgeClass = (order) => {
    const status = getOrderStatus(order).toLowerCase();
    if (status.includes('complete') || status.includes('delivered')) {
      return 'bg-success';
    } else if (status.includes('process') || status.includes('pending')) {
      return 'bg-warning';
    } else if (status.includes('cancel')) {
      return 'bg-danger';
    }
    return 'bg-info';
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <div className="d-flex align-items-center">
            <FaBox className="me-2" />
            <div>
              <strong>Error:</strong> {error || 'Order not found'}
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              <FaArrowLeft className="me-2" /> Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Print-only header (hidden on screen) */}
      <div className="d-none d-print-block text-center mb-4">
        <h1>Order Invoice</h1>
        <p>Order ID: #{order.id || order.order_id} | Date: {formatDate(order.created_at)}</p>
      </div>

      {/* Screen header */}
      <div className="d-print-none mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/orders')}>
          <FaArrowLeft className="me-2" /> Back to Orders
        </button>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              <FaBox className="me-2" /> 
              Order #{order.id || order.order_id}
            </h2>
            <p className="text-muted">
              <FaCalendar className="me-1" />
              {formatDate(order.created_at || order.order_date)}
            </p>
          </div>
          
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={handlePrint}>
              <FaPrint className="me-2" /> Print Invoice
            </button>
            <span className={`badge ${getStatusBadgeClass(order)} p-2`}>
              {order.completed ? (
                <>
                  <FaCheckCircle className="me-1" /> Completed
                </>
              ) : 'Processing'}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <FaUser className="me-2" /> Customer Information
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <strong>Name:</strong> {order.user?.username || 'Customer'}
              </div>
              <div className="mb-2">
                <strong>Email:</strong> {order.user?.email || 'Not provided'}
              </div>
              <div className="mb-2">
                <strong>Order ID:</strong> #{order.id || order.order_id}
              </div>
              <div>
                <strong>Order Date:</strong> {formatDate(order.created_at || order.order_date)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <FaShippingFast className="me-2" /> Order Summary
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Status:</span>
                <span className={`badge ${getStatusBadgeClass(order)}`}>
                  {getOrderStatus(order)}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Items Count:</span>
                <span>{order.items?.length || order.products?.length || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Method:</span>
                <span>{order.payment_method || 'Online Payment'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong>Order Total:</strong>
                <strong className="text-primary">
                  {formatPrice(order.total || order.total_price)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Card */}
      <div className="card shadow mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <FaShoppingCart className="me-2" /> 
            Order Items
          </h5>
        </div>
        
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || order.products || []).map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={item.product?.image || item.image || 'https://via.placeholder.com/50'}
                          alt={item.product?.title || item.name}
                          className="me-3"
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'contain',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            padding: '5px'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                        <div>
                          <strong>{item.product?.title || item.name || 'Product'}</strong>
                          <div className="text-muted small">{item.product?.category || item.category || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center align-middle">
                      {formatPrice(item.price || item.product?.price)}
                    </td>
                    <td className="text-center align-middle">
                      <span className="badge bg-primary p-2">{item.quantity || 1}</span>
                    </td>
                    <td className="text-end align-middle fw-bold">
                      {formatPrice((item.price || item.product?.price || 0) * (item.quantity || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card-footer">
          <div className="row">
            <div className="col-md-8">
              <div className="alert alert-info mb-0">
                <strong>Note:</strong> This order is stored in your account history. 
                You can view it anytime from the Order History page.
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(order.total || order.total_price)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>₹0.00</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>₹0.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="text-primary fs-5">
                  <FaRupeeSign className="me-1" />
                  {formatPrice(order.total || order.total_price).replace('₹', '')}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-print-none d-flex gap-3 justify-content-center mt-4 mb-5">
        <Link to="/products" className="btn btn-primary">
          <FaShoppingBag className="me-2" /> Continue Shopping
        </Link>
        <Link to="/orders" className="btn btn-outline-secondary">
          <FaBox className="me-2" /> Back to Orders
        </Link>
        <button className="btn btn-outline-dark" onClick={handlePrint}>
          <FaPrint className="me-2" /> Print Receipt
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;