import { useState, useCallback, useRef, useEffect } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface FieldConfig {
  rules?: ValidationRule[];
  label?: string;
  description?: string;
}

export interface FormConfig {
  [fieldName: string]: FieldConfig;
}

export interface FieldError {
  message: string;
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, FieldError | null>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Accessible Form Validation Hook
 * Provides comprehensive form validation with accessibility features
 * WCAG 2.1 AA Compliance: Success Criteria 3.3.1, 3.3.2, 3.3.3, 3.3.4
 */
export const useFormValidation = (
  initialValues: Record<string, any> = {},
  config: FormConfig = {}
) => {
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false
  });

  const errorAnnouncementRef = useRef<string>('');
  const firstErrorFieldRef = useRef<string | null>(null);

  // Validate a single field
  const validateField = useCallback((fieldName: string, value: any): FieldError | null => {
    const fieldConfig = config[fieldName];
    if (!fieldConfig?.rules) return null;

    for (const rule of fieldConfig.rules) {
      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return {
          message: rule.message || `${fieldConfig.label || fieldName} is required`,
          type: 'required'
        };
      }

      // Skip other validations if field is empty and not required
      if (!value || (typeof value === 'string' && !value.trim())) {
        continue;
      }

      // Min length validation
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        return {
          message: rule.message || `${fieldConfig.label || fieldName} must be at least ${rule.minLength} characters`,
          type: 'minLength'
        };
      }

      // Max length validation
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        return {
          message: rule.message || `${fieldConfig.label || fieldName} must be no more than ${rule.maxLength} characters`,
          type: 'maxLength'
        };
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return {
          message: rule.message || `${fieldConfig.label || fieldName} format is invalid`,
          type: 'pattern'
        };
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          return {
            message: customError,
            type: 'custom'
          };
        }
      }
    }

    return null;
  }, [config]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors: Record<string, FieldError | null> = {};
    let isValid = true;
    let firstErrorField: string | null = null;

    Object.keys(config).forEach(fieldName => {
      const error = validateField(fieldName, formState.values[fieldName]);
      newErrors[fieldName] = error;
      
      if (error && isValid) {
        isValid = false;
        firstErrorField = fieldName;
      }
    });

    setFormState(prev => ({
      ...prev,
      errors: newErrors,
      isValid
    }));

    firstErrorFieldRef.current = firstErrorField;
    return isValid;
  }, [formState.values, config, validateField]);

  // Set field value
  const setValue = useCallback((fieldName: string, value: any) => {
    setFormState(prev => {
      const newValues = { ...prev.values, [fieldName]: value };
      const error = validateField(fieldName, value);
      
      return {
        ...prev,
        values: newValues,
        errors: { ...prev.errors, [fieldName]: error },
        isValid: Object.values({ ...prev.errors, [fieldName]: error }).every(err => !err)
      };
    });
  }, [validateField]);

  // Set field as touched
  const setTouched = useCallback((fieldName: string, touched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: touched }
    }));
  }, []);

  // Handle field blur (mark as touched and validate)
  const handleBlur = useCallback((fieldName: string) => {
    setTouched(fieldName, true);
    const error = validateField(fieldName, formState.values[fieldName]);
    
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: error }
    }));
  }, [formState.values, validateField, setTouched]);

  // Handle form submission
  const handleSubmit = useCallback(async (
    onSubmit: (values: Record<string, any>) => Promise<void> | void
  ) => {
    const isValid = validateForm();
    
    // Mark all fields as touched
    const allTouched = Object.keys(config).reduce((acc, fieldName) => {
      acc[fieldName] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setFormState(prev => ({
      ...prev,
      touched: allTouched,
      isSubmitting: true
    }));

    if (!isValid) {
      // Focus first error field for accessibility
      if (firstErrorFieldRef.current) {
        const errorField = document.querySelector(`[name="${firstErrorFieldRef.current}"]`) as HTMLElement;
        if (errorField) {
          errorField.focus();
          errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // Announce errors to screen readers
      const errorCount = Object.values(formState.errors).filter(Boolean).length;
      errorAnnouncementRef.current = `Form has ${errorCount} error${errorCount !== 1 ? 's' : ''}. Please review and correct.`;
      
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      return;
    }

    try {
      await onSubmit(formState.values);
      errorAnnouncementRef.current = 'Form submitted successfully';
    } catch (error) {
      console.error('Form submission error:', error);
      errorAnnouncementRef.current = 'Form submission failed. Please try again.';
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.values, formState.errors, config, validateForm]);

  // Reset form
  const reset = useCallback((newValues: Record<string, any> = initialValues) => {
    setFormState({
      values: newValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false
    });
    errorAnnouncementRef.current = '';
    firstErrorFieldRef.current = null;
  }, [initialValues]);

  // Get field props for easy integration
  const getFieldProps = useCallback((fieldName: string) => {
    const fieldConfig = config[fieldName];
    const error = formState.errors[fieldName];
    const touched = formState.touched[fieldName];
    
    return {
      name: fieldName,
      value: formState.values[fieldName] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setValue(fieldName, e.target.value);
      },
      onBlur: () => handleBlur(fieldName),
      'aria-invalid': touched && error ? 'true' : 'false',
      'aria-describedby': [
        fieldConfig?.description ? `${fieldName}-description` : '',
        touched && error ? `${fieldName}-error` : ''
      ].filter(Boolean).join(' ') || undefined,
      'aria-required': fieldConfig?.rules?.some(rule => rule.required) ? 'true' : undefined
    };
  }, [formState.values, formState.errors, formState.touched, config, setValue, handleBlur]);

  // Get error message for a field
  const getFieldError = useCallback((fieldName: string) => {
    const error = formState.errors[fieldName];
    const touched = formState.touched[fieldName];
    return touched && error ? error.message : null;
  }, [formState.errors, formState.touched]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName: string) => {
    return formState.touched[fieldName] && !!formState.errors[fieldName];
  }, [formState.touched, formState.errors]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    setValue,
    setTouched,
    handleBlur,
    handleSubmit,
    reset,
    validateForm,
    getFieldProps,
    getFieldError,
    hasFieldError,
    errorAnnouncement: errorAnnouncementRef.current
  };
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message?: string): ValidationRule => {
    const rule: ValidationRule = { required: true };
    if (message) rule.message = message;
    return rule;
  },
  
  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address'
  }),
  
  minLength: (length: number, message?: string): ValidationRule => {
    const rule: ValidationRule = { minLength: length };
    if (message) rule.message = message;
    return rule;
  },
  
  maxLength: (length: number, message?: string): ValidationRule => {
    const rule: ValidationRule = { maxLength: length };
    if (message) rule.message = message;
    return rule;
  },
  
  password: (message?: string): ValidationRule => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: message || 'Password must be at least 8 characters with uppercase, lowercase, and number'
  })
};

export default useFormValidation;