# Frontend-Backend Integration Guide

This guide explains how to set up and use the integrated React frontend with the Python FastAPI backend for the AI Video Analysis Platform.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to project root (if not already there)
cd ..

# Install Node.js dependencies
npm install

# Start the React development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration

The backend automatically configures:
- **CORS** for frontend communication
- **File upload** handling
- **API endpoints** for all frontend features
- **AI provider** integration

### Frontend Configuration

The frontend includes:
- **Automatic backend detection**
- **Requires backend connection** for full functionality
- **Real-time connection status** indicator
- **Settings page** for API key configuration

## 📡 API Integration

### Connection Status

The app automatically:
1. **Checks backend availability** on startup
2. **Shows connection status** in the bottom-right corner
3. **Requires backend connection** for data operations
4. **Retries connection** periodically

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/projects` | GET | Get all projects |
| `/api/projects` | POST | Create new project |
| `/api/projects/{id}` | GET | Get project details |
| `/api/projects/{id}` | DELETE | Delete project |
| `/api/projects/{id}/upload` | POST | Upload video file |
| `/api/projects/{id}/youtube` | POST | Process YouTube URL |
| `/api/projects/{id}/analyze` | POST | Start AI analysis |
| `/api/providers` | GET | Get AI providers |
| `/api/providers/{provider}/models` | GET | Get provider models |
| `/api/settings` | GET | Get user settings |
| `/api/settings` | PUT | Update settings |

## 🎯 Features

### With Backend Connected

✅ **Full functionality**:
- Real project creation and management
- Actual video file uploads
- YouTube URL processing
- AI-powered video analysis
- Persistent data storage
- API key management
- Model selection and configuration

### Without Backend (Offline Mode)

🔄 **Limited functionality without backend**:
- UI components and navigation only
- No data persistence or analysis features
- Backend connection required for all operations

## ⚙️ Settings Configuration

### API Keys

Configure your AI provider API keys in the Settings page:

1. **Navigate to Settings** (gear icon in sidebar)
2. **Select "API Keys" tab**
3. **Enter your API keys**:
   - OpenAI API Key
   - Anthropic API Key
   - Google API Key
   - Cohere API Key
4. **Test connections** using the "Test" button
5. **Save settings**

### Backend URL

If running the backend on a different port or server:

1. **Go to Settings → Backend tab**
2. **Update the Backend URL**
3. **Click "Save"**
4. **Check connection status**

## 🔍 Troubleshooting

### Backend Not Starting

**Problem**: Backend fails to start

**Solutions**:
```bash
# Check Python version
python --version

# Install missing dependencies
pip install fastapi uvicorn python-multipart

# Run with verbose output
python main.py --reload
```

### Frontend Can't Connect

**Problem**: Frontend shows "Backend Disconnected"

**Solutions**:
1. **Verify backend is running** at `http://localhost:8000`
2. **Check CORS configuration** in backend
3. **Update backend URL** in Settings if needed
4. **Check browser console** for error messages

### CORS Issues

**Problem**: Cross-origin request blocked

**Solution**: Backend includes CORS middleware, but if issues persist:
```python
# In backend/main.py, ensure CORS is configured:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### File Upload Issues

**Problem**: Video uploads fail

**Solutions**:
1. **Check file size limits** (backend may have restrictions)
2. **Verify file format** (MP4, AVI, MOV supported)
3. **Ensure upload directory exists** and is writable
4. **Check backend logs** for detailed error messages

## 🚦 Development Workflow

### Running Both Servers

**Terminal 1** (Backend):
```bash
cd backend
python main.py
```

**Terminal 2** (Frontend):
```bash
npm run dev
```

### Development Features

- **Hot reload** for both frontend and backend
- **Automatic reconnection** when backend restarts
- **Backend-dependent architecture** for production-ready functionality
- **Real-time status updates**

## 📊 Monitoring

### Backend Status

- **Health endpoint**: `http://localhost:8000/health`
- **API documentation**: `http://localhost:8000/docs`
- **Backend logs** in terminal

### Frontend Status

- **Connection indicator** in bottom-right corner
- **Settings page** shows detailed connection info
- **Browser console** for debugging
- **Network tab** for API call monitoring

## 🔐 Security

### API Keys

