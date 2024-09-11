// src/components/Config.jsx
import React, { useEffect, useState } from 'react';

export const shortcuts = {
  toggleTimer1: "KeyQ",
  toggleTimer2: "KeyW",
  shiftToggle: "KeyA",
  nextItem: "Period",
  prevItem: "Comma",
  fastFwd: "Slash",
  rewind: "KeyM",
  reset: "KeyR",
  secureKey: "AltLeft",
};

export const selectors = {
  toggleTimer1: "#timer-one-toggle-key",
  toggleTimer2: "#timer-two-toggle-key",
  nextItem: "#next-key",
  prevItem: "#previous-key",
  shiftToggle: "#shift-key",
  reset: "#reset-key",
  rewind: "#rewind-key",
  fastFwd: "#fast-fwd-key",
  autoShift: "#auto-shift",
  settingsButton: "#settingsButton",
  settingsModal: "#settingsModal",
  closeButton: ".close-button",
  data: "#data",
  background: "#background",
};

const getElement = (selector) => document.querySelector(selector);

const Config = ({ onClose }) => {
  const [config, setConfig] = useState(shortcuts);
  const [autoShift, setAutoShift] = useState(false);
  
  const handleKeyDown = (event, key) => {
    event.preventDefault();
    const newShortcut = event.code;
    setConfig((prevConfig) => ({ ...prevConfig, [key]: newShortcut }));
    localStorage.setItem(key, newShortcut);
  };

  const handleSave = () => {
    Object.entries(config).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    localStorage.setItem('autoShift', autoShift);
    onClose();
  };

  useEffect(() => {
    // Load settings from localStorage
    const loadSettings = () => {
      const loadedConfig = { ...shortcuts };
      Object.keys(shortcuts).forEach((key) => {
        const value = localStorage.getItem(key) || shortcuts[key];
        loadedConfig[key] = value;
      });
      setConfig(loadedConfig);
      setAutoShift(localStorage.getItem('autoShift') === 'true');
    };
    loadSettings();
  }, []);

  return (
    <div id={selectors.settingsModal.replace("#", "")} style={{ display: 'block' }} className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-md shadow-md w-11/12 max-w-md relative flex flex-col">
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">Keyboard Shortcuts Configuration</h2>
        <div className="space-y-4">
          {Object.keys(shortcuts).map((key) => (
            <div key={key} className="flex items-center">
              <label className="w-1/3">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</label>
              <input
                type="text"
                id={key}
                value={config[key]}
                onKeyDown={(event) => handleKeyDown(event, key)}
                readOnly
                className="ml-2 p-1 border rounded"
              />
            </div>
          ))}
          <div className="flex items-center">
            <label className="w-1/3">Auto Shift:</label>
            <input
              type="checkbox"
              id="auto-shift"
              checked={autoShift}
              onChange={(e) => setAutoShift(e.target.checked)}
              className="ml-2"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Config;
