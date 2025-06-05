import React from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProjectCard from '../project/ProjectCard'

const ProjectsSection = ({ 
  filteredProjects, 
  searchQuery, 
  setSearchQuery, 
  onCreateProject, 
  onProjectClick 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Projects</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="px-3 py-2 pl-10 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          <Link to="/projects" className="hidden sm:flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
            View All
          </Link>
        </div>
      </div>
      
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.slice(0, 6).map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => onProjectClick(project.id)} 
            />
          ))}
          <CreateProjectCard onClick={onCreateProject} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try a different search term or' : 'Get started by creating your first project'}
          </p>
          <button
            onClick={onCreateProject}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      )}
      
      <div className="mt-4 flex justify-center sm:hidden">
        <Link to="/projects" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
          View All Projects
        </Link>
      </div>
    </div>
  )
}

const CreateProjectCard = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex items-center justify-center h-64 cursor-pointer"
    onClick={onClick}
  >
    <div className="text-center p-6">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
        <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="font-medium text-gray-900 dark:text-white mb-1">Create New Project</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add a new video project</p>
    </div>
  </motion.div>
)

export default ProjectsSection