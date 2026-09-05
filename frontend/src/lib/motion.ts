import { type Transition } from 'framer-motion'

/**
 * DealFlow360 Enterprise Motion Tokens & Variants
 * Built for professional enterprise SaaS: subtle, intentional, accessible, performant.
 */

export const MOTION_DURATIONS = {
  fast: 0.15,     // 150ms - buttons, hover, micro-interactions
  normal: 0.22,   // 220ms - dropdowns, popovers, tabs, route transitions
  emphasis: 0.32, // 320ms - modals, drawers, notifications
  large: 0.45,    // 450ms - complex layout reflows
} as const

export const MOTION_EASINGS = {
  easeOut: [0.16, 1, 0.3, 1],      // Natural deceleration for entering elements
  easeInOut: [0.4, 0, 0.2, 1],    // Standard symmetric transition
  easeIn: [0.7, 0, 0.84, 0],      // Quick acceleration for exiting elements
  springSoft: { type: 'spring', damping: 28, stiffness: 340 } as Transition,
} as const

/** Subtle Page Transition variant: opacity 0 -> 1, y 6 -> 0 */
export const pageMotionVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeIn,
    },
  },
}

/** Card hover transition properties */
export const cardHoverTransition = {
  duration: MOTION_DURATIONS.fast,
  ease: MOTION_EASINGS.easeOut,
}

/** Dropdown menu variants */
export const dropdownMotionVariants = {
  initial: { opacity: 0, scale: 0.97, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: {
      duration: 0.1,
      ease: MOTION_EASINGS.easeIn,
    },
  },
}

/** Modal dialog variants */
export const modalMotionVariants = {
  initial: { opacity: 0, scale: 0.98, y: 6 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeIn,
    },
  },
}

/** Drawer / Sheet variants */
export const drawerMotionVariants = {
  right: {
    initial: { x: '100%' },
    animate: {
      x: 0,
      transition: {
        duration: MOTION_DURATIONS.emphasis,
        ease: MOTION_EASINGS.easeOut,
      },
    },
    exit: {
      x: '100%',
      transition: {
        duration: MOTION_DURATIONS.normal,
        ease: MOTION_EASINGS.easeIn,
      },
    },
  },
  left: {
    initial: { x: '-100%' },
    animate: {
      x: 0,
      transition: {
        duration: MOTION_DURATIONS.emphasis,
        ease: MOTION_EASINGS.easeOut,
      },
    },
    exit: {
      x: '-100%',
      transition: {
        duration: MOTION_DURATIONS.normal,
        ease: MOTION_EASINGS.easeIn,
      },
    },
  },
}
