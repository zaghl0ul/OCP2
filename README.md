# OpenClip Pro

🎬 **AI-Powered Video Clip Generator** - Transform your videos into engaging clips automatically using advanced AI technology.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)

## 🌟 Overview

OpenClip Pro is a comprehensive video processing platform that leverages artificial intelligence to automatically generate engaging video clips from longer content. Whether you're a content creator, marketer, or educator, OpenClip Pro helps you extract the most compelling moments from your videos with minimal effort.

### ✨ Key Features

- **🤖 AI-Powered Analysis**: Advanced AI models analyze your videos to identify key moments, emotions, and engaging content
- **🎯 Smart Clip Generation**: Automatically generate clips based on content analysis, trending topics, or custom criteria
- **🔄 Multi-Provider Support**: Integrate with OpenAI GPT-4 Vision, Google Gemini, and local LM Studio models
- **📱 Modern Web Interface**: Responsive, accessible React application with real-time progress tracking
- **🎨 Adaptive UI**: Learning interface that adapts to your workflow and preferences
- **⚡ High Performance**: Optimized video processing with FFmpeg and efficient file handling
- **🔒 Secure & Private**: Enterprise-grade security with encrypted API keys and secure file handling
- **🌐 YouTube Integration**: Direct processing of YouTube videos via URL
- **📊 Analytics Dashboard**: Track processing history, costs, and performance metrics
- **🎬 Professional Export**: Multiple export formats and quality options

## 🏗️ Architecture

```
OpenClip Pro/
├── backend/                 # FastAPI Python backend
│   ├── api/                # REST API endpoints
│   ├── services/           # Core business logic
│   ├── models/             # Pydantic data models
│   └── utils/              # Utility functions
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── stores/         # State management
│   │   └── utils/          # Frontend utilities
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **FFmpeg** (for video processing)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/openclip-pro.git
   cd openclip-pro
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 Configuration

### AI Provider Setup

#### OpenAI
1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to backend `.env`:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_MODEL=gpt-4-vision-preview
   ```

