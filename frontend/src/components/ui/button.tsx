import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background'
    
    const variants = {
      default: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-90',
      outline: 'border border-gray-300 dark:border-gray-700 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.02)]',
      ghost: 'bg-transparent hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.02)]',
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          'h-10 py-2 px-4',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
