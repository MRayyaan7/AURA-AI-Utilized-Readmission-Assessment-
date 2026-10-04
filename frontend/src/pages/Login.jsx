import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login and redirect to the dashboard
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      {/* Ambient Background */}
      <div className="login-glow-orb login-glow-orb-indigo"></div>
      <div className="login-glow-orb login-glow-orb-cyan"></div>

      {/* Main Login Card */}
      <main className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-brand">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              health_and_safety
            </span>
            <h1 className="login-brand-name">ReadmitAI</h1>
          </div>
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">
            Enter your credentials to access the clinical portal.
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* Email */}
          <div className="login-field">
            <label className="login-label" htmlFor="email">
              Email Address
            </label>
            <input
              className="login-input"
              id="email"
              name="email"
              placeholder="name@hospital.edu"
              required
              type="email"
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <div className="login-label-wrapper">
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <a className="login-link" href="#">
                Forgot password?
              </a>
            </div>
            <input
              className="login-input"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          {/* Submit Button */}
          <button className="login-btn-submit" type="submit">
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account? <br className="sm:hidden" />
            <span>Contact your hospital administrator.</span>
          </p>
        </div>
      </main>
    </div>
  );
}
