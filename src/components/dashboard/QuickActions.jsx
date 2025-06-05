import React from 'react';
import { Plus, Upload, YoutubeIcon, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = ({ onCreateProject }) => {
  const actions = [
    {
      title: 'New Project',
      description: 'Create a new video project',
      icon: Plus,
      color: 'bg-blue-500',
      onClick: onCreateProject
    },
    {
      title: 'Upload Video',
      description: 'Upload a video file to analyze',
      icon: Upload,
      color: 'bg-green-500',
      onClick: onCreateProject
    },
    {
      title: 'YouTube Import',
      description: 'Import a video from YouTube',
      icon: YoutubeIcon,
      color: 'bg-red-500',
      onClick: onCreateProject
    },
    {
      title: 'Configure AI',
      description: 'Set up your AI providers',
      icon: Settings,
      color: 'bg-purple-500',
      to: '/settings'
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        <Link to="/settings" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 text-sm">
          <span>All Settings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <ActionCard key={action.title} action={action} />
        ))}
      </div>
    </div>
  );
};

const ActionCard = ({ action }) => {
  const CardComponent = action.to ? Link : 'button';
  
  return (
    <CardComponent
      to={action.to}
      onClick={action.onClick}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div className={`p-3 rounded-full ${action.color}`}>
        <action.icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
      </div>
    </CardComponent>
  );
};

export default QuickActions;