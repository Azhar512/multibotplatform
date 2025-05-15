import React, { useState } from 'react';
import './CrmPanel.css';

const CrmPanel = ({
  customerData,
  callSummary,
  system,
  callInProgress
}) => {
  const [activeTab, setActiveTab] = useState('customer');
  
  // Define CRM-specific icons
  const crmIcons = {
    hubspot: '🟠',
    salesforce: '☁️',
    zoho: '🔵',
    none: '📋'
  };
  
  const renderCustomerInfo = () => {
    if (!customerData) {
      return (
        <div className="no-data-message">
          <p>No customer data available</p>
          {callInProgress && (
            <div className="loading-data">
              <p>Searching for customer information...</p>
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="customer-data">
        <div className="customer-header">
          <div className="customer-avatar">
            {customerData.avatar ? (
              <img src={customerData.avatar} alt="Customer" />
            ) : (
              <div className="avatar-placeholder">
                {customerData.name ? customerData.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="customer-name-info">
            <h3>{customerData.name || 'Unknown Customer'}</h3>
            <p className="customer-id">ID: {customerData.id || 'Unknown'}</p>
          </div>
        </div>
        
        <div className="customer-details">
          <div className="detail-section">
            <h4>Contact Information</h4>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{customerData.email || 'Not available'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{customerData.phone || 'Not available'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{customerData.address || 'Not available'}</span>
            </div>
          </div>
          
          {customerData.company && (
            <div className="detail-section">
              <h4>Company Information</h4>
              <div className="detail-item">
                <span className="detail-label">Company:</span>
                <span className="detail-value">{customerData.company.name || 'Not available'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Industry:</span>
                <span className="detail-value">{customerData.company.industry || 'Not available'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Size:</span>
                <span className="detail-value">{customerData.company.size || 'Not available'}</span>
              </div>
            </div>
          )}
          
          {customerData.history && (
            <div className="detail-section">
              <h4>Interaction History</h4>
              <div className="interaction-history">
                {customerData.history.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-date">{new Date(item.date).toLocaleDateString()}</div>
                    <div className="history-type">{item.type}</div>
                    <div className="history-notes">{item.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {customerData.stage && (
            <div className="detail-section">
              <h4>Customer Journey</h4>
              <div className="journey-stage">
                <div className="stage-label">Current Stage:</div>
                <div className="stage-value">{customerData.stage}</div>
              </div>
              <div className="journey-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${getStageProgress(customerData.stage)}%`
                    }}
                  ></div>
                </div>
                <div className="stage-markers">
                  <span className="stage-marker">Lead</span>
                  <span className="stage-marker">Prospect</span>
                  <span className="stage-marker">Qualified</span>
                  <span className="stage-marker">Customer</span>
                </div>
              </div>
            </div>
          )}
          
          {customerData.tags && customerData.tags.length > 0 && (
            <div className="detail-section">
              <h4>Tags</h4>
              <div className="customer-tags">
                {customerData.tags.map((tag, index) => (
                  <span key={index} className="customer-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderCallSummary = () => {
    if (!callSummary) {
      return (
        <div className="no-data-message">
          <p>No call summary available</p>
          {callInProgress && (
            <div className="generating-summary">
              <p>Call in progress. Summary will be generated when call ends.</p>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="call-summary-data">
        <div className="summary-section">
          <h4>Call Overview</h4>
          <div className="summary-item">
            <span className="summary-label">Date:</span>
            <span className="summary-value">{new Date(callSummary.timestamp).toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Duration:</span>
            <span className="summary-value">{formatDuration(callSummary.duration)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Direction:</span>
            <span className="summary-value">{callSummary.direction || 'N/A'}</span>
          </div>
        </div>
        
        <div className="summary-section">
          <h4>Call Summary</h4>
          <p className="summary-text">{callSummary.summary || 'No summary generated'}</p>
        </div>
        
        {callSummary.sentimentAnalysis && (
          <div className="summary-section">
            <h4>Sentiment Analysis</h4>
            <div className="sentiment-meter">
              <div className="sentiment-bar">
                <div 
                  className="sentiment-indicator" 
                  style={{ 
                    left: `${(callSummary.sentimentAnalysis.score + 1) * 50}%`,
                    backgroundColor: getSentimentColor(callSummary.sentimentAnalysis.score)
                  }}
                ></div>
              </div>
              <div className="sentiment-labels">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>
            <div className="sentiment-score">
              Score: {callSummary.sentimentAnalysis.score.toFixed(2)}
            </div>
          </div>
        )}
        
        {callSummary.keyPoints && callSummary.keyPoints.length > 0 && (
          <div className="summary-section">
            <h4>Key Points</h4>
            <ul className="key-points-list">
              {callSummary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}
        
        {callSummary.actionItems && callSummary.actionItems.length > 0 && (
          <div className="summary-section">
            <h4>Action Items</h4>
            <ul className="action-items-list">
              {callSummary.actionItems.map((item, index) => (
                <li key={index} className="action-item">
                  <input type="checkbox" id={`action-${index}`} />
                  <label htmlFor={`action-${index}`}>{item}</label>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="summary-actions">
          <button className="action-button edit-button">
            Edit Summary
          </button>
          <button className="action-button save-button">
            Save to {system.charAt(0).toUpperCase() + system.slice(1)}
          </button>
        </div>
      </div>
    );
  };
  
  const renderAdvancedTab = () => {
    // This tab could contain AI insights, recommendations, etc.
    return (
      <div className="advanced-insights">
        <div className="insight-section">
          <h4>AI Recommendations</h4>
          {!customerData ? (
            <p>Customer data required for recommendations</p>
          ) : (
            <div className="recommendations">
              <div className="recommendation-item">
                <h5>Next Steps</h5>
                <p>Based on the customer profile and interaction history, consider following up with a product demo focused on their specific industry needs.</p>
              </div>
              <div className="recommendation-item">
                <h5>Talking Points</h5>
                <ul>
                  <li>Reference their recent expansion into new markets</li>
                  <li>Address their previous concerns about implementation timeline</li>
                  <li>Highlight success stories from similar companies in their industry</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="insight-section">
          <h4>Customer Insights</h4>
          {!customerData ? (
            <p>No customer insights available</p>
          ) : (
            <div className="customer-insights">
              <div className="insight-item">
                <span className="insight-label">Lifetime Value:</span>
                <span className="insight-value">{customerData.ltv || 'Unknown'}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Retention Risk:</span>
                <span className="insight-value risk-indicator" data-risk={customerData.retentionRisk || 'medium'}>
                  {customerData.retentionRisk || 'Medium'}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Growth Opportunity:</span>
                <span className="insight-value opportunity-indicator" data-opportunity={customerData.growthOpportunity || 'medium'}>
                  {customerData.growthOpportunity || 'Medium'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="insight-section">
          <h4>Market Context</h4>
          <div className="market-context">
            <p>Industry growth: <strong>+4.8% YoY</strong></p>
            <p>Competitor activity: <strong>Medium</strong></p>
            <p>Latest market trends relevant to this customer:</p>
            <ul>
              <li>Increasing adoption of cloud solutions</li>
              <li>Growing emphasis on data security</li>
              <li>Rising investments in automation</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper functions
  const getStageProgress = (stage) => {
    const stages = {
      'Lead': 25,
      'Prospect': 50,
      'Qualified': 75,
      'Customer': 100
    };
    
    return stages[stage] || 0;
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getSentimentColor = (score) => {
    // Score ranges from -1 (negative) to 1 (positive)
    if (score < -0.5) return '#ff4d4d';      // Strong negative - red
    if (score < 0) return '#ff9999';         // Mild negative - light red
    if (score < 0.5) return '#99cc99';       // Mild positive - light green
    return '#4CAF50';                        // Strong positive - green
  };

  return (
    <div className="crm-panel">
      <div className="crm-header">
        <h3>
          {crmIcons[system] || '📋'} {system.charAt(0).toUpperCase() + system.slice(1)} CRM Panel
        </h3>
      </div>
      
      <div className="crm-tabs">
        <button 
          className={`tab-button ${activeTab === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveTab('customer')}
        >
          Customer Info
        </button>
        <button 
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Call Summary
        </button>
        <button 
          className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          AI Insights
        </button>
      </div>
      
      <div className="crm-content">
        {activeTab === 'customer' && renderCustomerInfo()}
        {activeTab === 'summary' && renderCallSummary()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>
    </div>
  );
};

export default CrmPanel;