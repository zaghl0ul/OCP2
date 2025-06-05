import React, { useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { BarChart2, FolderOpen, Plus, Settings } from 'lucide-react';

const baseSize = 80;

// Glow and glass colors for different node types - more vibrant colors
const nodeStyles = {
  stat: {
    glow: '#4287f5',
    glass: 'from-blue-500/40 to-blue-700/40',
    border: 'border-blue-400/50'
  },
  project: {
    glow: '#10b981',
    glass: 'from-green-500/40 to-green-700/40',
    border: 'border-green-400/50'
  },
  action: {
    glow: '#06b6d4',
    glass: 'from-cyan-500/40 to-cyan-700/40',
    border: 'border-cyan-400/50'
  }
};

const icons = {
  stat: BarChart2,
  project: FolderOpen,
  action: Plus,
  settings: Settings,
};

const Node = ({ node, pos }) => {
  const [hovered, setHovered] = useState(false);
  const glowControls = useAnimation();

  // Adaptive sizing
  let size = baseSize;
  if (node.type === 'project' && node.project?.status === 'active') size = baseSize + 10;
  if (node.type === 'stat') size = baseSize - 5;
  if (node.type === 'action') size = baseSize - 10;

  // Node style based on type
  const style = nodeStyles[node.type] || nodeStyles.project;
  
  // Icon
  let Icon = icons[node.type] || FolderOpen;
  if (node.label?.toLowerCase().includes('settings')) Icon = Settings;

  // Breathing animation for the inner glow
  React.useEffect(() => {
    glowControls.start({
      opacity: [0.7, 0.9, 0.7],
      scale: [0.8, 0.85, 0.8],
      transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
    });
  }, [glowControls]);

  // Positioning
  const nodeStyle = {
    position: 'absolute',
    left: pos?.x - size / 2,
    top: pos?.y - size / 2,
    width: size,
    height: size,
    zIndex: 10,
    cursor: node.type === 'action' || node.type === 'project' ? 'pointer' : 'default',
    userSelect: 'none',
  };

  // Get display text for tooltip
  let title = node.label || '';
  let subtitle = '';
  
  if (node.type === 'stat') {
    subtitle = String(node.value);
  } else if (node.type === 'project' && node.project) {
    subtitle = node.project.description || node.project.status || '';
  } else if (node.type === 'action') {
    subtitle = 'Quick Action';
  }

  return (
    <>
      {/* Main Node */}
      <motion.div
        className="absolute flex items-center justify-center"
        style={nodeStyle}
        whileHover={{ scale: 1.15, zIndex: 50 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={
          node.type === 'action'
            ? node.onClick
            : node.type === 'project'
            ? () => (window.location.href = `/projects/${node.project.id}`)
            : undefined
        }
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Glass Circle - Outer Layer with Border */}
        <div className={`absolute w-full h-full rounded-full bg-gray-900/40 shadow-lg`} />
        
        {/* Inner Glow - More Prominent */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '90%',
            height: '90%',
            background: `radial-gradient(circle, ${style.glow} 0%, ${style.glow}40 40%, transparent 70%)`,
            filter: 'blur(6px)',
          }}
          animate={glowControls}
        />
        
        {/* Glass Circle - Inner Layer with Gradient */}
        <motion.div
          className={`absolute w-[97%] h-[97%] rounded-full bg-gradient-to-br ${style.glass} flex items-center justify-center shadow-inner border ${style.border}`}
          style={{
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)`,
          }}
          whileHover={{ boxShadow: `0 0 15px 5px ${style.glow}70` }}
        >
          {/* Icon */}
          <Icon className="w-7 h-7 text-white drop-shadow-lg z-10" />
        </motion.div>
      </motion.div>

      {/* Tooltip on Hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className="absolute rounded-lg bg-gray-900/90 shadow-xl border border-white/20 px-4 py-2 z-50 pointer-events-none"
            style={{
              left: pos?.x,
              top: pos?.y + size/2 + 15,
              transform: 'translateX(-50%)',
              maxWidth: 220,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'rgba(15, 23, 42, 0.9)',
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center">
              <div className="font-bold text-white">{title}</div>
              {subtitle && <div className="text-sm text-gray-300 mt-1">{subtitle}</div>}
              
              {/* Show action buttons for projects */}
              {node.type === 'project' && (
                <div className="flex gap-2 mt-2 justify-center">
                  <button
                    className="px-3 py-1 bg-blue-600/90 hover:bg-blue-600 text-white rounded text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/projects/${node.project.id}`;
                    }}
                  >
                    Open
                  </button>
                </div>
              )}
            </div>
            
            {/* Tooltip Arrow */}
            <div
              className="absolute w-3 h-3 bg-gray-900/90 border-t border-l border-white/20 transform rotate-45"
              style={{
                top: '-6px',
                left: '50%',
                marginLeft: '-6px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Node; 