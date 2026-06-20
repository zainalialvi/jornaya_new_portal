import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useAnimationControls } from 'framer-motion';

// Fillo — the form-filling mascot. His eyes follow the cursor anywhere on the
// page; pass `shy` to make him cover his eyes (e.g. while typing a password).

const MAX_PUPIL = 9;
const EYE_L = { cx: 104, cy: 116 };
const EYE_R = { cx: 156, cy: 116 };

const RobotEye = ({ cx, cy, px, py, refEl, lids }) => (
  <g>
    <circle ref={refEl} cx={cx} cy={cy} r={0.1} fill="none" />
    <circle cx={cx} cy={cy} r={20} fill="#070b18" stroke="rgba(34,211,238,0.25)" strokeWidth="1.5" />
    <motion.g style={{ x: px, y: py }}>
      <circle cx={cx} cy={cy} r={14} fill="url(#iris)" />
      <circle cx={cx} cy={cy} r={6.5} fill="#03070f" />
      <circle cx={cx - 3} cy={cy - 3.5} r={2.6} fill="rgba(255,255,255,0.9)" />
    </motion.g>
    <motion.rect
      x={cx - 21} y={cy - 22} width={42} height={44} rx={16}
      fill="#0b0e1c"
      style={{ transformBox: 'fill-box', transformOrigin: 'top center', scaleY: 0 }}
      animate={lids}
    />
  </g>
);

const RobotHand = ({ x, y, rot, thumbSide = 'left', scale = 0.74 }) => {
  const fill = '#2b3157';
  const stroke = 'rgba(99,102,241,0.85)';
  const thumb = thumbSide === 'right'
    ? <rect x={14} y={-4} width={18} height={13} rx={6.5} fill={fill} stroke={stroke} strokeWidth={1.6} transform="rotate(22 23 2)" />
    : <rect x={-32} y={-4} width={18} height={13} rx={6.5} fill={fill} stroke={stroke} strokeWidth={1.6} transform="rotate(-22 -23 2)" />;
  return (
    <motion.g style={{ x, y, rotate: rot, transformBox: 'fill-box', transformOrigin: 'center' }}>
      <g transform={`scale(${scale})`}>
        <rect x={-17} y={-32} width={9} height={24} rx={4.5} fill={fill} stroke={stroke} strokeWidth={1.6} />
        <rect x={-6} y={-35} width={9} height={27} rx={4.5} fill={fill} stroke={stroke} strokeWidth={1.6} />
        <rect x={5} y={-35} width={9} height={27} rx={4.5} fill={fill} stroke={stroke} strokeWidth={1.6} />
        <rect x={15} y={-32} width={9} height={24} rx={4.5} fill={fill} stroke={stroke} strokeWidth={1.6} />
        <rect x={-22} y={-14} width={44} height={34} rx={15} fill={fill} stroke={stroke} strokeWidth={2} />
        {thumb}
      </g>
    </motion.g>
  );
};

