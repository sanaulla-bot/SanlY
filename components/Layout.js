import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children, hideSidebar = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div>
      <Navbar onMenuClick={toggleSidebar} />
      {!hideSidebar && <Sidebar mini={!sidebarOpen} />}
      <main
        className={`main-content ${
          hideSidebar
            ? 'main-content-full'
            : sidebarOpen
            ? ''
            : 'main-content-mini'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