- **Never commit API keys** to version control
- **Use environment variables** for production
- **Enable encryption** in Settings → Security
- **Auto-clear sensitive data** option available

### CORS

- **Configured for localhost** development
- **Update origins** for production deployment
- **Secure headers** included

## 🚀 Production Deployment

### Backend

```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

### Environment Variables

**Backend** (`.env`):
```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
COHERE_API_KEY=your_cohere_key
```

**Frontend** (`.env`):
```env
VITE_BACKEND_URL=https://your-backend-domain.com
```

## 📝 API Usage Examples

### Create Project

```javascript
// Frontend code
const project = await apiService.createProject({
  name: "My Video Project",
  description: "Analysis of marketing video"
});
```

### Upload Video

```javascript
// Frontend code
const formData = new FormData();
formData.append('file', videoFile);

const result = await apiService.uploadVideo(projectId, formData);
```

### Start Analysis

```javascript
// Frontend code
const analysis = await apiService.startAnalysis(projectId, {
  prompt: "Analyze the emotional tone of this video",
  provider: "openai",
  model: "gpt-4"
});
```

## 🎉 Success!

You now have a fully integrated AI Video Analysis Platform with:

- ✅ **React frontend** with modern UI
- ✅ **FastAPI backend** with AI integration
- ✅ **Real-time communication** between frontend and backend
- ✅ **Fallback mechanisms** for offline development
- ✅ **Comprehensive settings** management
- ✅ **Production-ready** architecture

Enjoy building amazing video analysis applications! 🎬🤖

# OpenClip Pro - Integration Guide

## Overview
This guide covers the integration and testing of all newly implemented features and TODO items in the OpenClip Pro application.

## ✅ Completed TODO Implementations

### 1. **Clip Management** (`src/pages/Clips.jsx`, `src/components/Clips/ClipsList.jsx`)
- ✅ Clip deletion with confirmation and backend integration
- ✅ Clip download functionality with progress tracking
- ✅ Complete error handling and user feedback
- ✅ Bulk operations and filtering

**Testing:**
```bash
# Test clip operations
1. Navigate to /clips
2. Try downloading clips (should show progress)
3. Try deleting clips (should show confirmation)
4. Test search and filtering functionality
```

### 2. **Clip Editor** (`src/components/Clips/ClipEditor.jsx`)
- ✅ Save functionality with backend integration
- ✅ Download edited clips
- ✅ Real-time validation and change tracking
- ✅ Auto-save prompt before download

**Testing:**
```bash
# Test clip editing
1. Open any clip in edit mode
2. Modify title, description, or timing
3. Try saving changes (should update backend)
4. Try downloading (should save first if needed)
```

### 3. **Project Card Actions** (`src/components/project/ProjectCard.jsx`)
- ✅ Complete action handlers (edit, download, delete, share, archive)
- ✅ Dropdown menu with proper animations
- ✅ Context-aware actions based on project status
- ✅ Bulk export functionality

**Testing:**
```bash
# Test project actions
1. Hover over any project card
2. Click the three-dots menu
3. Test each action (edit, download, share, archive, delete)
4. Verify proper navigation and feedback
```

### 4. **Quick Tools Sidebar** (`src/components/layout/Sidebar.jsx`)
- ✅ Quick analyze functionality
- ✅ Trim clips shortcut
- ✅ Export functionality
- ✅ Intelligent routing based on project state

**Testing:**
```bash
# Test quick tools
1. Use "Quick Analyze" - should navigate to unanalyzed projects
2. Use "Trim Clips" - should navigate to clips page with trim mode
3. Use "Export" - should start export for completed projects
```

### 5. **Security Settings** (`src/components/settings/SecuritySettings.jsx`)
- ✅ Clear all data functionality
- ✅ Comprehensive confirmation modal
- ✅ Complete data cleanup (localStorage, cache, stores)
- ✅ App state reset

**Testing:**
```bash
# Test data clearing (use with caution!)
1. Navigate to Settings > Security
2. Click "Clear Data"
3. Verify comprehensive warning modal
4. Test cancellation and confirmation
```

### 6. **Recent Activity Navigation** (`src/components/dashboard/RecentActivity.jsx`)
- ✅ Context-aware navigation based on activity type
- ✅ Smart routing with URL parameters
- ✅ Quick actions for each activity type
- ✅ Proper error handling for failed activities

**Testing:**
```bash
# Test activity navigation
1. Go to Dashboard
2. Click on different activity items
3. Verify proper navigation (projects, clips, analysis views)
4. Test quick action buttons
```

## 🔧 Integration Points

### Backend API Integration
All components now properly integrate with the centralized API client:

```javascript
// Standardized API calls
await apiClient.deleteClip(projectId, clipId)
await apiClient.downloadFile(downloadUrl, filename)
await apiClient.updateClip(projectId, clipId, clipData)
await apiClient.exportClips(projectId, exportSettings)
```

### Error Handling
Consistent error handling across all components:

```javascript
// Using withErrorHandling wrapper
const handleAction = withErrorHandling(async () => {
  // Action logic
}, { operation: 'action_name' })
```

### State Management
Proper integration with Zustand stores:

```javascript
// Project store updates
const { deleteProject, updateProject } = useProjectStore()
await deleteProject(projectId)
```

### User Feedback
Consistent toast notifications:

```javascript
import toast from 'react-hot-toast'

