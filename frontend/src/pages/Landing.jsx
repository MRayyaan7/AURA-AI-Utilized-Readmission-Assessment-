import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Background Effects */}
      <div className="landing-bg-grid" />
      <div className="landing-bg-glow-primary" />
      <div className="landing-bg-glow-secondary" />

      {/* Top Navbar */}
      <header className="landing-navbar">
        <div className="landing-navbar-inner">
          {/* Brand */}
          <div className="landing-brand">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              health_and_safety
            </span>
            <span className="landing-brand-name">ReadmitAI</span>
          </div>

          {/* Navigation */}
          <nav className="landing-nav">
            <a className="landing-nav-link active" href="#platform">Platform</a>
            <a className="landing-nav-link" href="#features">Risk Models</a>
            <a className="landing-nav-link" href="#features">Insights</a>
            <a className="landing-nav-link" href="#features">Clinical Flow</a>
          </nav>

          {/* Actions */}
          <div className="landing-actions">
            <button className="landing-btn-demo">Request Demo</button>
            <button
              className="landing-btn-login"
              onClick={() => navigate('/login')}
            >
              Secure Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        {/* Hero Section */}
        <section className="landing-hero landing-animate-in" id="platform">
          <h1 className="landing-hero-title">
            Predict. Prevent. Protect.
          </h1>
          <p className="landing-hero-subtitle">
            AI-powered 30-day hospital readmission risk prediction with
            explainable insights designed for critical clinical workflows.
          </p>
          <div className="landing-hero-actions">
            <button
              className="landing-btn-cta"
              onClick={() => navigate('/assess')}
            >
              Get Started
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="landing-stats landing-animate-in landing-delay-1">
          <div className="landing-stat">
            <div className="landing-stat-icon cyan">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h3 className="landing-stat-value">95%</h3>
            <p className="landing-stat-label">Accuracy</p>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-icon indigo">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                speed
              </span>
            </div>
            <h3 className="landing-stat-value">&lt; 2s</h3>
            <p className="landing-stat-label">Response</p>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-icon teal">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <h3 className="landing-stat-value">AI</h3>
            <p className="landing-stat-label">Insights</p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="landing-features landing-animate-in landing-delay-2" id="features">
          {/* Card 1 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon indigo">
              <span className="material-symbols-outlined">neurology</span>
            </div>
            <h3 className="landing-feature-title">ML Prediction</h3>
            <p className="landing-feature-desc">
              XGBoost model trained on real patient data.
            </p>
          </div>

          {/* Card 2 */}
          <div className="landing-feature-card">
            <div className="hover-glow cyan" />
            <div className="landing-feature-icon cyan">
              <span className="material-symbols-outlined">monitoring</span>
            </div>
            <h3 className="landing-feature-title">Explainable AI</h3>
            <p className="landing-feature-desc">
              SHAP analysis reveals exactly why each prediction was made.
            </p>
          </div>

          {/* Card 3 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon purple">
              <span className="material-symbols-outlined">magic_button</span>
            </div>
            <h3 className="landing-feature-title">Clinical Narratives</h3>
            <p className="landing-feature-desc">
              Gemini AI generates doctor-friendly explanations and action plans.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <div className="landing-footer-brand">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                health_and_safety
              </span>
              <span className="landing-footer-brand-name">ReadmitAI</span>
            </div>
            <p className="landing-footer-tagline">
              Advanced Predictive Analytics for Clinical Excellence.
            </p>
            <p className="landing-footer-copy">© 2026 ReadmitAI.</p>
          </div>

          <div className="landing-footer-col">
            <span className="landing-footer-col-title">Platform</span>
            <a className="landing-footer-link" href="#">Privacy Policy</a>
            <a className="landing-footer-link" href="#">Terms of Service</a>
          </div>

          <div className="landing-footer-col">
            <span className="landing-footer-col-title">Security</span>
            <a className="landing-footer-link" href="#">HIPAA Compliance</a>
            <a className="landing-footer-link" href="#">Security Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
