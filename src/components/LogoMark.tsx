type LogoMarkProps = {
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: 'h-10 w-10 p-1',
  md: 'h-12 w-12 p-1.5',
};

export function LogoMark({ size = 'sm', className = '' }: LogoMarkProps) {
  return (
    <span
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-white/30',
        sizeClasses[size],
        className,
      ].join(' ')}
      aria-hidden="true"
    >
      <img src="/brand/rotaleve-logo-512.png" alt="" className="h-full w-full object-contain" />
    </span>
  );
}
