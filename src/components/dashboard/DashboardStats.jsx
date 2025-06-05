import React from 'react'
import { motion } from 'framer-motion'
import { 
  FolderOpen,
  Film,
  Clock,
  TrendingUp
} from 'lucide-react'

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderOpen,
      color: 'bg-blue-500',
      iconColor: 'text-blue-100'
    },
    {
      title: 'Total Clips',
      value: stats.totalClips,
      icon: Film,
      color: 'bg-green-500',
      iconColor: 'text-green-100'
    },
    {
      title: 'Processing Time',
      value: `${stats.totalProcessingTime || 0}min`,
      icon: Clock,
      color: 'bg-amber-500',
      iconColor: 'text-amber-100'
    },
    {
      title: 'Avg. Score',
      value: (stats.averageScore || 0).toFixed(1),
      icon: TrendingUp,
      color: 'bg-purple-500',
      iconColor: 'text-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default DashboardStats