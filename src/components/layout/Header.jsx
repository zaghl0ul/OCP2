import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  SearchIcon,
  SettingsIcon,
  BellIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  HomeIcon,
  FolderIcon,
  PlusIcon
} from 'lucide-react'
import useProjectStore from '../../stores/projectStore'
import { useAdaptiveUI } from '../../contexts/AdaptiveUIContext'

const Header = ({ onMenuClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, searchProjects } = useProjectStore()
  const { createAdaptiveClickHandler } = useAdaptiveUI()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchProjects(query)
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }
  
  const handleSearchResultClick = (projectId) => {
    navigate(`/project/${projectId}`)
    setShowSearchResults(false)
    setSearchQuery('')
  }
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: HomeIcon },
    { path: '/projects', label: 'Projects', icon: FolderIcon },
    { path: '/settings', label: 'Settings', icon: SettingsIcon }
  ]
  
  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Menu button for sidebar */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            >
                <MenuIcon className="w-5 h-5" />
            </button>
            
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-white hover:text-primary-400 transition-colors"
              onClick={createAdaptiveClickHandler('logo', 'navigation')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OC</span>
              </div>
              <span className="hidden sm:block">OpenClip Pro</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={createAdaptiveClickHandler(`nav-${item.label.toLowerCase()}`, 'navigation')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-4 relative">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto"
              >
                {searchResults.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleSearchResultClick(project.id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    <div className="font-medium text-gray-300">{project.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {project.clips?.length || 0} clips • {new Date(project.createdAt || project.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Quick Create Button */}
            <button
              onClick={() => navigate('/projects?create=true')}
              className="btn btn-primary btn-sm hidden sm:flex"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Project
            </button>
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <XIcon className="w-5 h-5" />
              ) : (
                <SettingsIcon className="w-5 h-5" />
              )}
            </button>
            
            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2">
            {/* Notifications */}
            <button
              className="p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors relative"
              onClick={createAdaptiveClickHandler('notifications', 'utility')}
            >
              <BellIcon className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full"></span>
            </button>
            
            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              onClick={createAdaptiveClickHandler('settings', 'navigation')}
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>
            
            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors"
                onClick={createAdaptiveClickHandler('user-menu', 'utility')}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-300">
                  Creator
                </span>
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-gray-800 bg-gray-900"
        >
          <nav className="px-4 py-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    createAdaptiveClickHandler(`mobile-nav-${item.label.toLowerCase()}`, 'navigation')()
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
            
            {/* Mobile Quick Create */}
            <button
              onClick={() => {
                navigate('/projects?create=true')
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              New Project
            </button>
          </nav>
        </motion.div>
      )}
    </header>
  )
}

export default Header