import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-primary-50 text-primary-500 border border-primary-100',
        gold:        'bg-gold-50 text-gold-dark border border-gold-100',
        active:      'bg-green-50 text-green-700 border border-green-100',
        upcoming:    'bg-primary-50 text-primary-500 border border-primary-100',
        complete:    'bg-gold-50 text-gold-dark border border-gold-100',
        paused:      'bg-red-50 text-red-600 border border-red-100',
        destructive: 'bg-red-50 text-red-600 border border-red-100',
        outline:     'border border-border text-foreground',
        secondary:   'bg-muted text-muted-foreground border border-border',
        new:         'bg-green-500 text-white',
        hot:         'bg-gold text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
