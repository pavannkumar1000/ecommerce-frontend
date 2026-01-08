import { useState } from 'react';
import { refreshProducts } from '../services/api';

const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRefreshProducts = async () => {
    if (!window.confirm('Are you sure? This will delete all existing products and fetch new ones.')) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await refreshProducts();
      if (result.message) {
        setMessage(`✅ ${result.message}`);
      } else if (result.error) {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">Admin Panel</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <h6>Products Management</h6>
          <p className="text-muted small">
            Refresh products from FakeStore API. This will replace all existing products.
          </p>
          <button 
            className="btn btn-warning"
            onClick={handleRefreshProducts}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Products from API'}
          </button>
        </div>
        
        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} mt-3`}>
            {message}
          </div>
        )}
        
        <div className="mt-3">
          <h6>Database Stats</h6>
          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between">
              <span>Total Users:</span>
              <span className="badge bg-primary">Check Django Admin</span>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Total Orders:</span>
              <span className="badge bg-success">Check Django Admin</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;