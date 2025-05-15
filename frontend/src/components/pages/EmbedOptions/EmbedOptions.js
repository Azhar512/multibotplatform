import React, { useState } from 'react';
import { Menu, X, ChevronRight, Github, Twitter, Linkedin, Mail, Copy, Upload, RefreshCw } from 'lucide-react';
import './EmbedOptionsPage.css';
const EmbedOptions = () => {
  const [activeTab, setActiveTab] = useState('embed-options');
  const [customization, setCustomization] = useState({
    theme: 'dark',
    width: '380',
    height: '600',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    avatar: null,
  });
  const [showCopied, setShowCopied] = useState(false);

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' },
  ];

  const themes = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'custom', label: 'Custom Theme' },
  ];

  const handleCustomizationChange = (field, value) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCustomizationChange('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateEmbedCode = () => {
    return `<script>
  window.embedConfig = {
    theme: "${customization.theme}",
    width: "${customization.width}px",
    height: "${customization.height}px",
    position: "${customization.position}",
    primaryColor: "${customization.primaryColor}",
    secondaryColor: "${customization.secondaryColor}"
  };
</script>
<script src="https://embed.example.com/widget.js"></script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const resetCustomization = () => {
    setCustomization({
      theme: 'dark',
      width: '380',
      height: '600',
      position: 'bottom-right',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      avatar: null,
    });
  };

  return (
    <div className="page-container">
      <main>
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-content">
            <h1 className="hero-title">EmbedOptions</h1>
            <p className="hero-description">
              Customize and embed your chat interface seamlessly.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs">
          <div className="tabs-container">
            {[
              { id: 'embed-options', label: 'Embed Options' },
              { id: 'features', label: 'Features' },
              { id: 'pricing', label: 'Pricing' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customization Section */}
        <div className="main-content">
          <section className="customization-section">
            <h2 className="section-title">Customize Your Chat Widget</h2>
            
            <div className="customization-grid">
              {/* Theme Selection */}
              <div className="customization-item">
                <label className="input-label">Theme</label>
                <select 
                  className="select-input"
                  value={customization.theme}
                  onChange={(e) => handleCustomizationChange('theme', e.target.value)}
                >
                  {themes.map(theme => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Customization */}
              <div className="customization-item">
                <label className="input-label">Width (px)</label>
                <input
                  type="number"
                  className="number-input"
                  value={customization.width}
                  onChange={(e) => handleCustomizationChange('width', e.target.value)}
                />
              </div>

              <div className="customization-item">
                <label className="input-label">Height (px)</label>
                <input
                  type="number"
                  className="number-input"
                  value={customization.height}
                  onChange={(e) => handleCustomizationChange('height', e.target.value)}
                />
              </div>

              {/* Position Selection */}
              <div className="customization-item">
                <label className="input-label">Position</label>
                <select
                  className="select-input"
                  value={customization.position}
                  onChange={(e) => handleCustomizationChange('position', e.target.value)}
                >
                  {positions.map(position => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Customization */}
              <div className="customization-item">
                <label className="input-label">Primary Color</label>
                <input
                  type="color"
                  className="color-input"
                  value={customization.primaryColor}
                  onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                />
              </div>

              <div className="customization-item">
                <label className="input-label">Secondary Color</label>
                <input
                  type="color"
                  className="color-input"
                  value={customization.secondaryColor}
                  onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                />
              </div>

              {/* Avatar Upload */}
              <div className="customization-item">
                <label className="input-label">Bot Avatar</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="file-input"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="file-input-label">
                    <Upload size={16} />
                    Upload Avatar
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="preview-section">
              <h3 className="preview-title">Preview</h3>
              <div 
                className="preview-container"
                style={{
                  backgroundColor: customization.theme === 'dark' ? '#1f2937' : '#ffffff',
                  color: customization.theme === 'dark' ? '#ffffff' : '#1f2937',
                }}
              >
                <div className="preview-chat">
                  {customization.avatar && (
                    <img 
                      src={customization.avatar} 
                      alt="Bot Avatar" 
                      className="preview-avatar"
                    />
                  )}
                  <div 
                    className="preview-message"
                    style={{ backgroundColor: customization.primaryColor }}
                  >
                    Hello! How can I help you today?
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code Section */}
            <div className="embed-code-section">
              <h3 className="embed-code-title">Embed Code</h3>
              <div className="code-container">
                <textarea
                  readOnly
                  className="code-textarea"
                  value={generateEmbedCode()}
                />
                <button 
                  className="copy-button"
                  onClick={copyToClipboard}
                >
                  {showCopied ? 'Copied!' : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="reset-button"
                onClick={resetCustomization}
              >
                <RefreshCw size={16} />
                Reset to Default
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer remains unchanged */}
      <footer className="footer">
        {/* ... existing footer code ... */}
      </footer>
    </div>
  );
};

export default EmbedOptions;