const Fillo = ({ shy = false, sad = false, size = 320 }) => {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const spring = { stiffness: 140, damping: 15, mass: 0.6 };
  const lx = useSpring(0, spring);
  const ly = useSpring(0, spring);
  const rx = useSpring(0, spring);
  const ry = useSpring(0, spring);
  const tilt = useSpring(0, { stiffness: 90, damping: 16 });

  const lids = useAnimationControls();

  const cover = useSpring(0, { stiffness: 170, damping: 21, mass: 0.7 });
  useEffect(() => { cover.set(shy ? 1 : 0); }, [shy, cover]);

  const lhx = useTransform(cover, [0, 1], [70, 104]);
  const lhy = useTransform(cover, [0, 1], [252, 112]);
  const lhr = useTransform(cover, [0, 1], [16, -6]);
  const rhx = useTransform(cover, [0, 1], [190, 156]);
  const rhy = useTransform(cover, [0, 1], [252, 112]);
  const rhr = useTransform(cover, [0, 1], [-16, 6]);

  useEffect(() => {
    const aim = (ref, sx, sy, mx, my) => {
      const el = ref.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const factor = Math.min(dist / 170, 1);
      sx.set((dx / dist) * MAX_PUPIL * factor);
      sy.set((dy / dist) * MAX_PUPIL * factor);
      return dx;
    };
    const onMove = (e) => {
      if (shy || sad) return;
      const dxL = aim(leftRef, lx, ly, e.clientX, e.clientY);
      aim(rightRef, rx, ry, e.clientX, e.clientY);
      tilt.set(Math.max(-7, Math.min(7, dxL / 26)));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [shy, sad, lx, ly, rx, ry, tilt]);

  useEffect(() => {
    if (shy) { lx.set(-3); ly.set(MAX_PUPIL); rx.set(3); ry.set(MAX_PUPIL); tilt.set(0); }
    else if (sad) { lx.set(0); ly.set(5); rx.set(0); ry.set(5); tilt.set(0); }
  }, [shy, sad, lx, ly, rx, ry, tilt]);

  useEffect(() => {
    let timer;
    const blink = () => {
      lids.start({ scaleY: [0, 1, 0], transition: { duration: 0.16, times: [0, 0.5, 1] } });
      timer = setTimeout(blink, 2200 + Math.random() * 2600);
    };
    timer = setTimeout(blink, 1400);
    return () => clearTimeout(timer);
  }, [lids]);

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, maxWidth: '70%' }}
    >
      <motion.svg viewBox="0 0 260 320" width="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#222746" />
            <stop offset="100%" stopColor="#14172a" />
          </linearGradient>
          <radialGradient id="iris" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="55%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7490" />
          </radialGradient>
          <linearGradient id="chest" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{ transformBox: 'view-box', transformOrigin: '130px 150px' }}
        >
          <circle cx="130" cy="40" r="3" fill="#22d3ee" opacity="0.8" />
          <circle cx="230" cy="160" r="2.5" fill="#8b5cf6" opacity="0.7" />
          <circle cx="30" cy="170" r="2.5" fill="#6366f1" opacity="0.7" />
        </motion.g>

        <motion.g style={{ rotate: tilt, transformBox: 'view-box', transformOrigin: '130px 250px' }}>
          <motion.g
            animate={{ rotate: sad && !shy ? -26 : 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            style={{ transformBox: 'view-box', transformOrigin: '130px 48px' }}
          >
            <line x1="130" y1="48" x2="130" y2="22" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
            <motion.circle
              cx="130" cy="16" r="6" fill="#22d3ee" filter="url(#soft)"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle cx="130" cy="16" r="3.5" fill="#bdf3ff" />
          </motion.g>

          <rect x="30" y="98" width="14" height="44" rx="7" fill="#1a1e34" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" />
          <rect x="216" y="98" width="14" height="44" rx="7" fill="#1a1e34" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" />

          <rect x="42" y="48" width="176" height="150" rx="36" fill="url(#headGrad)" stroke="rgba(99,102,241,0.55)" strokeWidth="2" />
          <rect x="60" y="66" width="140" height="106" rx="26" fill="#0b0e1c" stroke="rgba(34,211,238,0.22)" strokeWidth="1.5" />

          <motion.circle cx="86" cy="146" r="9" fill="#f472b6" animate={{ opacity: shy ? 0.55 : 0 }} transition={{ duration: 0.3 }} filter="url(#soft)" />
          <motion.circle cx="174" cy="146" r="9" fill="#f472b6" animate={{ opacity: shy ? 0.55 : 0 }} transition={{ duration: 0.3 }} filter="url(#soft)" />

          {/* sad eyebrows — worried, inner ends raised */}
          <motion.line x1="86" y1="93" x2="120" y2="84" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round"
            animate={{ opacity: sad && !shy ? 0.9 : 0 }} transition={{ duration: 0.3 }} />
          <motion.line x1="174" y1="93" x2="140" y2="84" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round"
            animate={{ opacity: sad && !shy ? 0.9 : 0 }} transition={{ duration: 0.3 }} />

          <RobotEye cx={EYE_L.cx} cy={EYE_L.cy} px={lx} py={ly} refEl={leftRef} lids={lids} />
          <RobotEye cx={EYE_R.cx} cy={EYE_R.cy} px={rx} py={ry} refEl={rightRef} lids={lids} />

          {/* tear — only when sad */}
          {sad && !shy && (
            <motion.ellipse
              cx="86" cy="132" rx="4" ry="5.5" fill="#7dd3fc"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0.85, 0], y: [0, 10, 22, 32] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeIn' }}
            />
          )}

          <motion.path
            d={shy ? 'M118 152 Q130 148 142 152' : sad ? 'M114 159 Q130 144 146 159' : 'M112 150 Q130 164 148 150'}
            stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85"
            transition={{ duration: 0.3 }}
          />

          <rect x="120" y="194" width="20" height="14" rx="4" fill="#1a1e34" />
          <rect x="76" y="206" width="108" height="70" rx="24" fill="url(#headGrad)" stroke="rgba(99,102,241,0.5)" strokeWidth="2" />
          <motion.circle
            cx="130" cy="240" r="11" fill="url(#chest)"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx="130" cy="240" r="4" fill="#c7d2fe" />

          <RobotHand x={lhx} y={lhy} rot={lhr} thumbSide="right" />
          <RobotHand x={rhx} y={rhy} rot={rhr} thumbSide="left" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
};

export default Fillo;
