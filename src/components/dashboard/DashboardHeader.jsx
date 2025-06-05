import React from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

const DashboardHeader = ({ 
  onCreateProject, 
  createAdaptiveClickHandler, 
  getAdaptiveClasses 
}) => {
  const currentHour = new Date().getHours();
  
  // Determine greeting based on time of day
  let greeting = 'Welcome';
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {greeting}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Here's an overview of your video projects and activities
        </p>
      </div>
      
      <button
        onClick={createAdaptiveClickHandler('create_project', onCreateProject)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
      >
        <Plus className="w-5 h-5" />
        <span>New Project</span>
      </button>
    </motion.div>
  )
}

export default DashboardHeader