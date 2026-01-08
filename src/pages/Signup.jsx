import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({}); // Clear errors when user types
  };

  const formatErrors = (errorData) => {
    const formatted = {};
    
    if (typeof errorData === 'object') {
      // Django REST Framework errors
      Object.keys(errorData).forEach(key => {
        if (Array.isArray(errorData[key])) {
          formatted[key] = errorData[key].join(' ');
        } else {
          formatted[key] = errorData[key];
        }
      });
    } else if (typeof errorData === 'string') {
      formatted.general = errorData;
    }
    
    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    try {
      const result = await signupUser(formData);
      
      if (result.message) {
        // Signup successful
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Show validation errors
        const formattedErrors = formatErrors(result);
        setErrors(formattedErrors);
      }
    } catch (err) {
      setErrors({ general: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="alert alert-success text-center" role="alert">
            <h4 className="alert-heading">Account Created Successfully!</h4>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2 className="text-center mb-4">Sign Up</h2>
        
        {errors.general && (
          <div className="alert alert-danger" role="alert">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              name="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="Choose a username" 
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <div className="invalid-feedback">
                {errors.username}
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="invalid-feedback">
                {errors.email}
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Password (minimum 8 characters)" 
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
            {errors.password && (
              <div className="invalid-feedback">
                {errors.password}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        </form>
        
        <p className="text-center mt-3">
          Already have an account? <a href="/login">Login</a>
        </p>
        
        <div className="mt-4">
          <small className="text-muted">
            <strong>Note:</strong> This will create a real account in the Django backend.
            You can also login with your superuser credentials from Django admin.
          </small>
        </div>
      </div>
    </div>
  );
};

export default Signup;