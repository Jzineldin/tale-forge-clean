
import React from 'react';

import { CheckCircle, Clock } from 'lucide-react';

const FeatureStatusBanner: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 md:gap-6 text-center flex-wrap">
          {/* Working Features */}
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span className="text-green-300 text-sm font-medium font-sans">
              Story Generation Active
            </span>
          </div>
          
          {/* Separator */}
          <div className="h-4 w-px bg-slate-600 hidden sm:block"></div>
          
          {/* Upcoming Features */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span className="text-amber-300 text-sm font-medium font-sans">
              Audio & Images Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureStatusBanner;
