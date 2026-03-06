import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserControl.css';

const BASE_URL = 'http://localhost:3000/api/users';

function UserControl() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(BASE_URL);
        setUsers(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
        setMessage({
          text: '❌ Failed to load users',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setMessage({
        text: '❌ Please fill all fields',
        type: 'error'
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(BASE_URL, newUser, {
        headers: { 'Content-Type': 'application/json' }
      });

      setUsers(prev => [...prev, response.data]);
      setNewUser({ name: '', email: '', password: '', role: 'Employee' });
      setMessage({
        text: `✅ User "${response.data.name}" added successfully!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error creating user:', err);
      setMessage({
        text: `❌ ${err.response?.data?.message || err.message || 'Failed to add user'}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/${id}`);

      setUsers(prev => prev.filter(user => user.id !== id));
      const deletedUser = users.find(user => user.id === id);
      setMessage({
        text: `🗑️ User "${deletedUser?.name}" deleted successfully!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage({
        text: `❌ ${err.response?.data?.message || err.message || 'Failed to delete user'}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Mask password with asterisks
  const maskPassword = (password) => {
    if (!password) return '';
    return '*'.repeat(password.length);
  };

  return (
    <div className="user-control-wrapper">
      <h2>User Management</h2>

      {/* Status Messages */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* Add User Form */}
      <div className="add-user-section">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={newUser.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newUser.password}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={newUser.role}
          onChange={handleChange}
        >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
        <button
          onClick={handleAddUser}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add User'}
        </button>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{maskPassword(user.password)}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-users">
                  {error ? 'Error loading users' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserControl;
