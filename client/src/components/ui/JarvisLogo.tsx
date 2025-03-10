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
      boxShadow: [
        '0 0 2px 0 rgba(var(--primary), 0.3), 0 0 0px 0 rgba(var(--primary), 0)',
        '0 0 15px 2px rgba(var(--primary), 0.6), 0 0 25px 5px rgba(var(--primary), 0.2)',
        '0 0 2px 0 rgba(var(--primary), 0.3), 0 0 0px 0 rgba(var(--primary), 0)'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const floatVariants = {
    float: {
      y: [0, -5, 0],
      rotateX: [0, 5, 0],
      rotateY: [0, 5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const ringVariants = [
    {
      rotate: [0, 360],
      transition: { duration: 25, repeat: Infinity, ease: "linear" }
    },
    {
      rotate: [360, 0],
      transition: { duration: 20, repeat: Infinity, ease: "linear" }
    },
    {
      rotate: [0, 360],
      transition: { duration: 15, repeat: Infinity, ease: "linear" }
    }
  ];

  return (
    <motion.div 
      className="relative" 
      style={{ 
        width: size, 
        height: size,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      variants={animate ? floatVariants : {}}
      animate={animate ? "float" : undefined}
    >
      {/* Particle Effects */}
      {animate && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-primary/50"
              style={{
                width: size * 0.06,
                height: size * 0.06,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -(size * 0.3), 0],
                opacity: [0, 1, 0],
                scale: [0, 0.8, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
      
      {/* Background Glow */}
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          variants={pulseVariants}
          animate="pulse"
        />
      )}
      
      {/* Main Logo Container */}
      <motion.div
        className="absolute inset-1 rounded-full bg-background backdrop-blur-md flex items-center justify-center overflow-hidden"
        style={{ 
          transformStyle: 'preserve-3d',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(var(--primary), 0.3)'
        }}
        variants={animate ? glowVariants : {}}
        animate={animate ? "glow" : undefined}
      >
        {/* The Minimalist "A" Logo */}
        <div 
          className="relative" 
          style={{ 
            width: size * 0.5, 
            height: size * 0.5,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Modern Minimalist "A" */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
              filter: animate ? 'drop-shadow(0 0 3px rgba(var(--primary), 0.5))' : 'none',
              transform: 'translateZ(10px)'
            }}
          >
            {/* A shape using modern minimalist style */}
            <path 
              d="M50 10 L80 90 L65 90 L57.5 70 L42.5 70 L35 90 L20 90 L50 10 Z M50 30 L43 60 L57 60 L50 30 Z" 
              fill="currentColor"
              className="text-primary"
            />
            {animate && (
              <motion.path 
                d="M50 10 L80 90 L65 90 L57.5 70 L42.5 70 L35 90 L20 90 L50 10 Z" 
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="text-primary"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0], 
                  opacity: [0, 0.8, 0.8, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            )}
          </svg>
        </div>
      </motion.div>
      
      {/* Orbital Rings */}
      {animate && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={`ring-${i}`}
              className="absolute rounded-full"
              style={{ 
                width: size * (1 + i * 0.2), 
                height: size * (1 + i * 0.2),
                border: `${size * 0.005}px solid rgba(var(--primary), ${0.1 - i * 0.02})`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: i === 0 ? `0 0 ${size * 0.08}px rgba(var(--primary), 0.1)` : 'none'
              }}
              animate={ringVariants[i]}
            >
              {i === 0 && (
                <motion.div 
                  className="absolute bg-primary rounded-full"
                  style={{
                    width: size * 0.08,
                    height: size * 0.08,
                    top: '0%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 ${size * 0.04}px rgba(var(--primary), 0.6)`
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}