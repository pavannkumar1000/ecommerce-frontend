import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        console.log('Refreshing token...');
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: refreshToken
        });
        
        localStorage.setItem('access', response.data.access);
        console.log('Token refreshed successfully');
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const signupUser = async (userData) => {
  try {
    console.log('Signup request:', userData);
    const response = await api.post('/accounts/signup/', userData);
    console.log('Signup success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return { error: 'Signup failed. Please try again.' };
  }
};

export const loginUser = async (userData) => {
  try {
    console.log('Login attempt for user:', userData.username);
    
    // Use accounts/login endpoint
    const response = await axios.post(`${BASE_URL}/accounts/login/`, userData, {
      timeout: 10000
    });
    
    console.log('Login response:', response.data);
    
    if (response.data.access) {
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user', JSON.stringify({ 
        username: userData.username,
        email: response.data.email || '',
        id: response.data.user_id || '',
        is_staff: response.data.is_staff || false,
        is_superuser: response.data.is_superuser || false
      }));
      console.log('Login successful, tokens stored');
      return { 
        success: true, 
        access: response.data.access,
        refresh: response.data.refresh 
      };
    }
    
    return { success: false, error: 'Invalid response from server' };
    
  } catch (error) {
    console.error('Login error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      const errorDetail = error.response.data?.detail;
      
      if (errorDetail === "No active account found with the given credentials") {
        return { 
          success: false, 
          error: 'User does not exist. Please sign up first.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Invalid username or password' 
      };
    } else if (error.response?.status === 404) {
      return { 
        success: false, 
        error: 'Login endpoint not found. Check backend configuration.' 
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Login failed' 
    };
  }
};

export const logoutUser = () => {
  console.log('Logging out user');
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  return { success: true, message: 'Logged out successfully' };
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access');
  const authenticated = !!token;
  console.log('Auth check - Token exists:', authenticated);
  return authenticated;
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('Current user:', user);
    return user;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// ==================== PRODUCT APIs ====================
export const getProducts = async () => {
  try {
    console.log('Fetching products...');
    const response = await api.get('/products/');
    console.log('Products fetched:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Get products error:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    console.log(`Fetching product ${id}...`);
    const response = await api.get(`/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Get product ${id} error:`, error);
    return null;
  }
};

// Admin product refresh function
export const refreshProducts = async () => {
  try {
    console.log('Refreshing products from FakeStore API...');
    const response = await api.post('/products/refresh/');
    console.log('Refresh products response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Refresh products error:', error);
    return { 
      error: error.response?.data?.error || 
             error.response?.data?.detail || 
             error.response?.data?.message || 
             'Failed to refresh products. Check if endpoint exists.' 
    };
  }
};

// Alternative sync function
export const syncProducts = async () => {
  try {
    console.log('Syncing products...');
    const response = await api.post('/products/sync/');
    console.log('Sync products response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Sync products error:', error);
    return { 
      error: error.response?.data?.error || 
             error.response?.data?.detail || 
             error.response?.data?.message || 
             'Failed to sync products' 
    };
  }
};

// ==================== CART APIs ====================
export const getCart = async () => {
  try {
    console.log('Fetching cart...');
    const response = await api.get('/cart/');
    console.log('Cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get cart error:', error);
    return { items: [], total: 0 };
  }
};

export const addToCartApi = async (productId, quantity = 1) => {
  try {
    console.log(`Adding product ${productId} to cart`);
    const response = await api.post('/cart/add/', { 
      product_id: productId, 
      quantity: quantity 
    });
    console.log('Add to cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Add to cart error:', error);
    return { error: 'Failed to add to cart' };
  }
};

export const removeFromCartApi = async (productId) => {
  try {
    console.log(`Removing product ${productId} from cart`);
    const response = await api.post('/cart/remove/', { 
      product_id: productId 
    });
    console.log('Remove from cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Remove from cart error:', error);
    return { error: 'Failed to remove from cart' };
  }
};

export const decreaseQtyApi = async (productId) => {
  try {
    console.log(`Decreasing quantity for product ${productId}`);
    const response = await api.post('/cart/decrease/', { 
      product_id: productId 
    });
    console.log('Decrease quantity response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Decrease quantity error:', error);
    return { error: 'Failed to decrease quantity' };
  }
};

export const updateCartItemQty = async (productId, quantity) => {
  try {
    console.log(`Updating product ${productId} quantity to ${quantity}`);
    const response = await api.put('/cart/update/', {
      product_id: productId,
      quantity: quantity
    });
    return response.data;
  } catch (error) {
    console.error('Update cart quantity error:', error);
    return { error: 'Failed to update quantity' };
  }
};

export const clearCartApi = async () => {
  try {
    console.log('Clearing cart via API');
    const response = await api.post('/cart/clear/');
    return response.data;
  } catch (error) {
    console.error('Clear cart error:', error);
    return { success: true, message: 'Cart cleared locally', items: [] };
  }
};

// ==================== ORDER APIs ====================
export const checkoutApi = async () => {
  try {
    console.log('Processing checkout...');
    const response = await api.post('/cart/checkout/');
    console.log('Checkout response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Checkout error:', error);
    return { error: 'Checkout failed' };
  }
};

export const getOrderHistory = async () => {
  try {
    console.log('Fetching order history...');
    console.log('Current access token exists:', !!localStorage.getItem('access'));
    
    const response = await api.get('/orders/');
    console.log('Order history response status:', response.status);
    console.log('Order history response data:', response.data);
    
    // Handle different response formats
    if (response.data && Array.isArray(response.data)) {
      console.log('Order history: Array format, length:', response.data.length);
      return response.data;
    } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
      console.log('Order history: Results format, length:', response.data.results.length);
      return response.data.results;
    } else if (response.data && response.data.orders && Array.isArray(response.data.orders)) {
      console.log('Order history: Orders format, length:', response.data.orders.length);
      return response.data.orders;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log('Order history: Data format, length:', response.data.data.length);
      return response.data.data;
    } else {
      console.warn('Order history: Unexpected response format:', response.data);
      console.warn('Returning empty array');
      return [];
    }
  } catch (error) {
    console.error('Get order history error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    // Return empty array on error
    return [];
  }
};

export const getOrderDetail = async (orderId) => {
  try {
    console.log(`Fetching order ${orderId}...`);
    const response = await api.get(`/orders/${orderId}/`);
    console.log(`Order ${orderId} response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Get order ${orderId} error:`, error);
    return null;
  }
};

// Test orders endpoint
export const testOrdersEndpoint = async () => {
  try {
    console.log('Testing orders endpoint...');
    const token = localStorage.getItem('access');
    console.log('Using token:', token ? 'Yes' : 'No');
    
    const response = await api.get('/orders/');
    return {
      success: true,
      status: response.status,
      data: response.data,
      endpoint: `${BASE_URL}/orders/`
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.message,
      data: error.response?.data,
      endpoint: `${BASE_URL}/orders/`
    };
  }
};

// Test product refresh endpoint
export const testRefreshEndpoint = async () => {
  try {
    console.log('Testing product refresh endpoint...');
    const response = await api.post('/products/refresh/');
    return {
      success: true,
      status: response.status,
      data: response.data,
      endpoint: `${BASE_URL}/products/refresh/`
    };
  } catch (error) {
    // Try sync endpoint
    try {
      console.log('Refresh endpoint failed, trying sync endpoint...');
      const syncResponse = await api.post('/products/sync/');
      return {
        success: true,
        status: syncResponse.status,
        data: syncResponse.data,
        endpoint: `${BASE_URL}/products/sync/`
      };
    } catch (syncError) {
      return {
        success: false,
        status: error.response?.status || syncError.response?.status,
        error: error.message || syncError.message,
        endpoint: `${BASE_URL}/products/refresh/ or /products/sync/`
      };
    }
  }
};

// ==================== UTILITY APIs ====================
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    console.log('Refreshing access token...');
    const response = await axios.post(`${BASE_URL}/token/refresh/`, {
      refresh: refreshToken
    });
    
    localStorage.setItem('access', response.data.access);
    console.log('Access token refreshed');
    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await axios.get(`${BASE_URL}/products/`, {
      timeout: 5000
    });
    console.log('Backend connection successful');
    return { 
      success: true, 
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Backend connection failed:', error);
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status
    };
  }
};

export const testLoginEndpoint = async () => {
  try {
    console.log('Testing login endpoint...');
    const response = await axios.post(`${BASE_URL}/accounts/login/`, {
      username: 'test',
      password: 'test'
    });
    console.log('Login endpoint response:', response.status);
    return { 
      success: true, 
      status: response.status 
    };
  } catch (error) {
    console.error('Login endpoint test failed:', {
      status: error.response?.status,
      url: `${BASE_URL}/accounts/login/`
    });
    return { 
      success: false, 
      status: error.response?.status,
      error: error.message 
    };
  }
};

export const getApiHealth = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/products/`);
    return {
      status: 'healthy',
      responseTime: 'N/A',
      dataCount: Array.isArray(response.data) ? response.data.length : 0
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// ==================== DEBUG FUNCTIONS ====================
export const debugApi = () => {
  const debugInfo = {
    baseUrl: BASE_URL,
    tokens: {
      access: localStorage.getItem('access') ? 'Present' : 'Missing',
      refresh: localStorage.getItem('refresh') ? 'Present' : 'Missing',
      user: localStorage.getItem('user') || 'Missing'
    },
    endpoints: {
      products: `${BASE_URL}/products/`,
      cart: `${BASE_URL}/cart/`,
      login: `${BASE_URL}/accounts/login/`,
      signup: `${BASE_URL}/accounts/signup/`,
      refresh: `${BASE_URL}/token/refresh/`,
      orders: `${BASE_URL}/orders/`,
      checkout: `${BASE_URL}/cart/checkout/`,
      productRefresh: `${BASE_URL}/products/refresh/`,
      productSync: `${BASE_URL}/products/sync/`
    }
  };
  
  console.log('=== API DEBUG INFO ===');
  console.table(debugInfo.tokens);
  console.log('Endpoints:', debugInfo.endpoints);
  console.log('====================');
  
  return debugInfo;
};

// Test orders endpoint from console
export const debugOrders = async () => {
  console.log('=== ORDERS DEBUG ===');
  const result = await testOrdersEndpoint();
  console.log('Orders endpoint test:', result);
  console.log('===================');
  return result;
};

// Test refresh endpoint from console
export const debugRefreshEndpoint = async () => {
  console.log('=== REFRESH ENDPOINT DEBUG ===');
  const result = await testRefreshEndpoint();
  console.log('Refresh endpoint test:', result);
  console.log('=============================');
  return result;
};

// Get all API endpoints
export const getAllEndpoints = async () => {
  const endpoints = [
    '/products/',
    '/cart/',
    '/orders/',
    '/accounts/login/',
    '/accounts/signup/',
    '/token/refresh/',
    '/cart/checkout/',
    '/products/refresh/',
    '/products/sync/'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.head(`${BASE_URL}${endpoint}`, { timeout: 3000 });
      results.push({
        endpoint,
        status: response.status,
        exists: true
      });
    } catch (error) {
      results.push({
        endpoint,
        status: error.response?.status || 0,
        exists: false,
        error: error.message
      });
    }
  }
  
  console.log('=== ALL ENDPOINTS STATUS ===');
  console.table(results);
  return results;
};

// ==================== ERROR HANDLING ====================
export const handleApiError = (error) => {
  if (error.response) {
    return {
      error: true,
      status: error.response.status,
      message: error.response.data?.detail || 'Something went wrong',
      data: error.response.data
    };
  } else if (error.request) {
    return {
      error: true,
      message: 'No response from server',
      status: 0
    };
  } else {
    return {
      error: true,
      message: error.message || 'Unknown error',
      status: -1
    };
  }
};

export default api;