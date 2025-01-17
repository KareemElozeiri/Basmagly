import React from 'react';

const Theme = ({ isDark, onToggle }) => {
  return (
    <div className="theme-toggle" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div className="toggle-switch">
        <input
          type="checkbox"
          id="theme-switch"
          className="toggle-input"
          checked={isDark}
          onChange={onToggle}
        />
        <label htmlFor="theme-switch" className="toggle-label">
          <span className="toggle-button" />
        </label>
      </div>
      {/* <span style={{ display: isDark ? 'block' : 'none' }}>Dark Mode</span> */}
    </div>
  );
};

export default Theme;