import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import { SortDropdownProps } from './types';

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  options,
  className = ""
}) => {
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowUpDown className="h-4 w-4 text-gray-400" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48 input-field">
          <SelectValue placeholder="Sort by...">
            {selectedOption?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="text-white hover:bg-slate-700 focus:bg-slate-700"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};