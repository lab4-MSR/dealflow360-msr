import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  staggerContainerVariants,
  staggerItemVariants,
  fadeInVariants,
  cardHoverTransition,
} from '@/lib/motion'
import { cn } from '@/lib/utils'

interface MotionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Container that choreographs subtle, staggered entrances for its children (cards, tables, metrics).
 */
export function StaggerContainer({
  children,
  className,
  ...props
}: MotionContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}

/**
 * Child item inside a StaggerContainer with a crisp upward fade entry.
 */
export function StaggerItem({
  children,
  className,
  ...props
}: MotionContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}

/**
 * Clean fade-in entrance for components.
 */
export function FadeIn({
  children,
  className,
  ...props
}: MotionContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}

/**
 * Interactive SaaS card with micro-elevation and optional click response.
 */
export function AnimatedCard({
  children,
  className,
  interactive = true,
  ...props
}: MotionContainerProps & { interactive?: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion || !interactive) {
    return (
      <div className={cn('saas-card', className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99, y: 0 }}
      transition={cardHoverTransition}
      className={cn('saas-card', className)}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}
