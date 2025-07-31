import React from 'react';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  return (
    <div className="employee-dashboard">
      <header className="dashboard-header">
        <h2>Welcome, [Employee Name]</h2>
        <p>Your personalized dashboard</p>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>👤 Profile</h3>
          <p>View and update your personal information.</p>
        </div>

        <div className="dashboard-card">
          <h3>📄 Payslips</h3>
          <p>View your monthly payslips and salary details.</p>
        </div>

        <div className="dashboard-card">
          <h3>🗓️ Leave</h3>
          <p>Apply for leave and track your leave history.</p>
        </div>

        <div className="dashboard-card">
          <h3>🕒 Attendance</h3>
          <p>Check your check-in/out history and work hours.</p>
        </div>

        <div className="dashboard-card">
          <h3>📢 Announcements</h3>
          <p>Stay up to date with company news.</p>
        </div>

        <div className="dashboard-card">
          <h3>📈 Performance</h3>
          <p>View your reviews and performance feedback.</p>
        </div>

        <div className="dashboard-card">
          <h3>📁 Documents</h3>
          <p>Access HR forms, letters, and policies.</p>
        </div>

        <div className="dashboard-card">
          <h3>🎫 Support</h3>
          <p>Contact HR or raise a support request.</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
