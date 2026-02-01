import React, { useMemo } from 'react';
import { motion } from "framer-motion";

const TotemGenerator = ({ type, color = "#2D241E" }) => {
  // 基础容器样式
  const containerStyle = "absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none mix-blend-multiply opacity-20 z-0";
  
  const content = useMemo(() => {
    switch (type) {
      case 'ROMAN':
        return (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center font-serif-display font-black italic text-[400px] leading-none"
            style={{ color: color }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1 }}
          >
            IV
          </motion.div>
        );
      case 'JUAN':
        return (
          <motion.div 
            className="absolute -right-20 -bottom-20 font-mono text-[500px] leading-none opacity-10"
            style={{ color: color }}
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            @
          </motion.div>
        );
      case 'HERMES':
        return (
          <div className="absolute inset-0 flex flex-col justify-center items-center space-y-12 opacity-20">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-[150%] h-[2px] bg-current transform -rotate-12"
                style={{ color: color }}
                animate={{ x: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        );
      case 'TROJAN':
        return (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <motion.div
              className="w-64 h-64 border-4 border-dashed border-current rounded-full"
              style={{ color: color }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-32 h-32 border-4 border-current rounded-none transform rotate-45"
              style={{ color: color }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        );
      case 'CAROUSEL':
        return (
          <motion.div
             className="absolute top-1/2 left-1/2 text-[400px] leading-none opacity-10 origin-center"
             style={{ color: color, x: "-50%", y: "-50%" }}
             animate={{ rotate: -360 }}
             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            ↻
          </motion.div>
        );
      case 'SWEAT':
        return (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
              backgroundSize: '20px 20px'
            }}
          />
        );
      case 'WILD':
        return (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center font-black text-[300px] overflow-hidden"
            style={{ color: color }}
            initial={{ skewX: -20 }}
            animate={{ skewX: [-20, -35, -20] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
          >
            WILD
          </motion.div>
        );
      case 'STOIC':
        return (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div 
              className="w-[400px] h-[400px] rounded-full relative overflow-hidden"
              style={{ border: `4px solid ${color}` }}
            >
              <div className="absolute top-0 left-0 w-1/2 h-full bg-current" style={{ color: color }}></div>
            </div>
          </div>
        );
      case 'PIXEL':
        return (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(${color} 2px, transparent 2px),
                linear-gradient(90deg, ${color} 2px, transparent 2px)
              `,
              backgroundSize: '40px 40px',
              backgroundPosition: 'center'
            }}
          />
        );
      default:
        // Default fallback to ROMAN
        return (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center font-serif-display font-black italic text-[400px] leading-none"
            style={{ color: color }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1 }}
          >
            IV
          </motion.div>
        );
    }
  }, [type, color]);

  return (
    <div className={containerStyle}>
      {content}
    </div>
  );
};

export default TotemGenerator;
