#!/bin/bash

echo "🎨 Fixing CSS Styling Issues..."

# Navigate to frontend directory
cd /var/www/multibotplatform/frontend

# Install Tailwind CSS
echo "📦 Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      }
    },
  },
  plugins: [],
}
EOF

# Update index.css with proper Tailwind imports
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
}

/* Custom component styles */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.sidebar {
  @apply bg-white shadow-lg border-r border-gray-200;
}

.nav-item {
  @apply flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200;
}

.nav-item.active {
  @apply bg-blue-50 text-blue-600 border-r-2 border-blue-600;
}
EOF

# Create a proper Dashboard component with better styling
cat > src/components/Dashboard/Dashboard.js << 'EOF'
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';

const Dashboard = () => {
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'bot-interaction', name: 'Bot Interaction', icon: '🤖' },
    { id: 'embed-options', name: 'Embed Options', icon: '🔗' },
    { id: 'interaction-log', name: 'Interaction Log', icon: '📝' },
    { id: 'personality-settings', name: 'Personality Settings', icon: '⚙️' },
    { id: 'scenario-panel', name: 'Scenario Panel', icon: '🎬' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 sidebar`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">AI Bot Platform</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Bot Analytics</h3>
                <p className="text-gray-600 mb-6">Monitor your AI bot performance and user interactions.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,234</div>
                    <div className="text-sm text-blue-800">Total Interactions</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">89%</div>
                    <div className="text-sm text-green-800">Success Rate</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">567</div>
                    <div className="text-sm text-purple-800">Active Users</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">2.3s</div>
                    <div className="text-sm text-orange-800">Avg Response Time</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Interaction Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart will be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bot-interaction' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bot Interaction</h3>
              <p className="text-gray-600">Bot interaction interface will be displayed here.</p>
            </div>
          )}

          {activeTab === 'embed-options' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Embed Options</h3>
              <p className="text-gray-600">Embed configuration options will be displayed here.</p>
            </div>
          )}

          {activeTab === 'interaction-log' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Interaction Log</h3>
              <p className="text-gray-600">Interaction logs will be displayed here.</p>
            </div>
          )}

          {activeTab === 'personality-settings' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personality Settings</h3>
              <p className="text-gray-600">Personality configuration will be displayed here.</p>
            </div>
          )}

          {activeTab === 'scenario-panel' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Scenario Panel</h3>
              <p className="text-gray-600">Scenario management will be displayed here.</p>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Users</h3>
              <p className="text-gray-600">User management will be displayed here.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
              <p className="text-gray-600">Application settings will be displayed here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
EOF

# Rebuild the frontend
echo "🔨 Rebuilding frontend with proper CSS..."
npm run build

echo "✅ CSS styling fixed!"
echo "🚀 Frontend rebuilt with proper Tailwind CSS styling!"
