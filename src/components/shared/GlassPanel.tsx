import React from 'react';

type Intrinsic = keyof JSX.IntrinsicElements;

type GlassPanelProps<T extends Intrinsic = 'div'> = {
  variant?: 'default' | 'lg' | 'elevated' | 'dark';
  as?: T;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

const variantClassMap: Record<'default' | 'lg' | 'elevated' | 'dark', string> = {
  default: 'glass',
  lg: 'glass-lg',
  elevated: 'glass-lg glass-elevated',
  dark: 'glass-panel-enhanced',
};

function GlassPanel<T extends Intrinsic = 'div'>(props: GlassPanelProps<T>) {
  const {
    as,
    variant = 'default',
    className = '',
    children,
    ...rest
  } = props;

  const Comp = (as || 'div') as any;
  const base = variantClassMap[variant];
  const merged = [base, className].filter(Boolean).join(' ').trim();

  return <Comp className={merged} {...(rest as any)}>{children}</Comp>;
}

export default GlassPanel;