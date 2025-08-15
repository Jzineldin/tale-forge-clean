import React, { useState, useEffect } from 'react';
import { OptimizerType, OptimizationConfig } from '@/optimization/core/types';
import { Save, RotateCcw, Check, X } from 'lucide-react';

interface ConfigurationPanelProps {
  optimizerType: OptimizerType;
  config: OptimizationConfig;
  onSave: (config: OptimizationConfig) => void;
  onReset: () => void;
}

/**
 * A reusable component for configuring optimizer settings
 */
const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  optimizerType,
  config,
  onSave,
  onReset
}) => {
  const [editedConfig, setEditedConfig] = useState<OptimizationConfig>(config);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  // Update local state when config changes
  useEffect(() => {
    setEditedConfig(config);
    setIsDirty(false);
  }, [config]);

  const handleToggleEnabled = () => {
    setEditedConfig(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
    setIsDirty(true);
  };

  const handleToggleFeature = (featureName: string) => {
    setEditedConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureName]: !prev.features[featureName]
      }
    }));
    setIsDirty(true);
  };

  const handleThresholdChange = (thresholdName: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setEditedConfig(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [thresholdName]: numValue
      }
    }));
    setIsDirty(true);
  };

  const handleOptionChange = (optionName: string, value: string) => {
    // Try to parse as number if possible
    let parsedValue: any = value;
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue.toString() === value) {
      parsedValue = numValue;
    }

    setEditedConfig(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [optionName]: parsedValue
      }
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(editedConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleReset = () => {
    onReset();
    setIsDirty(false);
    setSaveSuccess(null);
  };

  // Format option value for display
  const formatOptionValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Get human-readable name from camelCase
  const formatName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/-/g, ' ')
      .replace(/\./g, ' ');
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          {formatName(optimizerType)} Configuration
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg"
            title="Reset to defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`p-2 rounded-lg flex items-center ${
              isDirty
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-slate-700 text-gray-400 cursor-not-allowed'
            }`}
            title="Save changes"
          >
            <Save className="h-4 w-4" />
          </button>
          {saveSuccess !== null && (
            <span className={`ml-2 flex items-center ${saveSuccess ? 'text-green-500' : 'text-red-500'}`}>
              {saveSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Saved
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Failed
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Enabled/Disabled Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Optimizer Status</span>
          <button
            onClick={handleToggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              editedConfig.enabled ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                editedConfig.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Features Section */}
        <div>
          <h4 className="text-white font-medium mb-2">Features</h4>
          <div className="bg-slate-700 rounded-lg p-3 space-y-2">
            {Object.entries(editedConfig.features).map(([featureName, enabled]) => (
              <div key={featureName} className="flex items-center justify-between">
                <span className="text-gray-300">{formatName(featureName)}</span>
                <button
                  onClick={() => handleToggleFeature(featureName)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    enabled ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Thresholds Section */}
        <div>
          <h4 className="text-white font-medium mb-2">Thresholds</h4>
          <div className="bg-slate-700 rounded-lg p-3 space-y-2">
            {Object.entries(editedConfig.thresholds).map(([thresholdName, value]) => (
              <div key={thresholdName} className="flex items-center justify-between">
                <span className="text-gray-300">{formatName(thresholdName)}</span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleThresholdChange(thresholdName, e.target.value)}
                  className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 w-24 text-right"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Options Section */}
        <div>
          <h4 className="text-white font-medium mb-2">Options</h4>
          <div className="bg-slate-700 rounded-lg p-3 space-y-2">
            {Object.entries(editedConfig.options).map(([optionName, value]) => (
              <div key={optionName} className="flex items-center justify-between">
                <span className="text-gray-300">{formatName(optionName)}</span>
                <input
                  type="text"
                  value={formatOptionValue(value)}
                  onChange={(e) => handleOptionChange(optionName, e.target.value)}
                  className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 w-48 text-right"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;