toast.success('Operation completed successfully')
toast.error('Operation failed')
toast.info('Additional information')
```

## 🚀 Testing Workflow

### 1. **Component Testing**
```bash
# Test individual components
npm run test -- Clips
npm run test -- ClipEditor
npm run test -- ProjectCard
```

### 2. **Integration Testing**
```bash
# Start the application
npm run dev

# Test complete workflows:
1. Create project → Upload video → Analyze → Edit clips → Export
2. Navigate through dashboard → Recent activity → Project details
3. Use quick tools → Verify proper routing
4. Test error scenarios and recovery
```

### 3. **Error Scenario Testing**
- Network disconnection during operations
- Invalid file uploads
- API key failures
- Concurrent operations
- Browser storage limitations

## 📱 Mobile Responsiveness

All implemented features include mobile-specific considerations:

- Touch-friendly action buttons
- Responsive modal layouts
- Mobile-optimized navigation
- Swipe gestures (where applicable)

## 🔒 Security Considerations

### Data Protection
- Secure API key storage with encryption option
- Safe data clearing with multiple confirmations
- Input validation on all user inputs
- XSS protection in dynamic content

### Privacy Features
- Optional analytics collection
- Local data retention controls
- Secure session management
- Clear data removal options

## 🎯 Performance Optimizations

### Code Splitting
- Lazy loading of heavy components
- Dynamic imports for non-critical features
- Optimized bundle sizes

### Caching Strategy
- Intelligent API response caching
- Browser storage optimization
- Memory usage management

### User Experience
- Optimistic UI updates
- Progressive loading states
- Graceful error recovery
- Adaptive interface based on usage patterns

## 📊 Analytics & Monitoring

### User Interaction Tracking
```javascript
// Implemented throughout the app
createAdaptiveClickHandler('action-name', 'category')()
```

### Error Reporting
- Centralized error categorization
- User-friendly error messages
- Developer debugging information
- Performance impact monitoring

## 🔄 Future Enhancements

### Planned Improvements
1. **Real-time Collaboration** - Multi-user project editing
2. **Advanced Analytics** - Detailed usage insights
3. **Plugin System** - Extensible functionality
4. **Offline Support** - PWA capabilities
5. **Advanced AI Models** - More analysis options

### Migration Path
- Backward compatibility maintained
- Incremental feature rollout
- User preference preservation
- Data migration utilities

## 🛠️ Development Workflow

### Adding New Features
1. Update the appropriate store (if needed)
2. Implement component functionality
3. Add error handling with `useErrorHandler`
4. Integrate with API client
5. Add user feedback mechanisms
6. Update this integration guide

### Code Quality Standards
- TypeScript migration path planned
- ESLint configuration maintained
- Prettier code formatting
- Component documentation
- Integration test coverage

## 📞 Support & Troubleshooting

### Common Issues
1. **API Connection Failures** - Check network and API key settings
2. **Storage Quota Exceeded** - Use clear data functionality
3. **Performance Issues** - Check browser dev tools for bottlenecks
4. **Mobile Layout Issues** - Test on various screen sizes

### Debug Mode
Enable debug mode by setting `localStorage.setItem('debug', 'true')` for additional logging and error information.

---

*This integration guide will be updated as new features are added and existing ones are enhanced.*