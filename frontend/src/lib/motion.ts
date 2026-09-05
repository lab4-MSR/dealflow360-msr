import { type Transition } from 'framer-motion'

/**
 * DealFlow360 Enterprise SaaS Motion Tokens & Variants
 * Built for high-performance enterprise SaaS: snappy, subtle, accessible, and fluid.
 */

export const MOTION_DURATIONS = {
  instant: 0.1,   // 100ms - micro-interactions, toggles
  fast: 0.16,     // 160ms - buttons, hover, tooltips
  normal: 0.2,    // 200ms - page transitions, tabs, popovers
  emphasis: 0.28, // 280ms - modals, drawers, sheets
  stagger: 0.035, // 35ms  - stagger between items
} as const

export const MOTION_EASINGS = {
  easeOut: [0.16, 1, 0.3, 1] as const,     // Natural deceleration (Linear/Vercel standard)
  easeInOut: [0.4, 0, 0.2, 1] as const,   // Standard symmetric transition
  easeIn: [0.7, 0, 0.84, 0] as const,     // Quick acceleration for exiting elements
  springSnappy: { type: 'spring', damping: 24, stiffness: 400 } as Transition,
  springSoft: { type: 'spring', damping: 28, stiffness: 320 } as Transition,
} as const

/** Subtle Page Transition variant: snappy opacity 0 -> 1, y 4 -> 0 */
export const pageMotionVariants = {
  initial: { opacity: 0, y: 4 },
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
    y: -3,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeIn,
    },
  },
}

/** Stagger container for grids, cards, KPI counters, tables */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: MOTION_DURATIONS.stagger,
      delayChildren: 0.02,
    },
  },
}

/** Stagger child item variant */
export const staggerItemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.easeOut,
    },
  },
}

/** Fade in variant */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeOut,
    },
  },
}

/** Card hover transition properties */
export const cardHoverTransition = {
  duration: MOTION_DURATIONS.fast,
  ease: MOTION_EASINGS.easeOut,
}

/** Tab content switch transition */
export const tabContentMotionVariants = {
  initial: { opacity: 0, y: 4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -2,
    transition: {
      duration: MOTION_DURATIONS.instant,
      ease: MOTION_EASINGS.easeIn,
    },
  },
}

/** Dropdown menu variants */
export const dropdownMotionVariants = {
  initial: { opacity: 0, scale: 0.98, y: -4 },
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
    scale: 0.98,
    y: -4,
    transition: {
      duration: MOTION_DURATIONS.instant,
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
      duration: MOTION_DURATIONS.emphasis,
      ease: MOTION_EASINGS.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 4,
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

