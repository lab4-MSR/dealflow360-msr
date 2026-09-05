import { Layers3 } from 'lucide-react'

/** The DealFlow360 brand mark, shared anywhere the product identity is shown. */
export function BrandMark() {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevation-1">
      <Layers3 className="h-5 w-5" aria-hidden="true" />
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />
      <span className="sr-only">DealFlow360</span>
    </span>
  )
}
