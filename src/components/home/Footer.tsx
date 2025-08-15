
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  

  return (
    <footer className="redesign-footer overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Main footer row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left - Brand */}
          <div className="min-w-0 break-words">
            <span className="text-amber-300 font-semibold">Tale Forge</span>
            <p className="text-gray-300 text-sm">Where every story becomes legend</p>
          </div>

          {/* Center - Links */}
          <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <a href="mailto:info@tale-forge.app" className="hover:text-white">Contact</a>
          </div>

          {/* Right - Support with Psychology */}
          <div className="min-w-0 break-words">
            <div className="flex items-center gap-2 text-sm text-gray-300 flex-wrap">
              <span className="text-amber-300">Solo Dev Project</span>
              <span>$127 / $500 monthly</span>
            </div>
            <div className="h-2 bg-white/10 rounded mt-2 overflow-hidden">
              <div className="h-2 bg-amber-400/70 rounded" style={{width: '25.4%'}}></div>
            </div>
            <p className="text-gray-400 text-xs mt-2">$5 = Coffee & development time • $25 = Server & AI costs</p>
            <div className="mt-3 flex items-center gap-3 text-sm flex-wrap">
              <a href="https://paypal.me/zinfinityhs" target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded bg-white/10 border border-white/20 hover:bg-white/15 text-white">Support on PayPal</a>
              <span className="text-gray-300">47 supporters</span>
            </div>
          </div>
        </div>

        {/* Roadmap section - removed for a cleaner, professional footer */}

        {/* Bottom copyright */}
        <div className="mt-8 border-t border-white/10 pt-4 text-center text-gray-400 text-sm">
          <p>© 2025 Tale Forge • Made with ❤️ by <span className="text-white">worshipblank</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
