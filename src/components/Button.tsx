import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Common {
  variant?: Variant;
  block?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const cls = (variant: Variant, block?: boolean, extra?: string) =>
  [styles.button, styles[variant], block && styles.block, extra].filter(Boolean).join(' ');

export function Button({ variant = 'primary', block, icon, children, className, type = 'button', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cls(variant, block, className)} {...rest}>
      <span>{children}</span>
      {icon}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', block, icon, children, className, ...rest }: Common & LinkProps) {
  return (
    <Link className={cls(variant, block, typeof className === 'string' ? className : undefined)} {...rest}>
      <span>{children}</span>
      {icon}
    </Link>
  );
}
