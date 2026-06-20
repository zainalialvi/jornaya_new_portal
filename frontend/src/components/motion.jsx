import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';

// ---- Reusable animation primitives ---------------------------------------
// A small, consistent vocabulary of entrance/stagger animations used across
// the dashboard so motion feels coherent rather than ad-hoc.

export const easeOutExpo = [0.16, 1, 0.3, 1];

// Whole-page enter/exit transition. Driven by AnimatePresence in the layout.
export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
    transition={{ duration: 0.45, ease: easeOutExpo }}
  >
    {children}
  </motion.div>
);

// Fade + rise on mount. `delay` lets callers cascade siblings.
export const FadeInUp = ({ children, delay = 0, y = 18, style, ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: easeOutExpo, delay }}
    style={style}
    {...rest}
  >
    {children}
  </motion.div>
);

// Container that staggers its direct <Stagger.Item> children into view.
const StaggerContainer = ({ children, delay = 0, gap = 0.07, style, ...rest }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: gap, delayChildren: delay } },
    }}
    style={style}
    {...rest}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, style, ...rest }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 18 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
    }}
    style={style}
    {...rest}
  >
    {children}
  </motion.div>
);

export const Stagger = Object.assign(StaggerContainer, { Item: StaggerItem });

// Card that lifts and glows on hover; also rises into view.
export const HoverCard = ({ children, style, delay = 0, ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: easeOutExpo, delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    style={style}
    {...rest}
  >
    {children}
  </motion.div>
);

// Count-up number that animates whenever its target value changes and is in view.
export const CountUp = ({ value = 0, duration = 1.1, style, format = (v) => v }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-20px' });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(mv, value, {
      duration,
      ease: easeOutExpo,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, inView, duration, mv]);

  return (
    <span ref={ref} style={style}>
      {format(display)}
    </span>
  );
};

export { motion };
