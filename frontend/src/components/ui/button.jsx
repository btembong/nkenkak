import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary-500 text-white shadow-purple hover:bg-primary-600 hover:-translate-y-0.5',
        gold:        'bg-gradient-to-r from-gold to-gold-light text-white shadow-gold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(240,165,0,0.5)]',
        outline:     'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500 hover:text-white hover:-translate-y-0.5',
        ghost:       'text-primary-500 hover:bg-primary-50 hover:text-primary-600',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        link:        'text-primary-500 underline-offset-4 hover:underline',
        white:       'bg-white text-primary-900 hover:bg-white/90 shadow-sm',
        'outline-white': 'border-2 border-white/70 text-white bg-transparent hover:bg-white/15 hover:border-white',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm:      'h-8 rounded-lg px-4 text-xs',
        lg:      'h-12 rounded-xl px-8 text-base',
        xl:      'h-14 rounded-2xl px-10 text-base',
        icon:    'h-10 w-10',
      },
      rounded: {
        default: '',
        full:    '!rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
      rounded: 'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, rounded, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
