import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCart,
  addToCartApi,
  removeFromCartApi,
  decreaseQtyApi,
  checkoutApi,
} from '../services/api';

// Create the context
const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [cartInitialized, setCartInitialized] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('access');
    console.log('Auth check - Token exists:', !!token);
    return !!token;
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    console.log('fetchCart called, authenticated:', isAuthenticated());
    
    if (!isAuthenticated()) {
      console.log('User not authenticated, setting empty cart');
      setCartItems([]);
      setCartInitialized(true);
      return;
    }

    setLoading(true);
    try {
      const data = await getCart();
      console.log('Cart data from API:', data);
      
      // Handle different response formats
      if (data && Array.isArray(data)) {
        // If API returns array directly
        setCartItems(data);
      } else if (data && data.items && Array.isArray(data.items)) {
        // If API returns object with items array
        setCartItems(data.items);
      } else if (data && data.error) {
        console.error('Cart API error:', data.error);
        setCartItems([]);
      } else {
        console.log('No cart data found');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
      setCartInitialized(true);
    }
  };

  // Fetch cart on initial load
  useEffect(() => {
    if (!cartInitialized) {
      fetchCart();
    }
  }, [cartInitialized]);

  // Listen for login/logout events
  useEffect(() => {
    const handleStorageChange = () => {
      if (!localStorage.getItem('access')) {
        // User logged out
        setCartItems([]);
      } else {
        // User logged in, fetch cart
        fetchCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check auth status periodically
    const interval = setInterval(() => {
      const authStatus = isAuthenticated();
      if (!authStatus && cartItems.length > 0) {
        // User logged out but cart has items
        setCartItems([]);
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [cartItems]);

  // Add item to cart
  const addToCart = async (product) => {
    if (!isAuthenticated()) {
      showToast('Please login first', 'error');
      return false;
    }

    try {
      const productId = product.id || product.product?.id;
      if (!productId) {
        showToast('Invalid product', 'error');
        return false;
      }

      console.log('Adding product to cart:', productId);
      const result = await addToCartApi(productId);
      console.log('Add to cart result:', result);
      
      // Update cart items
      if (result.items) {
        setCartItems(result.items);
        showToast(`${product.title} added to cart`);
        return true;
      } else if (result.error) {
        showToast(result.error, 'error');
      } else {
        // If result doesn't have items, refetch cart
        await fetchCart();
        showToast(`${product.title} added to cart`);
        return true;
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast('Failed to add to cart', 'error');
    }
    return false;
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!isAuthenticated()) {
      showToast('Please login first', 'error');
      return;
    }

    try {
      const result = await removeFromCartApi(productId);
      if (result.items) {
        setCartItems(result.items);
        showToast('Item removed from cart', 'info');
      } else {
        // If result doesn't have items, refetch cart
        await fetchCart();
        showToast('Item removed from cart', 'info');
      }
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  // Decrease item quantity
  const decreaseQty = async (productId) => {
    if (!isAuthenticated()) {
      return;
    }

    try {
      const result = await decreaseQtyApi(productId);
      if (result.items) {
        setCartItems(result.items);
      } else {
        // If result doesn't have items, refetch cart
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to decrease quantity:', error);
    }
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    showToast('Cart cleared', 'info');
  };

  // Checkout
  const checkout = async () => {
    if (!isAuthenticated()) {
      showToast('Please login first', 'error');
      return false;
    }

    try {
      const result = await checkoutApi();
      console.log('Checkout result:', result);
      
      if (result.success || result.message) {
        setCartItems([]);
        showToast('Order placed successfully!');
        return true;
      } else {
        showToast(result.error || 'Checkout failed', 'error');
      }
    } catch (error) {
      showToast('Checkout failed', 'error');
    }
    return false;
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.price || item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  // Calculate total items count
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Debug function to check cart state
  const debugCart = () => {
    console.log('Cart Debug:', {
      items: cartItems,
      count: cartCount,
      total: totalPrice,
      authenticated: isAuthenticated(),
      loading: loading
    });
  };

  // Context value
  const value = {
    cartItems,
    cartCount,
    totalPrice,
    loading,
    toast,
    addToCart,
    removeFromCart,
    decreaseQty,
    clearCart,
    checkout,
    fetchCart,
    showToast,
    debugCart, // Add this for debugging
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;