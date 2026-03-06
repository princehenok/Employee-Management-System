import React, { useState } from 'react';
import './AdminDashboard.css';
import UserControl from './UserControl'; // Adjust the path as needed


function AdminDashboard() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTask, setActiveTask] = useState(null);

  const adminTasks = [
  { title: 'User Control', icon: '👥', component: <UserControl /> },
  { title: 'Access Management', icon: '🔐', component: <p>Manage access permissions.</p> },
  { title: 'Employee Overview', icon: '📋', component: <p>View employee status.</p> },
  { title: 'Profile Auditing', icon: '🗂️', component: <p>Audit user profiles.</p> },
  { title: 'Content Editing', icon: '✍️', component: <p>Edit internal content.</p> },
  { title: 'Analytics & Reporting', icon: '📊', component: <p>View analytics data.</p> },
  { title: 'Department Control', icon: '🏢', component: <p>Manage departments.</p> },
  { title: 'Leave Management', icon: '🗃️', component: <p>Manage leave requests.</p> },
  { title: 'System Settings', icon: '🧾', component: <p>Configure system settings.</p> }
];


  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="admin-dashboard">
      {sidebarVisible && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Admin Panel</h2>
            <button className="hamburger-button" onClick={toggleSidebar}>
              ☰
            </button>
          </div>
          <ul>
            {adminTasks.map((task) => (
              <li key={task.title} onClick={() => setActiveTask(task)}>
                {task.icon} {task.title}
              </li>
            ))}
          </ul>
        </aside>
      )}

      {!sidebarVisible && (
        <button className="floating-hamburger" onClick={toggleSidebar}>
          ☰
        </button>
      )}

      <main className="dashboard-content">
  {activeTask ? (
    <div className="task-content">
      <h1>{activeTask.icon} {activeTask.title}</h1>
      <div>{activeTask.component}</div>
    </div>
  ) : (
    <h1 className="welcome-message">Welcome, Admin</h1>
  )}
</main>

    </div>
  );
}

export default AdminDashboard;
