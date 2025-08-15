import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Glass card effect for settings
export interface SettingsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  className,
  ...props
}) => {
  return (
    <Card 
      className={cn(
        "bg-card border-border shadow-sm",
        className
      )} 
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-primary">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Individual setting item with toggle
export interface SettingToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}) => {
  // Create a safe checked value (default to false if undefined)
  const safeChecked = checked === undefined ? false : Boolean(checked);
  
  // Create a safe onCheckedChange handler
  const handleCheckedChange = (newChecked: boolean) => {
    try {
      onCheckedChange(newChecked);
    } catch (error) {
      console.error(`Error in toggle change handler for "${label}":`, error);
    }
  };
  
  return (
    <div className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4 mb-4">
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={safeChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
};

// Setting item with dropdown select
export interface SettingSelectProps<T extends string> {
  label: string;
  description?: string;
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}

export function SettingSelect<T extends string>({
  label,
  description,
  value,
  onValueChange,
  options,
  disabled = false,
}: SettingSelectProps<T>) {
  // Validate that the current value is one of the available options
  const isValidValue = options.some(option => option.value === value);
  
  // Use a safe value if the current value is invalid
  const safeValue = isValidValue ? value : (options[0]?.value || '');
  
  // Create a type-safe onValueChange handler
  const handleValueChange = (newValue: string) => {
    // Validate that the new value is one of the available options
    if (options.some(option => option.value === newValue)) {
      // Only call onValueChange with valid values
      onValueChange(newValue as T);
    } else {
      console.error(`Invalid value selected: ${newValue}`);
    }
  };
  
  return (
    <div className="flex flex-col space-y-2 rounded-lg border p-4 mb-4">
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Select
        value={safeValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Setting item with slider
export interface SettingSliderProps {
  label: string;
  description?: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
}

export const SettingSlider: React.FC<SettingSliderProps> = ({
  label,
  description,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled = false,
  showValue = true,
}) => {
  // Validate and sanitize the input value
  const sanitizedValue = React.useMemo(() => {
    // Ensure value is an array
    if (!Array.isArray(value)) {
      console.error('SettingSlider: value must be an array');
      return [min];
    }
    
    // Ensure value has at least one element
    if (value.length === 0) {
      console.error('SettingSlider: value array must not be empty');
      return [min];
    }
    
    // Ensure value is within bounds
    const safeValue = Math.max(min, Math.min(max, value[0]));
    
    // If the value needed to be adjusted, log a warning
    if (safeValue !== value[0]) {
      console.warn(`SettingSlider: value ${value[0]} was outside bounds [${min}, ${max}], adjusted to ${safeValue}`);
    }
    
    return [safeValue];
  }, [value, min, max]);
  
  // Create a safe onValueChange handler
  const handleValueChange = (newValue: number[]) => {
    if (Array.isArray(newValue) && newValue.length > 0) {
      // Ensure the new value is within bounds
      const safeValue = Math.max(min, Math.min(max, newValue[0]));
      onValueChange([safeValue]);
    }
  };
  
  return (
    <div className="flex flex-col space-y-2 rounded-lg border p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <Label className="text-base">{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {showValue && <span className="text-sm font-medium">{sanitizedValue[0]}</span>}
      </div>
      <Slider
        value={sanitizedValue}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={label}
        className="my-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// Section divider with title
export interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-medium text-primary">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};