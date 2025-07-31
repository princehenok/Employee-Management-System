import React, { useState } from 'react';
import './AdminDashboard.css';
import { Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const AdminDashboard = () => {
  // Sample employees data state
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Henok Teshe', department: 'Engineering', role: 'Developer', status: 'Active' },
    { id: 2, name: 'Sara Mekonnen', department: 'HR', role: 'HR Manager', status: 'Inactive' },
  ]);

  const [form, setForm] = useState({ name: '', department: '', role: '', status: 'Active' });
  const [editingId, setEditingId] = useState(null);

  // Chart sample data
  const pieData = {
    labels: ['Engineering', 'HR', 'Sales'],
    datasets: [
      {
        label: '# of Employees',
        data: [12, 5, 8],
        backgroundColor: ['#22c55e', '#3b82f6', '#facc15'],
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Hires',
        data: [3, 4, 2, 5, 6, 3],
        fill: false,
        borderColor: '#22c55e',
        tension: 0.1,
      },
    ],
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId !== null) {
      setEmployees(employees.map(emp => (emp.id === editingId ? { ...form, id: editingId } : emp)));
      setEditingId(null);
    } else {
      setEmployees([...employees, { ...form, id: Date.now() }]);
    }
    setForm({ name: '', department: '', role: '', status: 'Active' });
  };

  const handleEdit = (emp) => {
    setForm(emp);
    setEditingId(emp.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setEmployees(
      employees.map(emp =>
        emp.id === id ? { ...emp, status: emp.status === 'Active' ? 'Inactive' : 'Active' } : emp
      )
    );
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="charts-section">
        <div className="chart pie-chart">
          <h3>Employee Distribution</h3>
          <Pie data={pieData} />
        </div>

        <div className="chart line-chart">
          <h3>Hiring Trends</h3>
          <Line data={lineData} />
        </div>
      </div>

      {/* Employee Management Form */}
      <div className="employee-form-section">
        <h2>{editingId !== null ? 'Edit Employee' : 'Add Employee'}</h2>
        <form onSubmit={handleSubmit} className="employee-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            required
          />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button type="submit">{editingId !== null ? 'Update' : 'Add'}</button>
        </form>
      </div>

      {/* Employee Table */}
      <div className="employee-table-section">
        <h2>Employees</h2>
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td>{emp.role}</td>
                <td>
                  <button
                    className={`status-btn ${emp.status.toLowerCase()}`}
                    onClick={() => toggleStatus(emp.id)}
                    title="Toggle Status"
                  >
                    {emp.status}
                  </button>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(emp)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(emp.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
