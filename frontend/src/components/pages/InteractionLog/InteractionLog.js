import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Download, Printer, RefreshCw, Flag, Archive, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import './Interactionlog.css';

const InteractionLog = () => {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [interactions, setInteractions] = useState([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 0,
    recentInteractions: 0,
    sentimentDistribution: {},
    averageResponseTime: 0
  });
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL);
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newInteraction', ({ interaction }) => {
      setInteractions(prev => {
        const updated = [interaction, ...prev];
        return updated.slice(0, itemsPerPage); 
      });
    });

    socket.on('analyticsUpdate', (metrics) => {
      setRealTimeMetrics(metrics);
    });

    socket.on('personalityUpdate', (settings) => {
      console.log('Personality settings updated:', settings);
    });

    return () => {
      socket.off('newInteraction');
      socket.off('analyticsUpdate');
      socket.off('personalityUpdate');
    };
  }, [socket, itemsPerPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (socket) {
        socket.emit('searchInteractions', {
          query: searchQuery,
          filters: {
            startDate,
            endDate,
            userId: selectedUser,
            sentiment: selectedSentiment
          }
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, startDate, endDate, selectedUser, selectedSentiment, socket]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSelectedUser('all');
    setSelectedSentiment('all');
    
    if (socket) {
      socket.emit('resetFilters');
    }
  };

  const handleStatusUpdate = (id, status) => {
    if (socket) {
      socket.emit('updateInteractionStatus', { id, status });
    }
  };

  const handleExport = (format) => {
    if (socket) {
      socket.emit('exportRequest', { format });
    }
  };

  const ConnectionStatus = () => (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <RefreshCw className={`status-icon ${isConnected ? 'spinning' : ''}`} />
      {isConnected ? 'Live' : 'Reconnecting...'}
    </div>
  );

  const MetricsDisplay = () => (
    <div className="metrics-panel">
      <div className="metric-card">
        <h3>Active Users</h3>
        <p>{realTimeMetrics.activeUsers}</p>
      </div>
      <div className="metric-card">
        <h3>Recent Interactions</h3>
        <p>{realTimeMetrics.recentInteractions}</p>
      </div>
      <div className="metric-card">
        <h3>Avg Response Time</h3>
        <p>{realTimeMetrics.averageResponseTime}ms</p>
      </div>
    </div>
  );

  return (
    <div className="interaction-log">
      <header className="header">
        <h1>Interaction Log</h1>
        <ConnectionStatus />
      </header>

      <MetricsDisplay />

      <section className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search interactions..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <Search className="search-icon" />
        </div>

        <div className="filter-controls">
          <div className="date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="user123">John Doe</option>
            <option value="user456">Jane Smith</option>
          </select>

          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          <button className="reset-button" onClick={handleReset}>
            Reset Filters
          </button>
        </div>
      </section>

      <section className="interaction-table">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>User</th>
              <th>Message</th>
              <th>Bot Response</th>
              <th>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((interaction) => (
              <tr
                key={interaction.id}
                onClick={() => setSelectedInteraction(interaction)}
                className={selectedInteraction?.id === interaction.id ? 'selected' : ''}
              >
                <td>{new Date(interaction.timestamp).toLocaleString()}</td>
                <td>{interaction.userName}</td>
                <td>{interaction.userMessage}</td>
                <td>{interaction.botResponse}</td>
                <td>
                  <span className={`sentiment ${interaction.sentiment}`}>
                    {interaction.sentiment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedInteraction && (
        <div className="details-panel">
          <h2>Interaction Details</h2>
          <div className="conversation-thread">
            <div className="message user">
              <strong>{selectedInteraction.userName}:</strong>
              <p>{selectedInteraction.userMessage}</p>
            </div>
            <div className="message bot">
              <strong>Bot:</strong>
              <p>{selectedInteraction.botResponse}</p>
            </div>
          </div>
          <div className="action-buttons">
            <button onClick={() => handleStatusUpdate(selectedInteraction.id, 'flagged')}>
              <Flag size={16} /> Flag
            </button>
            <button onClick={() => handleStatusUpdate(selectedInteraction.id, 'archived')}>
              <Archive size={16} /> Archive
            </button>
            <button 
              className="delete"
              onClick={() => handleStatusUpdate(selectedInteraction.id, 'deleted')}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="export-options">
          <button onClick={() => handleExport('csv')}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => handleExport('print')}>
            <Printer size={16} /> Print
          </button>
        </div>
        
        <div className="pagination">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          
          <div className="page-controls">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</button>
            <span>Page {currentPage}</span>
            <button onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InteractionLog;