import React from 'react';
import { FeatureFlag } from '@/optimization/core/types';
import { Info, Check, AlertTriangle } from 'lucide-react';

interface FeatureToggleProps {
  feature: FeatureFlag;
  onChange: (enabled: boolean) => void;
  onRolloutChange?: (percentage: number) => void;
  showDetails?: boolean;
}

/**
 * A reusable component for toggling optimization features
 */
const FeatureToggle: React.FC<FeatureToggleProps> = ({
  feature,
  onChange,
  onRolloutChange,
  showDetails = false
}) => {
  const handleToggle = () => {
    onChange(!feature.enabled);
  };

  const handleRolloutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (onRolloutChange && !isNaN(value) && value >= 0 && value <= 100) {
      onRolloutChange(value);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-white font-medium">{feature.name}</h3>
          {feature.dependencies && feature.dependencies.length > 0 && (
            <div className="ml-2 relative group">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-700 text-white text-xs p-2 rounded shadow-lg w-48 z-10">
                <p className="font-semibold mb-1">Dependencies:</p>
                <ul className="list-disc pl-4">
                  {feature.dependencies.map(dep => (
                    <li key={dep}>{dep}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            feature.enabled ? 'bg-purple-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              feature.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {feature.description && (
        <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
      )}
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-2">Rollout Percentage</span>
              <div className="relative group">
                <Info className="h-4 w-4 text-gray-500" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-700 text-white text-xs p-2 rounded shadow-lg w-48 z-10">
                  Controls what percentage of users will have this feature enabled. Useful for gradual rollouts and A/B testing.
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={feature.rolloutPercentage}
                onChange={handleRolloutChange}
                className="w-24 mr-2"
                disabled={!feature.enabled}
              />
              <span className="text-white text-sm w-8">{feature.rolloutPercentage}%</span>
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <div className={`h-2 flex-grow rounded-full overflow-hidden ${feature.enabled ? 'bg-slate-700' : 'bg-slate-900'}`}>
              <div 
                className="h-full bg-purple-600" 
                style={{ width: `${feature.rolloutPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {feature.enabled && feature.rolloutPercentage === 100 && (
            <div className="flex items-center mt-2 text-green-500 text-xs">
              <Check className="h-3 w-3 mr-1" />
              Fully enabled for all users
            </div>
          )}
          
          {feature.enabled && feature.rolloutPercentage < 100 && (
            <div className="flex items-center mt-2 text-yellow-500 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Partial rollout ({feature.rolloutPercentage}% of users)
            </div>
          )}
          
          {!feature.enabled && (
            <div className="flex items-center mt-2 text-gray-500 text-xs">
              Feature is currently disabled
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeatureToggle;