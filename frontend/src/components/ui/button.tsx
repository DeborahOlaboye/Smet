import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95'
    
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
    }

    const sizes = {
      default: 'h-10 py-2 px-4 text-sm sm:text-base btn-touch',
      sm: 'h-8 py-1 px-3 text-xs sm:text-sm',
      lg: 'h-12 py-3 px-6 text-base sm:text-lg btn-touch',
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
