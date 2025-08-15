import { clsx } from 'clsx';

export function LoadingSpinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeMap = { sm: 24, md: 32, lg: 40 };
  return (
    <div
      className={clsx(
        'inline-flex',
        'rounded-full border-2 border-pink-200',
        'border-t-pink-400',
        className
      )}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        background:
          'linear-gradient(45deg, #fef3c7 25%, #f9a8d4 50%, #fed7aa 75%)',
        // Animation removed
      }}
    />
  );
} 