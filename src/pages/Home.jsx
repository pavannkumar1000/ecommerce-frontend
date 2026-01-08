// Home.jsx
import { Link } from 'react-router-dom';
import { FaShippingFast, FaHeadset, FaShieldAlt, FaArrowRight, FaStar, FaMobileAlt, FaTshirt, FaUtensils } from 'react-icons/fa';

const Home = () => {
  const heroStyle = {
    backgroundImage: `
      linear-gradient(135deg, rgba(13,110,253,0.85), rgba(102,16,242,0.7)),
      url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    borderRadius: '24px',
    padding: '48px 24px',
  };

  const statsCardStyle = {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: '18px',
    padding: '16px 18px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  const featureCardStyle = {
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
    border: 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden',
  };

  const pillLinkStyle = {
    borderRadius: '999px',
    padding: '6px 14px',
    fontSize: '0.8rem',
  };

  return (
    <div className="container py-4 py-md-5 home-page">
      {/* Hero with shopping bg */}
      <section className="mb-5">
        <div className="row g-4 align-items-center">
          <div className="col-lg-7">
            <div style={heroStyle} className="hero-shadow position-relative overflow-hidden">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-light text-primary rounded-pill text-uppercase fw-semibold small">
                  Flash sale live
                </span>
                <span className="text-light small">Limited time offers</span>
              </div>

              <h1 className="display-5 fw-bold mb-3">
                Find your <span className="text-warning">perfect products</span>
              </h1>
              <p className="lead mb-4 hero-subtitle">
                Shop from 10,000+ premium products across all categories. Fast delivery. Easy returns.
              </p>

              {/* Quick nav pills */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Link
                  to="/products"
                  className="btn btn-light btn-sm d-inline-flex align-items-center gap-2"
                  style={pillLinkStyle}
                >
                  All Products <FaArrowRight size={12} />
                </Link>
                <Link
                  to="/cart"
                  className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2"
                  style={pillLinkStyle}
                >
                  View Cart
                </Link>
                <Link
                  to="/orders"
                  className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2"
                  style={pillLinkStyle}
                >
                  My Orders
                </Link>
              </div>

              {/* Stats row */}
              <div className="row g-3">
                <div className="col-4">
                  <div style={statsCardStyle} className="text-center small">
                    <div className="fw-bold fs-5">4.9</div>
                    <div className="text-warning mb-1">
                      ★ ★ ★ ★ ★
                    </div>
                    <div className="text-white-50 mt-1">4.9K reviews</div>
                  </div>
                </div>
                <div className="col-4">
                  <div style={statsCardStyle} className="text-center small">
                    <div className="fw-bold fs-5">15K+</div>
                    <div className="text-white-50 mt-1">Happy customers</div>
                  </div>
                </div>
                <div className="col-4">
                  <div style={statsCardStyle} className="text-center small">
                    <div className="fw-bold fs-5">7 days</div>
                    <div className="text-white-50 mt-1">Easy returns</div>
                  </div>
                </div>
              </div>

              {/* Hero glow */}
              <div className="hero-glow" />
            </div>
          </div>

          {/* Right side feature cards */}
          <div className="col-lg-5">
            <div className="row g-3">
              <div className="col-12">
                <div className="card border-0 rounded-4 p-3 feature-card">
                  <div className="d-flex align-items-center">
                    <div className="icon-circle me-3 bg-primary-subtle text-primary">
                      <FaShippingFast />
                    </div>
                    <div>
                      <h6 className="mb-1">Lightning delivery</h6>
                      <p className="small text-muted mb-0">
                        Same day delivery in Chennai & suburbs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="card border-0 rounded-4 p-3 feature-card">
                  <div className="icon-circle mb-2 bg-success-subtle text-success">
                    <FaShieldAlt />
                  </div>
                  <h6 className="mb-1">100% secure</h6>
                  <p className="small text-muted mb-0">SSL encrypted checkout.</p>
                </div>
              </div>

              <div className="col-6">
                <div className="card border-0 rounded-4 p-3 feature-card">
                  <div className="icon-circle mb-2 bg-warning-subtle text-warning">
                    <FaHeadset />
                  </div>
                  <h6 className="mb-1">24/7 support</h6>
                  <p className="small text-muted mb-0">Chat or call anytime.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured categories with icons */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Explore categories</h4>
          <Link to="/products" className="text-decoration-none small d-flex align-items-center gap-1">
            See more <FaArrowRight size={10} />
          </Link>
        </div>

        <div className="row g-3">
          {[
            {
              title: 'Electronics',
              icon: FaMobileAlt,
              desc: 'Latest mobiles, earbuds & laptops',
              badge: '🔥 Trending',
              bg: 'bg-gradient-primary',
            },
            {
              title: 'Fashion',
              icon: FaTshirt,
              desc: 'Clothing, shoes & accessories',
              badge: '👗 New arrivals',
              bg: 'bg-gradient-danger',
            },
            {
              title: 'Home & Kitchen',
              icon: FaUtensils,
              desc: 'Cookware, appliances & decor',
              badge: '🏠 Best sellers',
              bg: 'bg-gradient-success',
            },
          ].map((cat, idx) => (
            <div className="col-md-4" key={idx}>
              <Link
                to="/products"
                className="text-decoration-none text-reset"
              >
                <div className="card h-100 feature-card category-card">
                  <div className="card-body">
                    <div className="icon-circle-large mb-3">
                      <cat.icon />
                    </div>
                    <h5 className="card-title mb-2">{cat.title}</h5>
                    <p className="card-text text-muted small mb-3">{cat.desc}</p>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="small text-muted">{cat.badge}</span>
                      <FaArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Django Admin only - Full width */}
      <section className="mb-4">
        <div className="card border-0 rounded-4 p-4 p-md-5 feature-card">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="mb-2">Admin dashboard ready</h5>
              <p className="text-muted mb-0">
                Complete control over products, orders, customers and inventory management.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <a
                href="http://127.0.0.1:8000/admin/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg btn-outline-secondary px-4"
              >
                Open Django Admin →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Internal CSS */}
      <style>
        {`
          .home-page .hero-shadow {
            box-shadow: 0 25px 50px rgba(13, 110, 253, 0.4);
          }

          .home-page .hero-subtitle {
            max-width: 520px;
          }

          .home-page .hero-glow {
            position: absolute;
            width: 240px;
            height: 240px;
            background: radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%);
            top: -80px;
            right: -50px;
            opacity: 0.3;
            pointer-events: none;
          }

          .home-page .icon-circle {
            width: 40px;
            height: 40px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
          }

          .home-page .icon-circle-large {
            width: 60px;
            height: 60px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
            background: rgba(255,255,255,0.08);
            color: #fff;
          }

          .home-page .feature-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .home-page .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.1);
          }

          .home-page .category-card:hover {
            border-color: rgba(13, 110, 253, 0.25);
          }

          @media (max-width: 767.98px) {
            .home-page .hero-shadow {
              padding: 32px 18px !important;
              border-radius: 20px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
