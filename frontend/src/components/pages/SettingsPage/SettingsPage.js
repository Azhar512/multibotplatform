import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';
import './SettingsPage.css';


const SettingsPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  return (
    <div className="page-container">
      <header className="header">
        <h1 className="header-title">Security Settings</h1>
        <div className="header-actions">
          <button className="header-button">
            <ChevronDown size={20} />
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="section">
          <h2 className="section-title">Password</h2>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Current Password
            </label>
            <div className="password-input">
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="password"
                className="form-input"
                placeholder="Enter your password"
              />
              <button className="password-toggle" onClick={togglePasswordVisibility}>
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="new-password" className="form-label">
              New Password
            </label>
            <div className="password-input">
              <input
                type="password"
                id="new-password"
                className="form-input"
                placeholder="Enter a new password"
              />
              <button className="password-toggle" onClick={togglePasswordVisibility}>
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Two-Factor Authentication</h2>
          <div className="form-group">
            <label htmlFor="two-factor" className="form-label">
              Enable Two-Factor Authentication
            </label>
            <div className="toggle-container">
              <button
                className={`toggle-button ${twoFactorEnabled ? 'active' : ''}`}
                onClick={toggleTwoFactor}
              >
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
          {twoFactorEnabled && (
            <div className="form-group">
              <p className="form-description">
                Two-factor authentication adds an extra layer of security to your account. You'll need
                to enter a code from your authenticator app in addition to your password when
                signing in.
              </p>
              <button className="setup-button">
                <Lock size={16} className="mr-2" />
                Set Up Two-Factor Authentication
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;