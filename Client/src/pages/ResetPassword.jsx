import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    alert('Your password has been updated successfully!');
    navigate('/signin');
  };

  return (
    <div className="reset-wrapper">
      <form className="reset-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="reset-btn">Update Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
