import { motion } from 'framer-motion';

interface JarvisLogoProps {
  size?: number;
  animate?: boolean;
}

export function JarvisLogo({ size = 40, animate = true }: JarvisLogoProps) {
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const glowVariants = {
    glow: {
      boxShadow: ['0 0 2px 0 rgba(var(--primary), 0.3)', '0 0 15px 2px rgba(var(--primary), 0.6)', '0 0 2px 0 rgba(var(--primary), 0.3)'],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const rotateVariants = {
    rotate: {
      rotateY: [0, 360],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "linear",
      }
    }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background Elements */}
      {animate && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            variants={pulseVariants}
            animate="pulse"
          />
          <motion.div 
            className="absolute inset-2 rounded-full bg-primary/30"
            variants={glowVariants}
            animate="glow"
          />
        </>
      )}
      
      {/* Main Logo */}
      <motion.div
        className="w-full h-full rounded-full bg-primary flex items-center justify-center overflow-hidden"
        variants={animate ? rotateVariants : {}}
        animate={animate ? "rotate" : undefined}
      >
        <div className="text-white font-bold text-lg relative" style={{ fontSize: size * 0.4 }}>
          <span className="absolute" style={{ 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotateY(180deg)', 
            filter: 'blur(1px)',
            opacity: 0.6
          }}>A</span>
          <span className="relative">A</span>
        </div>
      </motion.div>
      
      {/* Orbit Elements */}
      {animate && (
        <motion.div 
          className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-primary/30"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ borderRadius: '50%' }}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
        </motion.div>
      )}
    </div>
  );
}