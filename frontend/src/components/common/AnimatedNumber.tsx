import * as React from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  formatFn?: (val: number) => string
  className?: string
}

export function AnimatedNumber({ value, formatFn, className }: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion()
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 })
  const [displayValue, setDisplayValue] = React.useState<string>(() =>
    formatFn ? formatFn(value) : value.toLocaleString()
  )

  React.useEffect(() => {
    spring.set(value)
  }, [spring, value])

  React.useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      const formatted = formatFn
        ? formatFn(Math.round(latest))
        : Math.round(latest).toLocaleString()
      setDisplayValue(formatted)
    })
    return () => unsubscribe()
  }, [spring, formatFn])

  if (shouldReduceMotion) {
    return <span className={className}>{formatFn ? formatFn(value) : value.toLocaleString()}</span>
  }

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  )
}
