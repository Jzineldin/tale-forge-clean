import React from 'react';
import { Search, X } from 'lucide-react';
import { SearchInputProps } from './types';

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search stories by title or description...",
  className = ""
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-xl w-full pl-10 pr-10 py-3 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-all duration-300"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};