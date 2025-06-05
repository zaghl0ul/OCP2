import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { useAdaptiveUI } from '../../contexts/AdaptiveUIContext'

const StatsCard = ({ title, value, change, changeType, icon: Icon, color = 'blue', index = 0 }) => {
  const { createAdaptiveClickHandler } = useAdaptiveUI()
  
  const colorClasses = {
    blue: {
      bg: 'from-blue-600/20 to-blue-800/20',
      border: 'border-blue-600/30',
      icon: 'text-blue-400',
      text: 'text-blue-300'
    },
    green: {
      bg: 'from-green-600/20 to-green-800/20',
      border: 'border-green-600/30',
      icon: 'text-green-400',
      text: 'text-green-300'
    },
    purple: {
      bg: 'from-purple-600/20 to-purple-800/20',
      border: 'border-purple-600/30',
      icon: 'text-purple-400',
      text: 'text-purple-300'
    },
    orange: {
      bg: 'from-orange-600/20 to-orange-800/20',
      border: 'border-orange-600/30',
      icon: 'text-orange-400',
      text: 'text-orange-300'
    }
  }
  
  const colors = colorClasses[color] || colorClasses.blue
  
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    }
  }
  
  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.2
      }
    }
  }
  
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={createAdaptiveClickHandler(`stats-${title.toLowerCase().replace(/\s+/g, '-')}`, 'analytics')}
      className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-6 cursor-pointer group`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              variants={iconVariants}
              className={`p-2 rounded-lg bg-gray-800/50 ${colors.icon}`}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            <h3 className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
              {title}
            </h3>
          </div>
          
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${
              changeType === 'increase' ? 'text-green-400' : 'text-red-400'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUpIcon className="w-3 h-3" />
              ) : (
                <TrendingDownIcon className="w-3 h-3" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors">
            {formatValue(value)}
          </div>
          
          {change !== undefined && (
            <div className="text-xs text-gray-400">
              {changeType === 'increase' ? 'Increase' : 'Decrease'} from last period
            </div>
          )}
        </div>
        
        {/* Progress Bar (if applicable) */}
        {typeof value === 'number' && value <= 100 && title.toLowerCase().includes('score') && (
          <div className="mt-4">
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: 'easeOut' }}
                className={`h-2 rounded-full bg-gradient-to-r ${colors.bg.replace('/20', '/60').replace('/20', '/80')}`}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Hover Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
      />
    </motion.div>
  )
}

export default StatsCard