#### Google Gemini
1. Get your API key from [Google AI Studio](https://makersuite.google.com/)
2. Add to backend `.env`:
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-pro-vision
   ```

#### LM Studio (Local)
1. Install [LM Studio](https://lmstudio.ai/) - A user-friendly desktop application for running local LLMs
2. Start a local server with your preferred model
3. Add to backend `.env`:
   ```env
   LMSTUDIO_BASE_URL=http://localhost:1234
   LMSTUDIO_MODEL=your-local-model
   ```

### FFmpeg Installation

#### Windows
1. Download from [FFmpeg.org](https://ffmpeg.org/download.html)
2. Extract and add to PATH
3. Or use chocolatey: `choco install ffmpeg`

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

## 📖 Usage

### Basic Workflow

1. **Create a Project**
   - Navigate to the dashboard
   - Click "New Project"
   - Enter project details

2. **Upload Video**
   - Drag and drop video files
   - Or paste YouTube URL
   - Wait for processing to complete

3. **Configure AI Analysis**
   - Select AI provider and model
   - Set analysis parameters
   - Choose clip generation criteria

4. **Generate Clips**
   - Start AI analysis
   - Review generated clips
   - Edit or regenerate as needed

5. **Export Results**
   - Select export format and quality
   - Download individual clips or batch export
   - Share or integrate with other platforms

### Advanced Features

#### Custom Prompts
Create custom AI prompts for specific use cases:
```
Find moments where the speaker shows strong emotion and the audience reacts positively. Focus on segments that would work well as social media clips.
```

#### Batch Processing
Process multiple videos simultaneously:
- Upload multiple files
- Apply same settings to all
- Monitor progress in real-time

#### API Integration
Use the REST API for programmatic access:
```python
import requests

# Upload video
response = requests.post(
    "http://localhost:8000/api/upload",
    files={"file": open("video.mp4", "rb")}
)

# Start analysis
response = requests.post(
    "http://localhost:8000/api/analyze",
    json={
        "video_id": "video-id",
        "provider": "openai",
        "model": "gpt-4-vision-preview"
    }
)
```

## 🛠️ Development

### Backend Development

#### Project Structure
```
backend/
├── api/
│   ├── endpoints/          # API route handlers
│   └── dependencies.py     # Dependency injection
├── services/
│   ├── video_processor.py  # Video processing logic
│   ├── ai_analyzer.py      # AI analysis service
│   └── file_manager.py     # File operations
├── models/
│   └── project.py          # Pydantic models
└── utils/
    ├── security.py         # Security utilities
    └── config.py           # Configuration management
```

#### Adding New AI Providers
1. Extend `AIAnalyzer` class
2. Implement provider-specific methods
3. Add configuration options
4. Update API endpoints

#### Running Tests
```bash
cd backend
pytest tests/ -v
pytest tests/ --cov=. --cov-report=html
```

### Frontend Development

#### Project Structure
```
frontend/src/
├── components/
│   ├── layout/             # Layout components
│   ├── ui/                 # Reusable UI components
│   └── features/           # Feature-specific components
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   └── ProjectPage.jsx     # Project management
├── stores/
│   └── projectStore.js     # Zustand state management
└── utils/
    └── api.js              # API client
```

#### Adding New Components
1. Create component in appropriate directory
2. Follow naming conventions
3. Add to component index
4. Include in Storybook (if applicable)

#### Running Tests
```bash
cd frontend
npm test
npm run test:coverage
```

## 📊 Performance

### Optimization Tips

#### Video Processing
- Use appropriate video codecs (H.264, H.265)
- Optimize resolution for target use case
- Enable hardware acceleration when available
- Process videos in chunks for large files

#### AI Analysis
- Batch multiple requests when possible
- Use appropriate model sizes for your needs
- Implement caching for repeated analyses
- Monitor API usage and costs

#### Frontend Performance
- Enable code splitting and lazy loading
- Optimize images and assets
- Use virtual scrolling for large lists
- Implement proper caching strategies

### Monitoring

#### Backend Metrics
- Processing time per video
- AI API response times
- Error rates and types
- Resource usage (CPU, memory, disk)

#### Frontend Metrics
- Page load times
- User interaction patterns
- Bundle size and performance
- Error tracking and reporting

## 🔒 Security

### Best Practices

- **API Keys**: Store securely, never commit to version control
- **File Uploads**: Validate file types and sizes
- **User Input**: Sanitize all user inputs
- **HTTPS**: Use HTTPS in production
- **CORS**: Configure properly for your domain
- **Rate Limiting**: Implement to prevent abuse

### Security Features

- Encrypted API key storage
- Secure file handling and cleanup
- Input validation and sanitization
- Session management
- Audit logging
- CSRF protection

## 🚀 Deployment

### Production Deployment

#### Backend (Docker)
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Environment Variables
Set the following in your production environment:

**Backend**:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `SECRET_KEY`
- `DATABASE_URL`
- `REDIS_URL`

**Frontend**:
- `VITE_API_BASE_URL`
- `VITE_APP_NAME`
- `VITE_GA_TRACKING_ID`

### Scaling Considerations

- Use load balancers for multiple backend instances
- Implement Redis for session storage and caching
- Use CDN for static assets and video files
- Consider message queues for heavy processing
- Monitor and auto-scale based on demand

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- **Backend**: Follow PEP 8, use Black for formatting
- **Frontend**: Use ESLint and Prettier
- **Commits**: Follow Conventional Commits format
- **Documentation**: Update docs for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://reactjs.org/) - Frontend library
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [OpenAI](https://openai.com/) - AI models and APIs
- [Google AI](https://ai.google/) - Gemini AI models
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Support

- **Documentation**: [docs.openclippro.com](https://docs.openclippro.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/openclip-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/openclip-pro/discussions)
- **Email**: support@openclippro.com
- **Discord**: [Join our community](https://discord.gg/openclippro)

## 🗺️ Roadmap

### Version 1.1
- [ ] Real-time collaboration features
- [ ] Advanced video editing tools
- [ ] Custom AI model training
- [ ] Mobile app development

### Version 1.2
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with major platforms
- [ ] Enterprise features and SSO

### Version 2.0
- [ ] Live streaming integration
- [ ] Advanced AI features
- [ ] Marketplace for templates
- [ ] White-label solutions

---

**Made with ❤️ by the OpenClip Pro Team**

*Transform your videos into engaging content with the power of AI.*