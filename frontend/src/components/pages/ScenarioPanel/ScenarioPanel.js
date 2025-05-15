import React, { useState } from 'react';
import { Menu, X, ChevronRight, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import './ScenarioPanel.css';

const ScenarioPanel = () => {
  const [activeTab, setActiveTab] = useState('assumptions');

  const scenarios = [
    { name: 'Baseline', description: 'Current trajectory', logo: '/api/placeholder/150/50' },
    { name: 'Optimistic', description: 'Accelerated growth', logo: '/api/placeholder/150/50' },
    { name: 'Pessimistic', description: 'Economic downturn', logo: '/api/placeholder/150/50' },
    { name: 'Disruption', description: 'Major industry shifts', logo: '/api/placeholder/150/50' }
  ];

  const drivers = [
    { name: 'GDP Growth', logo: '/api/placeholder/150/50' },
    { name: 'Inflation', logo: '/api/placeholder/150/50' },
    { name: 'Unemployment', logo: '/api/placeholder/150/50' },
    { name: 'Interest Rates', logo: '/api/placeholder/150/50' },
    { name: 'Consumer Spending', logo: '/api/placeholder/150/50' },
    { name: 'Business Investment', logo: '/api/placeholder/150/50' }
  ];

  return (
    <div className="page-container">
      <main>
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-content">
            <h1 className="hero-title">Scenario Planning</h1>
            <p className="hero-description">
              Explore the potential impact of different economic conditions on your business with our advanced scenario modeling.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs">
          <div className="tabs-container">
            {[
              { id: 'assumptions', label: 'Key Assumptions' },
              { id: 'scenarios', label: 'Scenario Models' },
              { id: 'impact', label: 'Business Impact' }
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

        {/* Content Sections */}
        <div className="main-content">
          <section className="section">
            <h2 className="section-title">Key Economic Drivers</h2>
            <p className="section-description">
              Monitor the variables that have the greatest influence on your business performance.
            </p>
            <div className="integration-grid">
              {drivers.map((driver, index) => (
                <div key={index} className="integration-card">
                  <img
                    src={driver.logo}
                    alt={driver.name}
                    className="integration-logo"
                  />
                  <h3 className="driver-name">{driver.name}</h3>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Scenario Models</h2>
            <p className="section-description">
              Analyze how your business may perform under different economic conditions.
            </p>
            <div className="integration-grid">
              {scenarios.map((scenario, index) => (
                <div key={index} className="integration-card">
                  <img
                    src={scenario.logo}
                    alt={scenario.name}
                    className="integration-logo"
                  />
                  <h3 className="scenario-name">{scenario.name}</h3>
                  <p className="scenario-description">{scenario.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-section">
              <h3 className="footer-title">Analytics Depot</h3>
              <p className="footer-text">
                Empowering businesses with advanced analytics and AI integration solutions.
              </p>
              <div className="social-links">
                <a href="#" className="social-link"><Github size={20} /></a>
                <a href="#" className="social-link"><Twitter size={20} /></a>
                <a href="#" className="social-link"><Linkedin size={20} /></a>
                <a href="#" className="social-link"><Mail size={20} /></a>
              </div>
            </div>

            <div className="footer-section">
              <h3 className="footer-title">Product</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">Features</a></li>
                <li><a href="#" className="footer-link">Integrations</a></li>
                <li><a href="#" className="footer-link">Enterprise</a></li>
                <li><a href="#" className="footer-link">Solutions</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3 className="footer-title">Resources</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">Documentation</a></li>
                <li><a href="#" className="footer-link">API Reference</a></li>
                <li><a href="#" className="footer-link">Community</a></li>
                <li><a href="#" className="footer-link">Blog</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3 className="footer-title">Company</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">About</a></li>
                <li><a href="#" className="footer-link">Careers</a></li>
                <li><a href="#" className="footer-link">Contact</a></li>
                <li><a href="#" className="footer-link">Legal</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Analytics Depot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ScenarioPanel;