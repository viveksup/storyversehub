import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Type, Contrast, Volume2, MousePointer, Keyboard } from 'lucide-react';
import Button from './Button';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindFriendly: boolean;
}

const AccessibilityFeatures: React.FC = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindFriendly: false
  });

  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }

    // Check for system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Screen reader mode
    if (newSettings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }

    // Enhanced focus indicators
    if (newSettings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Color blind friendly
    if (newSettings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindFriendly: false
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="accessibility-toggle"
        leftIcon={<Eye size={18} />}
        title="Accessibility Options"
        aria-label="Open accessibility settings"
      >
        A11y
      </Button>

      {/* Accessibility Panel */}
      {showPanel && (
        <div className="accessibility-panel" role="dialog" aria-labelledby="accessibility-title">
          <div className="panel-header">
            <h3 id="accessibility-title">Accessibility Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(false)}
              aria-label="Close accessibility settings"
            >
              ×
            </Button>
          </div>

          <div className="panel-content">
            <div className="setting-section">
              <h4>Visual</h4>
              
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => updateSetting('highContrast', e.target.checked)}
                    aria-describedby="high-contrast-desc"
                  />
                  <Contrast size={16} />
                  <span>High Contrast</span>
                </label>
                <p id="high-contrast-desc" className="setting-description">
                  Increases contrast for better visibility
                </p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.largeText}
                    onChange={(e) => updateSetting('largeText', e.target.checked)}
                    aria-describedby="large-text-desc"
                  />
                  <Type size={16} />
                  <span>Large Text</span>
                </label>
                <p id="large-text-desc" className="setting-description">
                  Increases text size throughout the application
                </p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.colorBlindFriendly}
                    onChange={(e) => updateSetting('colorBlindFriendly', e.target.checked)}
                    aria-describedby="color-blind-desc"
                  />
                  <Eye size={16} />
                  <span>Color Blind Friendly</span>
                </label>
                <p id="color-blind-desc" className="setting-description">
                  Adjusts colors for better accessibility
                </p>
              </div>
            </div>

            <div className="setting-section">
              <h4>Motion & Animation</h4>
              
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    aria-describedby="reduced-motion-desc"
                  />
                  <MousePointer size={16} />
                  <span>Reduced Motion</span>
                </label>
                <p id="reduced-motion-desc" className="setting-description">
                  Minimizes animations and transitions
                </p>
              </div>
            </div>

            <div className="setting-section">
              <h4>Navigation</h4>
              
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.keyboardNavigation}
                    onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                    aria-describedby="keyboard-nav-desc"
                  />
                  <Keyboard size={16} />
                  <span>Enhanced Keyboard Navigation</span>
                </label>
                <p id="keyboard-nav-desc" className="setting-description">
                  Improves keyboard navigation support
                </p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.focusIndicators}
                    onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                    aria-describedby="focus-indicators-desc"
                  />
                  <Eye size={16} />
                  <span>Enhanced Focus Indicators</span>
                </label>
                <p id="focus-indicators-desc" className="setting-description">
                  Makes focus indicators more visible
                </p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.screenReaderMode}
                    onChange={(e) => updateSetting('screenReaderMode', e.target.checked)}
                    aria-describedby="screen-reader-desc"
                  />
                  <Volume2 size={16} />
                  <span>Screen Reader Optimized</span>
                </label>
                <p id="screen-reader-desc" className="setting-description">
                  Optimizes interface for screen readers
                </p>
              </div>
            </div>

            <div className="panel-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Skip to main content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
    </>
  );
};

export default AccessibilityFeatures;