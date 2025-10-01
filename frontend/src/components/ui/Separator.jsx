import React from 'react'
import * as Separator from '@radix-ui/react-separator'

const SeparatorComponent = React.forwardRef(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <Separator.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={`shrink-0 bg-border ${orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'} ${className}`}
    {...props}
  />
))

SeparatorComponent.displayName = 'Separator'

export { SeparatorComponent as Separator }
