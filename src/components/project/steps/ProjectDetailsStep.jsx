import React from 'react'
import { motion } from 'framer-motion'

const ProjectDetailsStep = ({ projectName, setProjectName, description, setDescription }) => {
  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Project Details
        </h3>
        <p className="text-gray-400">
          Give your project a name and description
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="input"
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project or analysis goals"
            rows={3}
            className="input resize-none"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectDetailsStep