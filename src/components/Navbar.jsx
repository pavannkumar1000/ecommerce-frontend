import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUser, 
  FaHome, 
  FaBox, 
  FaHistory, 
  FaCog,
  FaSignOutAlt,
  FaShoppingBag,
  FaUserCog,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSmile
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);

  // auth check
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('access');
      const hasToken = !!token;

      if (hasToken !== isAuthenticated) {
        setIsAuthenticated(hasToken);
      }
      checkAdminStatus();
    };

    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, setIsAuthenticated]);

  const checkAdminStatus = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const adminStatus = user.is_staff || user.is_superuser || false;
        setIsAdmin(adminStatus);
        setUserName(user.username || 'User');
        setUserEmail(user.email || '');
      } catch (e) {
        console.error('Error parsing user data:', e);
        setIsAdmin(false);
        setUserName('User');
        setUserEmail('');
      }
    } else {
      setIsAdmin(false);
      setUserName('');
      setUserEmail('');
    }
  };

  // click outside -> close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // route change -> close
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    sessionStorage.clear();

    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserName('');
    setUserEmail('');
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (isAuthenticated) navigate('/');
    else navigate('/login');
  };

  const handleNavLinkClick = () => setMobileMenuOpen(false);

  const isActiveRoute = (path) => location.pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const getFormattedUsername = () => {
    if (!userName) return '';
    return userName.charAt(0).toUpperCase() + userName.slice(1);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm"
      style={{ zIndex: 1030 }}
      ref={navbarRef}
    >
      <div className="container-fluid">
        {/* Brand */}
        <Link 
          className="navbar-brand d-flex align-items-center brand-glow" 
          to={isAuthenticated ? "/" : "/login"}
          onClick={handleHomeClick}
        >
          <div className="brand-icon-wrapper d-flex align-items-center justify-content-center me-2">
            <FaShoppingBag />
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold">ShopCart</span>
            <small className="text-brand-subtle d-none d-sm-block">Your everyday store</small>
          </div>
          {isAdmin && (
            <span className="badge bg-warning ms-2 small d-none d-md-inline">Admin</span>
          )}
        </Link>

        {/* Mobile cart */}
        {isAuthenticated && (
          <div className="d-lg-none d-flex align-items-center">
            <Link 
              className="nav-link position-relative me-2" 
              to="/cart"
              onClick={handleNavLinkClick}
            >
              <FaShoppingCart size={20} className="text-white" />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Toggler */}
        <button
          className="navbar-toggler border-0 rounded-pill px-2 py-1 toggle-animated"
          type="button"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <FaTimes size={22} className="text-white" /> : <FaBars size={22} className="text-white" />}
        </button>

        {/* Menu (desktop normal, mobile drawer) */}
        <div className={`navbar-collapse custom-collapse ${mobileMenuOpen ? 'show-menu' : ''}`}>
          {/* Left links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 main-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item nav-underline">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActiveRoute('/') ? 'active' : ''}`} 
                    to="/"
                    onClick={handleNavLinkClick}
                  >
                    <FaHome className="me-2" /> <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item nav-underline">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActiveRoute('/products') ? 'active' : ''}`} 
                    to="/products"
                    onClick={handleNavLinkClick}
                  >
                    <FaBox className="me-2" /> <span>Products</span>
                  </Link>
                </li>
                <li className="nav-item nav-underline">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActiveRoute('/orders') ? 'active' : ''}`} 
                    to="/orders"
                    onClick={handleNavLinkClick}
                  >
                    <FaHistory className="me-2" /> <span>Orders</span>
                  </Link>
                </li>

                {isAdmin && (
                  <li className="nav-item nav-underline">
                    <Link 
                      className={`nav-link d-flex align-items-center ${isActiveRoute('/admin-panel') ? 'active' : ''}`} 
                      to="/admin-panel"
                      onClick={handleNavLinkClick}
                    >
                      <FaCog className="me-2" /> <span>Admin Panel</span>
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <li className="nav-item">
                <span className="nav-link d-flex align-items-center text-white-50">
                  <FaBox className="me-2" /> Browse products after login
                </span>
              </li>
            )}
          </ul>

          {/* Right side */}
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                {/* Desktop cart */}
                <li className="nav-item d-none d-lg-block me-3 nav-underline">
                  <Link 
                    className={`nav-link position-relative ${isActiveRoute('/cart') ? 'active' : ''}`} 
                    to="/cart"
                    onClick={handleNavLinkClick}
                    title="View Cart"
                  >
                    <FaShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartCount > 99 ? '99+' : cartCount}
                        <span className="visually-hidden">items in cart</span>
                      </span>
                    )}
                  </Link>
                </li>

                {/* Desktop user dropdown */}
                <li className="nav-item dropdown d-none d-lg-block">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center user-pill"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="d-flex align-items-center">
                      <div className="avatar-circle me-2">
                        <FaUser size={18} />
                      </div>
                      <div className="text-start">
                        <div className="small fw-bold text-white">{getFormattedUsername()}</div>
                        {userEmail && (
                          <div className="x-small text-white-50">{userEmail}</div>
                        )}
                      </div>
                    </div>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3" style={{ minWidth: '250px' }}>
                    <li>
                      <div className="dropdown-header">
                        <div className="fw-bold">{getFormattedUsername()}</div>
                        {userEmail && (
                          <div className="small text-muted">{userEmail}</div>
                        )}
                        {isAdmin && (
                          <div className="small">
                            <span className="badge bg-warning mt-1">Administrator</span>
                          </div>
                        )}
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <Link 
                        className="dropdown-item d-flex align-items-center" 
                        to="/cart"
                        onClick={handleNavLinkClick}
                      >
                        <FaShoppingCart className="me-2" /> 
                        My Cart 
                        <span className="badge bg-primary ms-auto">{cartCount}</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        className="dropdown-item d-flex align-items-center" 
                        to="/orders"
                        onClick={handleNavLinkClick}
                      >
                        <FaHistory className="me-2" /> 
                        Order History
                      </Link>
                    </li>

                    {isAdmin && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <Link 
                            className="dropdown-item d-flex align-items-center" 
                            to="/admin-panel"
                            onClick={handleNavLinkClick}
                          >
                            <FaUserCog className="me-2" /> 
                            Admin Panel
                          </Link>
                        </li>
                      </>
                    )}

                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger d-flex align-items-center" 
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="me-2" /> 
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </li>

                {/* Mobile user area */}
                <div className="d-lg-none mt-3 border-top pt-3">
                  <div className="d-flex align-items-center mb-4 px-3">
                    <div className="avatar-circle-lg me-3">
                      <FaSmile size={24} />
                    </div>
                    <div>
                      <div className="fw-bold text-white fs-5">
                        Hello, <span className="text-warning">{getFormattedUsername()}</span>!
                      </div>
                      <div className="text-white-50 small">
                        Welcome back to ShopCart
                      </div>
                    </div>
                  </div>

                  <div className="px-3 mb-4">
                    <div className="text-white mb-2">
                      <FaUserCircle className="me-2" /> 
                      <strong>Account:</strong> {getFormattedUsername()}
                    </div>
                    {userEmail && (
                      <div className="text-white-50 small">
                        <FaUser className="me-2" /> {userEmail}
                      </div>
                    )}
                    {isAdmin && (
                      <div className="mt-2">
                        <span className="badge bg-warning">
                          <FaUserCog className="me-1" /> Administrator
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="px-3">
                    <Link 
                      className="btn btn-outline-light w-100 mb-3 d-flex align-items-center justify-content-center text-white" 
                      to="/cart"
                      onClick={handleNavLinkClick}
                    >
                      <FaShoppingCart className="me-2" /> 
                      <span className="text-white">My Cart</span>
                      <span className="badge bg-primary ms-2">{cartCount}</span>
                    </Link>

                    <Link 
                      className="btn btn-outline-light w-100 mb-3 d-flex align-items-center justify-content-center text-white" 
                      to="/orders"
                      onClick={handleNavLinkClick}
                    >
                      <FaHistory className="me-2" /> 
                      <span className="text-white">Order History</span>
                    </Link>

                    {isAdmin && (
                      <Link 
                        className="btn btn-outline-light w-100 mb-3 d-flex align-items-center justify-content-center text-white" 
                        to="/admin-panel"
                        onClick={handleNavLinkClick}
                      >
                        <FaUserCog className="me-2" /> 
                        <span className="text-white">Admin Panel</span>
                      </Link>
                    )}

                    <button 
                      className="btn btn-danger w-100 d-flex align-items-center justify-content-center text-white" 
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-2" /> 
                      <span className="text-white">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <li className="nav-item nav-underline">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActiveRoute('/login') ? 'active' : ''}`} 
                    to="/login"
                    onClick={handleNavLinkClick}
                  >
                    <FaUser className="me-2" /> <span>Login</span>
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <Link 
                    className={`btn btn-outline-light btn-sm rounded-pill px-3 ${isActiveRoute('/signup') ? 'active-signup' : ''}`} 
                    to="/signup"
                    onClick={handleNavLinkClick}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="d-lg-none fixed-top"
          style={{
            top: '56px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1029
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* INTERNAL CSS */}
      <style>
        {`
          .navbar {
            background: linear-gradient(120deg, #0d6efd 0%, #6610f2 50%, #d63384 100%);
            backdrop-filter: blur(10px);
          }

          .brand-icon-wrapper {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
          }

          .text-brand-subtle {
            font-size: 0.7rem;
            opacity: 0.8;
          }

          .brand-glow {
            position: relative;
          }

          .brand-glow::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 999px;
            opacity: 0;
            box-shadow: 0 0 18px rgba(255,255,255,0.25);
            transition: opacity 0.25s ease;
          }

          .brand-glow:hover::after {
            opacity: 1;
          }

          .toggle-animated {
            background-color: rgba(255, 255, 255, 0.08);
            transition: background-color 0.2s ease, transform 0.2s ease;
          }

          .toggle-animated:active {
            transform: scale(0.95);
          }

          .main-nav .nav-link {
            position: relative;
            padding-inline: 0.75rem;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            color: #f8f9fa !important;
            font-weight: 500;
          }

          .nav-underline {
            position: relative;
            margin-inline: 0.25rem;
          }

          .nav-underline::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            margin: 0 auto;
            height: 3px;
            width: 0%;
            background-color: #ffc107;
            border-radius: 999px;
            transition: width 0.3s ease;
          }

          .nav-underline .nav-link.active,
          .nav-underline .nav-link:hover {
            color: #fff !important;
          }

          .nav-underline:hover::after {
            width: 100%;
          }

          .navbar .btn-outline-light {
            border-color: rgba(255, 255, 255, 0.7);
          }

          .navbar .btn-outline-light:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .active-signup {
            background-color: #fff;
            color: #0d6efd !important;
          }

          .avatar-circle {
            width: 36px;
            height: 36px;
            border-radius: 999px;
            background: rgba(255,255,255,0.18);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }

          .avatar-circle-lg {
            width: 50px;
            height: 50px;
            border-radius: 999px;
            background: rgba(255,255,255,0.2);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }

          .user-pill {
            border-radius: 999px;
            padding-inline: 0.5rem;
            transition: background-color 0.2s ease;
          }

          .user-pill:hover {
            background-color: rgba(255, 255, 255, 0.08);
          }

          /* desktop: default flex */
          .custom-collapse {
            display: flex !important;
          }

          @media (max-width: 991.98px) {
            .custom-collapse {
              position: fixed;
              top: 56px; /* navbar height */
              right: 0;
              width: 280px;
              height: calc(100vh - 56px); /* full height under navbar */
              padding: 16px 20px 24px;
              background: rgba(33, 37, 41, 0.98);
              backdrop-filter: blur(12px);
              z-index: 1030;
              overflow-y: auto;      /* drawer உள்ளே scroll */
              transform: translateX(100%);
              transition: transform 0.3s ease-in-out;
              border-left: 1px solid rgba(255, 255, 255, 0.08);
              display: block !important;
            }

            .custom-collapse.show-menu {
              transform: translateX(0);
              box-shadow: -5px 0 20px rgba(0, 0, 0, 0.4);
            }

            .navbar-nav {
              flex-direction: column;
            }

            .nav-item {
              width: 100%;
              margin-bottom: 8px;
            }

            .nav-link {
              padding: 10px 12px;
              border-radius: 6px;
              color: white !important;
            }

            .nav-link:hover {
              background-color: rgba(255, 255, 255, 0.06);
            }

            .navbar-toggler {
              z-index: 1031;
            }
          }

          .navbar-brand {
            z-index: 1031;
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
