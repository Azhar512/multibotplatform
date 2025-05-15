import React, { useState, useEffect, useRef } from 'react';
import { Search, LayoutDashboard, Database, Grid, Bell, Settings, ChevronDown, Users, BarChart2, Activity, Box } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const headerRef = useRef(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New report available", time: "2m ago" },
    { id: 2, text: "System update completed", time: "1h ago" },
    { id: 3, text: "Database backup successful", time: "3h ago" },
  ]);

  const dropdownData = {
    dashboard: [
      { icon: <Activity className={styles.iconSmall} />, label: 'Analytics', desc: 'View detailed metrics' },
      { icon: <BarChart2 className={styles.iconSmall} />, label: 'Reports', desc: 'Generated insights' },
      { icon: <Users className={styles.iconSmall} />, label: 'Team Stats', desc: 'Performance metrics' },
    ],
    database: [
      { icon: <Box className={styles.iconSmall} />, label: 'Raw Data', desc: 'Access data tables' },
      { icon: <Activity className={styles.iconSmall} />, label: 'Queries', desc: 'Run custom queries' },
      { icon: <BarChart2 className={styles.iconSmall} />, label: 'Exports', desc: 'Download reports' },
    ]
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownClick = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 1000);
    } else {
      setIsSearching(false);
    }
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          {/* Logo and Brand */}
          <div className={styles.brandContainer}>
            <div className={styles.logoBox}>
              <span>A</span>
            </div>
            <h1>Analytics Depot</h1>
          </div>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={`${styles.searchBox} ${isSearchFocused ? styles.focused : ''}`}>
              <input
                type="text"
                placeholder="Search analytics..."
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Search className={`${styles.searchIcon} ${isSearching ? styles.hidden : ''}`} />
              {isSearching && (
                <div className={styles.searchLoadingSpinner} />
              )}
            </div>
          </div>

          {/* Navigation Icons */}
          <div className={styles.navContainer}>
            <div className={styles.navIcons}>
              {/* Dashboard Button */}
              <div className={styles.dropdownContainer}>
                <button 
                  className={styles.navButton}
                  onClick={() => handleDropdownClick('dashboard')}
                >
                  <LayoutDashboard className={styles.icon} />
                  <ChevronDown className={`${styles.chevron} ${activeDropdown === 'dashboard' ? styles.rotated : ''}`} />
                </button>
                
                {activeDropdown === 'dashboard' && (
                  <div className={styles.dropdownMenu}>
                    {dropdownData.dashboard.map((item, index) => (
                      <button key={index} className={styles.dropdownItem}>
                        <div className={styles.dropdownIcon}>{item.icon}</div>
                        <div className={styles.dropdownContent}>
                          <div className={styles.dropdownLabel}>{item.label}</div>
                          <div className={styles.dropdownDescription}>{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Database Button */}
              <div className={styles.dropdownContainer}>
                <button 
                  className={styles.navButton}
                  onClick={() => handleDropdownClick('database')}
                >
                  <Database className={styles.icon} />
                  <ChevronDown className={`${styles.chevron} ${activeDropdown === 'database' ? styles.rotated : ''}`} />
                </button>
                
                {activeDropdown === 'database' && (
                  <div className={styles.dropdownMenu}>
                    {dropdownData.database.map((item, index) => (
                      <button key={index} className={styles.dropdownItem}>
                        <div className={styles.dropdownIcon}>{item.icon}</div>
                        <div className={styles.dropdownContent}>
                          <div className={styles.dropdownLabel}>{item.label}</div>
                          <div className={styles.dropdownDescription}>{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className={styles.navButton}>
                <Grid className={styles.icon} />
              </button>

              {/* Notifications */}
              <div className={styles.dropdownContainer}>
                <button 
                  className={styles.navButton}
                  onClick={() => handleDropdownClick('notifications')}
                >
                  <Bell className={styles.icon} />
                  {notifications.length > 0 && (
                    <span className={styles.notificationBadge} />
                  )}
                </button>
                
                {activeDropdown === 'notifications' && (
                  <div className={`${styles.dropdownMenu} ${styles.notificationsDropdown}`}>
                    <div className={styles.dropdownHeader}>
                      <h3>Notifications</h3>
                    </div>
                    <div className={`${styles.notificationsList} ${styles.customScrollbar}`}>
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className={styles.notificationItem}>
                            <div className={styles.notificationContent}>
                              <p className={styles.notificationText}>{notif.text}</p>
                              <p className={styles.notificationTime}>{notif.time}</p>
                            </div>
                            <button 
                              onClick={() => clearNotification(notif.id)}
                              className={styles.clearNotification}
                            >
                              Clear
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noNotifications}>
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className={styles.navButton}>
                <Settings className={styles.icon} />
              </button>
            </div>

            {/* Profile Section */}
            <div className={styles.dropdownContainer}>
              <button 
                className={styles.profileButton}
                onClick={() => handleDropdownClick('profile')}
              >
                <div className={styles.profileImage}>
                  <img
                    src="/api/placeholder/32/32"
                    alt="Profile"
                  />
                </div>
              </button>

              {activeDropdown === 'profile' && (
                <div className={`${styles.dropdownMenu} ${styles.profileDropdown}`}>
                  <button className={styles.profileDropdownItem}>Your Profile</button>
                  <button className={styles.profileDropdownItem}>Settings</button>
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.profileDropdownItem} ${styles.logout}`}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;