import React, { useState } from 'react';
import './CallInterface.css';

const CallInterface = ({
  callStatus,
  callData,
  onInitiateCall,
  onAnswerCall,
  onEndCall,
  personalitySettings,
  disabled
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dialpadVisible, setDialpadVisible] = useState(false);

  const handlePhoneNumberChange = (e) => {
    // Only allow digits, +, and ()
    const value = e.target.value.replace(/[^\d+()]/g, '');
    setPhoneNumber(value);
  };

  const handleKeyPadClick = (digit) => {
    setPhoneNumber(prev => prev + digit);
    
    // If in an active call, send DTMF tone
    if (callStatus === 'in-progress') {
      // Implementation for sending DTMF tone would go here
      console.log(`Sending DTMF tone: ${digit}`);
    }
  };

  const renderDialpad = () => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    
    return (
      <div className="dialpad">
        <div className="dialpad-grid">
          {digits.map(digit => (
            <button 
              key={digit} 
              className="dialpad-button"
              onClick={() => handleKeyPadClick(digit)}
              disabled={disabled}
            >
              {digit}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCallControls = () => {
    switch (callStatus) {
      case 'idle':
        return (
          <div className="call-controls">
            <div className="phone-input-container">
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Enter phone number..."
                className="phone-input"
                disabled={disabled}
              />
              <button 
                className="toggle-dialpad-button"
                onClick={() => setDialpadVisible(!dialpadVisible)}
                disabled={disabled}
              >
                {dialpadVisible ? 'Hide Dialpad' : 'Show Dialpad'}
              </button>
            </div>
            
            {dialpadVisible && renderDialpad()}
            
            <button
              className="call-button"
              onClick={() => onInitiateCall(phoneNumber)}
              disabled={!phoneNumber || disabled}
            >
              <span className="call-icon">📞</span> Call
            </button>
          </div>
        );
        
      case 'connecting':
        return (
          <div className="call-controls">
            <div className="call-status-message">
              <p>Connecting to {callData?.to || 'number'}...</p>
              <div className="connecting-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <button
              className="end-call-button"
              onClick={onEndCall}
              disabled={disabled}
            >
              <span className="end-call-icon">🔴</span> Cancel
            </button>
          </div>
        );
        
      case 'ringing':
        return (
          <div className="call-controls">
            <div className="call-status-message">
              <p>Incoming call from {callData?.from || 'unknown'}</p>
              <div className="ringing-animation">
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="incoming-call-buttons">
              <button
                className="answer-call-button"
                onClick={onAnswerCall}
                disabled={disabled}
              >
                <span className="answer-icon">✓</span> Answer
              </button>
              <button
                className="reject-call-button"
                onClick={onEndCall}
                disabled={disabled}
              >
                <span className="reject-icon">✗</span> Reject
              </button>
            </div>
          </div>
        );
        
      case 'in-progress':
        return (
          <div className="call-controls">
            <div className="active-call-info">
              <p className="active-call-label">On call with: {callData?.to || callData?.from || 'unknown'}</p>
              <div className="call-timer">
                <CallTimer startTime={callData?.startTime || new Date()} />
              </div>
            </div>
            
            <div className="in-call-buttons">
              <button
                className="toggle-mute-button"
                onClick={() => console.log('Toggle mute')}
                disabled={disabled}
              >
                <span>🎤</span>
              </button>
              <button
                className="toggle-dialpad-button"
                onClick={() => setDialpadVisible(!dialpadVisible)}
                disabled={disabled}
              >
                <span>⌨️</span>
              </button>
              <button
                className="end-call-button"
                onClick={onEndCall}
                disabled={disabled}
              >
                <span className="end-call-icon">🔴</span> End Call
              </button>
            </div>
            
            {dialpadVisible && renderDialpad()}
            
            <div className="personality-status">
              <h3>Current Personality Settings:</h3>
              <div className="personality-indicators">
                {Object.entries(personalitySettings).map(([trait, value]) => (
                  <div key={trait} className="personality-indicator">
                    <span className="trait-name">{trait}</span>
                    <div className="trait-bar">
                      <div
                        className="trait-fill"
                        style={{ width: `${value}%`, backgroundColor: getTraitColor(trait, value) }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'ended':
        return (
          <div className="call-controls">
            <div className="call-ended-message">
              <p>Call ended</p>
              {callData && (
                <div className="call-details">
                  <p>{callData.direction === 'outgoing' ? `Called: ${callData.to}` : `From: ${callData.from}`}</p>
                  <p>Duration: {callData.duration || 'N/A'}</p>
                </div>
              )}
            </div>
            <button
              className="new-call-button"
              onClick={() => {
                setPhoneNumber('');
                window.location.reload(); // A simple way to reset the call interface
              }}
              disabled={disabled}
            >
              New Call
            </button>
          </div>
        );
        
      default:
        return (
          <div className="call-controls">
            <p>Call system error. Please refresh the page.</p>
          </div>
        );
    }
  };

  const getTraitColor = (trait, value) => {
    // Define color schemes for different traits
    const colors = {
      Empathy: `hsl(${120 * (value / 100)}, 70%, 50%)`,         // Green spectrum
      Assertiveness: `hsl(${220 - 120 * (value / 100)}, 70%, 50%)`, // Blue to red
      Humour: `hsl(${60 * (value / 100)}, 70%, 60%)`,           // Yellow spectrum
      Patience: `hsl(180, ${value}%, 50%)`,                      // Teal spectrum
      Confidence: `hsl(300, ${value}%, 50%)`                     // Purple spectrum
    };
    
    return colors[trait] || `hsl(200, ${value}%, 50%)`; // Default blue spectrum
  };

  return (
    <div className="call-interface">
      <div className="call-interface-header">
        <h2>AI Call Assistant</h2>
        <div className="call-status-indicator">
          <span className={`status-dot ${callStatus}`}></span>
          <span className="status-text">
            {callStatus === 'idle' ? 'Ready' :
             callStatus === 'connecting' ? 'Connecting...' :
             callStatus === 'ringing' ? 'Incoming Call' :
             callStatus === 'in-progress' ? 'In Call' :
             callStatus === 'ended' ? 'Call Ended' : 'Status Unknown'}
          </span>
        </div>
      </div>
      
      {renderCallControls()}
    </div>
  );
};

// Call Timer Component
const CallTimer = ({ startTime }) => {
  const [time, setTime] = useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((new Date() - new Date(startTime)) / 1000);
      setTime(elapsedSeconds);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  return <span className="timer">{formatTime(time)}</span>;
};

export default CallInterface;