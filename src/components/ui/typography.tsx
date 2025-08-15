import * as React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {}

export const H1: React.FC<TypographyProps> = ({ className, children, ...props }) => (
  <h1 className={cn('text-title text-shadow-strong', className)} {...props}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ className, children, ...props }) => (
  <h2 className={cn('text-heading', className)} {...props}>
    {children}
  </h2>
);

export const Subheading: React.FC<TypographyProps> = ({ className, children, ...props }) => (
  <p className={cn('text-subheading', className)} {...props}>
    {children}
  </p>
);

export const BodyText: React.FC<TypographyProps> = ({ className, children, ...props }) => (
  <p className={cn('text-body', className)} {...props}>
    {children}
  </p>
);
