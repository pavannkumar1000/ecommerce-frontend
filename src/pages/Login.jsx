import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await loginUser(formData);
      
      if (result.success) {
        // Force page reload to update auth state
        window.location.href = '/';
      } else {
        setError(result.error || 'Login failed');
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-center mb-4">Login</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input 
            type="text" 
            name="username"
            className="form-control" 
            placeholder="Enter username" 
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            name="password"
            className="form-control" 
            placeholder="Enter password" 
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Logging in...
            </>
          ) : 'Login'}
        </button>
      </form>
      
      <div className="text-center mt-4">
        <p>Don't have an account?</p>
        <Link to="/signup" className="btn btn-success">
          Create New Account
        </Link>
      </div>
    </>
  );
};

export default Login;