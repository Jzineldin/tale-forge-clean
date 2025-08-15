import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useSettings } from '@/hooks/useSettings';
import { 
  Settings as SettingsIcon,
  User,
  BookOpen,
  CreditCard,
  Shield,
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Bell,
  Eye,
  Type,
  Palette
} from 'lucide-react';

const Settings = () => {
  const { user } = useSecureAuth();
  const navigate = useNavigate();
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [activeTab, setActiveTab] = useState('user-preferences');

  const handleBack = () => {
    navigate('/');
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleReset = () => {
    resetToDefaults();
  };

  const tabs = [
    { id: 'user-preferences', label: 'User Preferences', icon: User },
    { id: 'account-management', label: 'Account Management', icon: User },
    { id: 'reading-preferences', label: 'Reading Preferences', icon: BookOpen },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'admin-settings', label: 'Admin Settings', icon: Shield }
  ];

  const renderUserPreferences = () => (
    <div className="profile-settings-grid">
      {/* Theme & Appearance */}
      <div className="settings-section">
        <h3 className="text-heading mb-2 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme & Appearance
        </h3>
        <p className="text-body text-muted mb-4">Customize how Tale Forge looks and feels.</p>
        
        <div className="settings-option">
          <label className="text-body">Theme</label>
          <p className="text-small text-muted mb-2">Choose your preferred color theme</p>
          <select 
            value={settings.theme || 'system'} 
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="input-field"
          >
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="settings-option">
          <label className="text-body">Font Size</label>
          <p className="text-small text-muted mb-2">Adjust the text size throughout the application</p>
          <select 
            value={settings.fontSize || 'medium'} 
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
            className="input-field"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="settings-option">
          <label className="text-body">High Contrast Mode</label>
          <p className="text-small text-muted mb-2">Increase contrast for better readability</p>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.highContrast || false}
              onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Notifications & Sounds */}
      <div className="settings-section">
        <h3 className="text-heading mb-2 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications & Sounds
        </h3>
        <p className="text-body text-muted mb-4">Control alerts and audio feedback.</p>
        
        <div className="settings-option">
          <label className="text-body">Notification Preferences</label>
          <p className="text-small text-muted mb-2">Choose which notifications you want to receive</p>
          <select 
            value={settings.notifications || 'important'} 
            onChange={(e) => handleSettingChange('notifications', e.target.value)}
            className="input-field"
          >
            <option value="all">All Notifications</option>
            <option value="important">Important Only</option>
            <option value="none">No Notifications</option>
          </select>
        </div>

        <div className="settings-option">
          <label className="text-body">Sound Effects</label>
          <p className="text-small text-muted mb-2">Enable sound effects for interactions</p>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.soundEffects || false}
              onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderReadingPreferences = () => (
    <div className="profile-settings-grid">
      {/* Reading Experience */}
      <div className="settings-section">
        <h3 className="text-heading mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Reading Experience
        </h3>
        <p className="text-body text-muted mb-4">Customize your story reading experience.</p>
        
        <div className="settings-option">
          <label className="text-body">Auto-Scroll</label>
          <p className="text-small text-muted mb-2">Automatically scroll through story content</p>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.autoScroll || false}
              onChange={(e) => handleSettingChange('autoScroll', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-option">
          <label className="text-body">Auto-Scroll Speed</label>
          <p className="text-small text-muted mb-2">Adjust how fast content scrolls automatically</p>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={settings.scrollSpeed || 5}
            onChange={(e) => handleSettingChange('scrollSpeed', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-small text-muted mt-1">
            <span>1</span>
            <span>{settings.scrollSpeed || 5}</span>
            <span>10</span>
          </div>
        </div>

        <div className="settings-option">
          <label className="text-body">Chapter Transition Effect</label>
          <p className="text-small text-muted mb-2">Choose how to transition between story chapters</p>
          <select 
            value={settings.chapterTransition || 'fade'} 
            onChange={(e) => handleSettingChange('chapterTransition', e.target.value)}
            className="input-field"
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Content Display */}
      <div className="settings-section">
        <h3 className="text-heading mb-2 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Content Display
        </h3>
        <p className="text-body text-muted mb-4">Control how story content is displayed.</p>
        
        <div className="settings-option">
          <label className="text-body">Show Image Captions</label>
          <p className="text-small text-muted mb-2">Display captions under story images</p>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.showImageCaptions || false}
              onChange={(e) => handleSettingChange('showImageCaptions', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-option">
          <label className="text-body">Text-to-Speech</label>
          <p className="text-small text-muted mb-2">Enable text-to-speech for story content</p>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.textToSpeech || false}
              onChange={(e) => handleSettingChange('textToSpeech', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-preferences':
        return renderUserPreferences();
      case 'reading-preferences':
        return renderReadingPreferences();
      case 'account-management':
        return (
          <div className="settings-section">
            <h3 className="text-heading">Account Management</h3>
            <p className="text-body text-muted">Manage your account settings and preferences.</p>
            <p className="text-body text-muted mt-4">This section is under development.</p>
          </div>
        );
      case 'subscription':
        return (
          <div className="settings-section">
            <h3 className="text-heading">Subscription</h3>
            <p className="text-body text-muted">Manage your subscription and billing.</p>
            <p className="text-body text-muted mt-4">This section is under development.</p>
          </div>
        );
      case 'admin-settings':
        return (
          <div className="settings-section">
            <h3 className="text-heading">Admin Settings</h3>
            <p className="text-body text-muted">Administrative controls and system settings.</p>
            <p className="text-body text-muted mt-4">This section is under development.</p>
          </div>
        );
      default:
        return renderUserPreferences();
    }
  };

  if (!user) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="text-center">
            <h1 className="text-heading">Access Denied</h1>
            <p className="text-body">Please sign in to access settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleBack}
            className="btn-ghost p-2 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-hero flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-primary-amber" />
              Settings
            </h1>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-bg-secondary rounded-lg p-1 border border-border-primary">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-amber text-text-dark shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="profile-settings-container">
          {renderTabContent()}
        </div>

        {/* Reset Button */}
        <div className="flex justify-end mt-8">
          <button 
            onClick={handleReset}
            className="reset-button"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;