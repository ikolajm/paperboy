import { type ReactNode } from 'react';
import { Label } from '../atoms/Label';
import { Input, type InputProps } from '../atoms/Input';
import { HelperText, type HelperTextProps } from '../atoms/HelperText';

export interface FormFieldProps {
  label: string;
  helperText?: string;
  showHelperText?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  inputProps?: Omit<InputProps, 'size' | 'state'>;
  className?: string;
}

export function FormField({
  label,
  helperText,
  showHelperText = true,
  error = false,
  size = 'md',
  inputProps = {},
  className,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1 items-start ${className ?? ''}`}>
      <Label size={size}>{label}</Label>
      <Input size={size} state={error ? 'error' : 'default'} {...inputProps} />
      {showHelperText && helperText && (
        <HelperText size={size} state={error ? 'error' : 'default'}>
          {helperText}
        </HelperText>
      )}
    </div>
  );
}
