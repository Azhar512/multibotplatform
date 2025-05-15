import React, { useState, useEffect } from 'react';
import './PersonalitySettings.css';

const PersonalitySettings = () => {
  // Core personality settings
  const [tone, setTone] = useState('friendly');
  const [formalityLevel, setFormalityLevel] = useState(50);
  const [useEmojis, setUseEmojis] = useState(false);
  const [useSlang, setUseSlang] = useState(false);
  const [responseLength, setResponseLength] = useState('medium');
  const [showTypingIndicator, setShowTypingIndicator] = useState(true);

  // Messages
  const [greetingMessage, setGreetingMessage] = useState('Hello! How can I help you today?');
  const [farewellMessage, setFarewellMessage] = useState('Thank you for chatting! Have a great day!');
  const [errorMessage, setErrorMessage] = useState("I apologize, but I'm having trouble understanding that.");

  // Integration settings
  const [integrationConfig, setIntegrationConfig] = useState({
    apiKey: '',
    webhookUrl: '',
    crmSystem: 'none',
    enableVoice: false,
    enableChat: true,
    enableEmail: false
  });

  // Real-time preview
  const [previewQuery, setPreviewQuery] = useState('How can I help you?');
  const [previewResponse, setPreviewResponse] = useState('');

  // Training data
  const [trainingData, setTrainingData] = useState({
    uploadedFiles: [],
    customFAQs: [],
    lastTrainingDate: null
  });

  // Behavioral sliders
  const [behaviorSliders, setBehaviorSliders] = useState({
    empathy: 50,
    assertiveness: 50,
    Humor: 50,
    patience: 50,
    confidence: 50
  });

  // Features configuration
  const [features, setFeatures] = useState({
    callHandling: false,
    appointmentBooking: false,
    customerNotifications: false,
    returnsHandling: false
  });

  // Generate real-time preview based on current settings
  useEffect(() => {
    const generatePreview = () => {
      let response = '';
      const empathyLevel = behaviorSliders.empathy;
      const profLevel = behaviorSliders.assertiveness;

      if (empathyLevel > 75) {
        response = "Dear [Customer's Name],\n\nI truly understand how frustrating this experience must have been for you. . ";
      } else if (empathyLevel > 50) {
        response = "Dear [Customer's Name],\n\nThank you for sharing your concerns with us. ";
      } else {
        response = "Dear [Customer's Name],\n\nI appreciate you letting us know about this issue. ";
      }

      if (profLevel > 75) {
        response += "We take such matters seriously and have already initiated a review of what happened. Rest assured, corrective actions are being taken. ";
      } else if (profLevel > 50) {
        response += "We’ll look into this matter promptly and address any underlying issues.";
      } else {
        response += "We will investigate this matter and ensure that steps are taken to avoid such incidents in the future.";
      }

      if (useEmojis) response += " 😊";
      setPreviewResponse(response);
    };

    generatePreview();
  }, [behaviorSliders, useEmojis, tone, formalityLevel]);

  // Handle file upload for training
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setTrainingData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...files],
      lastTrainingDate: new Date().toISOString()
    }));
  };

  // Handle FAQ addition
  const handleAddFAQ = (question, answer) => {
    setTrainingData(prev => ({
      ...prev,
      customFAQs: [...prev.customFAQs, { question, answer }]
    }));
  };

  // Save all settings
  const handleSave = async () => {
    const settings = {
      personality: {
        tone,
        formalityLevel,
        useEmojis,
        useSlang,
        responseLength,
        showTypingIndicator,
        behaviorSliders
      },
      messages: {
        greeting: greetingMessage,
        farewell: farewellMessage,
        error: errorMessage
      },
      integration: integrationConfig,
      features,
      trainingData
    };

    console.log('Saving settings:', settings);
    // API call would go here
  };

  // Reset to defaults
  const handleReset = () => {
    setTone('friendly');
    setFormalityLevel(50);
    setUseEmojis(false);
    setUseSlang(false);
    setBehaviorSliders({
      empathy: 50,
      assertiveness: 50,
      Humor: 50,
      patience: 50,
      confidence: 50
    });
    setFeatures({
      callHandling: false,
      appointmentBooking: false,
      customerNotifications: false,
      returnsHandling: false
    });
    // Reset other states to defaults...
  };

  return (
    <div className="personality-settings-container">
      <header className="settings-header">
        <h1>AI Personality Configuration</h1>
        <p>Configure your AI assistant's personality and behavior</p>
      </header>

      <div className="settings-grid">
        {/* Behavior Sliders Section */}
        <section className="settings-section">
          <h2>Behavior Configuration</h2>
          <div className="sliders-container">
            {Object.entries(behaviorSliders).map(([trait, value]) => (
              <div key={trait} className="slider-group">
                <label>{trait.charAt(0).toUpperCase() + trait.slice(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setBehaviorSliders(prev => ({
                    ...prev,
                    [trait]: parseInt(e.target.value)
                  }))}
                  className="behavior-slider"
                />
                <span>{value}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Preview Section */}
        <section className="settings-section">
          <h2>Real-time Preview</h2>
          <div className="preview-container">
            <input
              type="text"
              value={previewQuery}
              onChange={(e) => setPreviewQuery(e.target.value)}
              placeholder="Type a sample query..."
              className="preview-input"
            />
            <div className="preview-response">
              <p>Bot would respond:</p>
              <div className="response-bubble">{previewResponse}</div>
            </div>
          </div>
        </section>

        {/* Integration Settings Section */}
        <section className="settings-section">
          <h2>Integration Settings</h2>
          <div className="integration-form">
            <div className="form-group">
              <label>API Key</label>
              <input
                type="text"
                value={integrationConfig.apiKey}
                onChange={(e) => setIntegrationConfig(prev => ({
                  ...prev,
                  apiKey: e.target.value
                }))}
                placeholder="Enter API Key"
              />
            </div>
            <div className="form-group">
              <label>Webhook URL</label>
              <input
                type="text"
                value={integrationConfig.webhookUrl}
                onChange={(e) => setIntegrationConfig(prev => ({
                  ...prev,
                  webhookUrl: e.target.value
                }))}
                placeholder="Enter Webhook URL"
              />
            </div>
            <div className="form-group">
              <label>CRM System</label>
              <select
                value={integrationConfig.crmSystem}
                onChange={(e) => setIntegrationConfig(prev => ({
                  ...prev,
                  crmSystem: e.target.value
                }))}
              >
                <option value="none">None</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="zendesk">Zendesk</option>
              </select>
            </div>
          </div>
        </section>

        {/* Features Configuration Section */}
        <section className="settings-section">
          <h2>Features Configuration</h2>
          <div className="features-grid">
            {Object.entries(features).map(([feature, enabled]) => (
              <label key={feature} className="feature-toggle">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setFeatures(prev => ({
                    ...prev,
                    [feature]: e.target.checked
                  }))}
                />
                {feature.split(/(?=[A-Z])/).join(' ')}
              </label>
            ))}
          </div>
        </section>

        {/* Training Data Section */}
        <section className="settings-section">
          <h2>Training Data</h2>
          <div className="training-container">
            <div className="file-upload">
              <label className="upload-label">
                Upload Training Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".txt,.csv,.json"
                />
              </label>
              <div className="uploaded-files">
                {trainingData.uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="faq-section">
              <h3>Custom FAQs</h3>
              {trainingData.customFAQs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <p><strong>Q:</strong> {faq.question}</p>
                  <p><strong>A:</strong> {faq.answer}</p>
                </div>
              ))}
              <button
                onClick={() => handleAddFAQ('New Question', 'New Answer')}
                className="add-faq-button"
              >
                Add FAQ
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="settings-actions">
        <button onClick={handleSave} className="save-button">
          Save Configuration
        </button>
        <button onClick={handleReset} className="reset-button">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default PersonalitySettings;