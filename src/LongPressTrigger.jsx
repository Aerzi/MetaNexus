import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { triggerHaptic } from './HapticUtils';

const LongPressTrigger = ({ onComplete }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("HOLD TO EXTRACT");
  const controls = useAnimation();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPressing) {
      triggerHaptic('tap');
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);
            onComplete();
            return 100;
          }
          // Increase shake intensity
          controls.start({
            x: Math.random() * (prev / 5) - (prev / 10),
            y: Math.random() * (prev / 5) - (prev / 10),
            transition: { duration: 0.05 }
          });
          
          // Scramble text
          if (prev > 30 && prev < 60) setText("同步精神创伤...");
          if (prev > 60 && prev < 90) setText("上传人格数据...");
          if (prev > 90) setText("提取完成");

          return prev + 2; // Adjust speed here (approx 3000ms total)
        });
      }, 50);
    } else {
      clearInterval(intervalRef.current);
      setProgress(0);
      setText("长按注入灵魂");
      controls.start({ x: 0, y: 0 });
    }

    return () => clearInterval(intervalRef.current);
  }, [isPressing, onComplete, controls]);

  return (
    <div className="relative w-full flex justify-center items-center mt-8 touch-none select-none">
      <motion.div
        animate={controls}
        className="relative"
        onMouseDown={() => setIsPressing(true)}
        onMouseUp={() => setIsPressing(false)}
        onMouseLeave={() => setIsPressing(false)}
        onTouchStart={() => setIsPressing(true)}
        onTouchEnd={() => setIsPressing(false)}
      >
        {/* Progress Circle SVG */}
        <svg width="120" height="120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="#2D241E"
            strokeWidth="4"
            fill="transparent"
            opacity="0.2"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="#FF4400"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="339.292"
            strokeDashoffset={339.292 - (339.292 * progress) / 100}
            strokeLinecap="butt"
          />
        </svg>
        
        {/* Inner Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`w-24 h-24 rounded-full bg-[#2D241E] flex items-center justify-center transition-transform duration-100 ${isPressing ? 'scale-90' : 'scale-100'}`}
          >
            <span className="text-[#F0EFE9] font-black text-[10px] text-center leading-tight px-2 pointer-events-none">
              {text}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LongPressTrigger;

