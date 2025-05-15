import React, { useState, useEffect } from 'react';
import { Search, Download, MessageSquare, Ban, Trash2, Calendar, Activity, Users } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './UsersPage.css';

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

const UsersPage = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    dateJoined: '',
    interactionFrequency: '',
    sentiment: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: {
          search: searchTerm,
          dateJoined: filters.dateJoined,
          interactionFrequency: filters.interactionFrequency,
          sentiment: filters.sentiment,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage
        }
      });

      setUsers(response.data.users);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        total: response.data.total
      }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('newUser', (user) => {
      setUsers(prev => [user, ...prev]);
      toast.success('New user registered!');
    });

    socket.on('userUpdated', (updatedUser) => {
      setUsers(prev => prev.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
    });

    socket.on('userDeleted', (userId) => {
      setUsers(prev => prev.filter(user => user._id !== userId));
    });

    return () => {
      socket.off('connect');
      socket.off('newUser');
      socket.off('userUpdated');
      socket.off('userDeleted');
      socket.disconnect();
    };
  }, []);

  // Fetch users when filters or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filters, pagination.currentPage, pagination.itemsPerPage]);

  // User actions
  const handleBanUser = async (userId) => {
    try {
      await axios.put(`${API_BASE_URL}/users/${userId}/ban`);
      toast.success('User banned successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleSendMessage = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/messages/${userId}`);
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleExportData = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/export`);
      const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-${userId}-data.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export user data');
    }
  };

  // Sentiment indicator component
  const SentimentIndicator = ({ value }) => {
    let backgroundColor = '#e74c3c';
    if (value >= 0.7) backgroundColor = '#2ecc71';
    else if (value >= 0.4) backgroundColor = '#f1c40f';

    return (
      <div className="sentiment-indicator">
        <div 
          className="sentiment-bar"
          style={{ 
            backgroundColor,
            width: `${value * 100}%`
          }}
        />
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchUsers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>View and manage users who interact with the bot.</p>
        </div>
      </header>

      <div className="search-filter-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            value={filters.dateJoined}
            onChange={(e) => setFilters({ ...filters, dateJoined: e.target.value })}
          >
            <option value="">Filter by Date Joined</option>
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="last90days">Last 90 days</option>
          </select>

          <select
            value={filters.interactionFrequency}
            onChange={(e) => setFilters({ ...filters, interactionFrequency: e.target.value })}
          >
            <option value="">Filter by Interaction Frequency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.sentiment}
            onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
          >
            <option value="">Filter by Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Last Interaction</th>
              <th>Interaction Count</th>
              <th>Sentiment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} onClick={() => setSelectedUser(user)}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.lastInteraction).toLocaleString()}</td>
                <td>{user.interactionCount}</td>
                <td><SentimentIndicator value={user.sentiment} /></td>
                <td className="action-buttons">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendMessage(user._id);
                    }}
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBanUser(user._id);
                    }}
                  >
                    <Ban size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(user._id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportData(user._id);
                    }}
                  >
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="items-per-page">
          <label>Items per page:</label>
          <select
            value={pagination.itemsPerPage}
            onChange={(e) => setPagination({
              ...pagination,
              itemsPerPage: Number(e.target.value),
              currentPage: 1
            })}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="page-controls">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination(prev => ({
              ...prev,
              currentPage: Math.max(1, prev.currentPage - 1)
            }))}
          >
            Previous
          </button>
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button 
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => setPagination(prev => ({
              ...prev,
              currentPage: prev.currentPage + 1
            }))}
          >
            Next
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="user-profile-panel">
          <div className="panel-header">
            <h2>User Profile</h2>
            <button onClick={() => setSelectedUser(null)}>×</button>
          </div>
          <div className="panel-content">
            <div className="profile-section">
              <h3>Profile Information</h3>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>ID:</strong> {selectedUser._id}</p>
              <p><strong>Date Joined:</strong> {new Date(selectedUser.dateJoined).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {selectedUser.status}</p>
            </div>
            <div className="interaction-section">
              <h3>Interaction Summary</h3>
              <p><strong>Total Interactions:</strong> {selectedUser.interactionCount}</p>
              <p><strong>Last Interaction:</strong> {new Date(selectedUser.lastInteraction).toLocaleString()}</p>
              <div className="sentiment-trend">
                <h4>Sentiment Trend</h4>
                <SentimentIndicator value={selectedUser.sentiment} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;