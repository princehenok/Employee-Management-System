import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate sending email
    setTimeout(() => {
      alert(`A reset link has been sent to: ${email}`);
      navigate('/reset-password'); // Route to password reset
    }, 1000);
  };

  return (
    <div className="forgot-wrapper">
      <form className="forgot-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        <label>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="forgot-btn">Send Reset Link</button>

        <p className="back-to-login" onClick={() => navigate('/signin')}>
          ← Back to Sign In
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
