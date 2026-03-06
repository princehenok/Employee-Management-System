import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignIn.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await axios.post('http://localhost:3000/api/users/login', {
        email,
        password,
      });

      const user = response.data;

      // Redirect based on user role
      const role = user.role.toLowerCase();
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        setErrorMsg('Unauthorized user role.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="signin-wrapper">
      <form className="signin-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <label>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="signin-btn">Sign In</button>

        <div className="forgot-container">
          <p className="forgot-link" onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
