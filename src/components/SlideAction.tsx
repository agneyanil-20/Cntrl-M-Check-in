import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Power, ArrowRight, Check, ChevronRight } from 'lucide-react';

interface SlideActionProps {
  isCheckedIn: boolean;
  onAction: () => void;
  disabled?: boolean;
}

export function SlideAction({ isCheckedIn, onAction, disabled }: SlideActionProps) {
  const [complete, setComplete] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(250);
  
  // Motion values for the slider handle
  const x = useMotionValue(0);

  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current) {
        // Calculate the maximum drag distance (Track width - handle width - padding)
        setMaxDrag(trackRef.current.offsetWidth - 72); 
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  // Determine text and color based on state
  const actionText = isCheckedIn ? 'Slide to Check Out' : 'Slide to Check In';
  const baseColor = isCheckedIn ? 'bg-rose-500' : 'bg-[#EAFF00]';
  const textColor = isCheckedIn ? 'text-white' : 'text-black';
  const trackColor = isCheckedIn ? 'bg-rose-50/80' : 'bg-gray-100/80';

  // Opacity for the helper text and icons as we slide
  const textOpacity = useTransform(x, [0, maxDrag * 0.5], [1, 0]);
  const chevronOpacity = useTransform(x, [0, maxDrag * 0.3], [1, 0]);
  
  const handleDragEnd = () => {
    // If we've dragged past 85% of the track
    if (x.get() > maxDrag * 0.85) {
      setComplete(true);
      
      // Visual feedback: snap to end
      x.set(maxDrag);
      
      // Execute the action
      onAction();
      
      // Dynamic reset after animation completes
      setTimeout(() => {
        x.set(0);
        setComplete(false);
      }, 800);
    } else {
      // Snap back to start if not completed
      x.set(0);
    }
  };

  return (
    <div 
      ref={trackRef}
      className={`relative w-full h-[68px] rounded-full p-2 transition-all duration-500 overflow-hidden ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100 shadow-sm'}`}
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      {/* Background Track with Glassmorphism */}
      <div 
        className={`absolute inset-0 rounded-full border border-black/5 backdrop-blur-sm shadow-inner transition-colors duration-500 ${trackColor}`} 
      />

      {/* Helper Text / Cue */}
      <motion.div 
        style={{ opacity: textOpacity }}
        className={`absolute inset-0 flex items-center justify-center font-retro font-black uppercase text-[11px] tracking-[0.2em] pointer-events-none ${isCheckedIn ? 'text-rose-900/30' : 'text-gray-400'}`}
      >
        <span className="ml-10">{actionText}</span>
      </motion.div>

      {/* Animated Chevrons hint */}
      <motion.div
        style={{ opacity: chevronOpacity }}
        className="absolute left-20 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
          >
            <ChevronRight className={`w-3 h-3 ${isCheckedIn ? 'text-rose-300' : 'text-gray-300'}`} />
          </motion.div>
        ))}
      </motion.div>

      {/* The Draggable Handle (Rounded Bold Style) */}
      <motion.div
        drag={disabled || complete ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileTap={{ scale: 0.96 }}
        className={`relative z-10 w-[54px] h-[52px] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-2 border-white/20 ${baseColor} ${textColor}`}
      >
        <AnimatePresence mode="wait">
          {complete ? (
            <motion.div
              key="done"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-6 h-6 stroke-[4px]" />
            </motion.div>
          ) : (
            <motion.div
              key="action"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              {isCheckedIn ? (
                <Power className="w-5 h-5 stroke-[3px]" />
              ) : (
                <ArrowRight className="w-6 h-6 stroke-[3.5px]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Decorative Track Completion Fill */}
      <motion.div
        style={{ width: x }}
        className={`absolute inset-y-2 left-2 rounded-full opacity-20 pointer-events-none ${isCheckedIn ? 'bg-rose-500' : 'bg-[#EAFF00]'}`}
      />
    </div>
  );
}
