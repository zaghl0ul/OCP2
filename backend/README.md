# OpenClip Pro Backend

FastAPI-based backend service for OpenClip Pro - AI-powered video clipping application.

## Features

- **Video Processing**: Upload and process video files with FFmpeg
- **AI Analysis**: Integration with OpenAI, Google Gemini, and LM Studio
- **YouTube Support**: Download and process YouTube videos
- **Clip Generation**: AI-powered automatic clip creation
- **File Management**: Secure file upload, storage, and management
- **API Security**: Authentication, encryption, and rate limiting
- **Export Options**: Multiple video export formats and qualities

## Prerequisites

- Python 3.8 or higher
- FFmpeg (for video processing)
- FFprobe (usually comes with FFmpeg)

### Installing FFmpeg

**Windows:**
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add `C:\ffmpeg\bin` to your system PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd openclip-pro/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # API Keys (optional - can be set via UI)
   OPENAI_API_KEY=your_openai_key_here
   GEMINI_API_KEY=your_gemini_key_here
   
   # Server Configuration
   HOST=0.0.0.0
   PORT=8000
   DEBUG=True
   
   # File Upload
   MAX_FILE_SIZE=500000000  # 500MB in bytes
   UPLOAD_DIR=uploads
   
   # Security
   SECRET_KEY=your_secret_key_here
   SESSION_TIMEOUT=86400  # 24 hours in seconds
   ```

## Running the Server

### Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{project_id}` - Get project details
- `DELETE /api/projects/{project_id}` - Delete project

### Video Upload & Processing
- `POST /api/upload` - Upload video file
- `POST /api/youtube` - Process YouTube URL
- `POST /api/analyze` - Start AI analysis
- `GET /api/analysis/{project_id}/status` - Get analysis status

### Clips
- `GET /api/projects/{project_id}/clips` - Get project clips
- `PUT /api/clips/{clip_id}` - Update clip
- `DELETE /api/clips/{clip_id}` - Delete clip
- `POST /api/clips/{clip_id}/export` - Export clip

### Settings & Configuration
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/test-api` - Test API connection
- `GET /api/settings/models` - Get available models

### File Management
- `GET /api/files/{file_id}` - Get file info
- `DELETE /api/files/{file_id}` - Delete file
- `GET /api/files/stats` - Get storage statistics

## AI Provider Setup

### OpenAI
1. Get API key from https://platform.openai.com/api-keys
2. Set in environment or via settings API
3. Supported models: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo

### Google Gemini
1. Get API key from https://makersuite.google.com/app/apikey
2. Set in environment or via settings API
3. Supported models: Gemini Pro, Gemini Pro Vision, Gemini 1.5 Pro

### LM Studio (Local)
1. Download and install LM Studio
2. Load a compatible model
3. Start the local server (usually on port 1234)
4. No API key required

## File Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── models/
│   └── project.py         # Pydantic data models
├── services/
│   ├── video_processor.py # Video processing service
│   ├── ai_analyzer.py     # AI analysis service
│   ├── api_manager.py     # API provider management
│   ├── security.py        # Security and encryption
│   └── file_manager.py    # File operations
└── uploads/               # File storage directory
    ├── videos/
    ├── audio/
    ├── images/
    ├── exports/
    └── thumbnails/
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Debug mode | `False` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `500000000` |
| `UPLOAD_DIR` | Upload directory | `uploads` |
| `SECRET_KEY` | Security secret | Required |
| `SESSION_TIMEOUT` | Session timeout (seconds) | `86400` |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `GEMINI_API_KEY` | Gemini API key | Optional |

### File Upload Limits

- **Maximum file size**: 500MB (configurable)
- **Supported video formats**: MP4, AVI, MOV, MKV, WMV, FLV, WebM, M4V
- **Supported audio formats**: MP3, WAV, AAC, FLAC, OGG, M4A
- **Supported image formats**: JPG, PNG, GIF, BMP, TIFF, WebP

## Security Features

- **API Key Encryption**: Sensitive data encrypted at rest
- **Session Management**: Secure session handling with timeouts
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive input sanitization
- **File Validation**: Secure file upload with type checking
- **CORS Protection**: Configurable cross-origin policies

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
isort .
flake8 .
```

### Adding New AI Providers

1. Update `ai_analyzer.py` with new provider logic
2. Add provider configuration to `api_manager.py`
3. Update models in `project.py` if needed
4. Add tests for the new provider

## Troubleshooting

### Common Issues

**FFmpeg not found:**
- Ensure FFmpeg is installed and in PATH
- Test with: `ffmpeg -version`

**Large file uploads failing:**
- Check `MAX_FILE_SIZE` setting
- Ensure sufficient disk space
- Check server timeout settings

**AI API errors:**
- Verify API keys are correct
- Check rate limits and quotas
- Test connection with `/api/settings/test-api`

**Permission errors:**
- Ensure upload directory is writable
- Check file permissions

### Logs

Logs are written to console by default. For production, configure proper logging:

```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

## Performance Optimization

### For Production

1. **Use multiple workers:**
   ```bash
   uvicorn main:app --workers 4
   ```

2. **Enable caching:**
   - Redis for session storage
   - File system caching for processed videos

3. **Database optimization:**
   - Use PostgreSQL for metadata storage
   - Index frequently queried fields

4. **File storage:**
   - Use cloud storage (S3, GCS) for large files
   - Implement CDN for video delivery

## API Rate Limits

- **OpenAI**: 60 requests/minute, 90k tokens/minute
- **Gemini**: 60 requests/minute, 32k tokens/minute
- **LM Studio**: 1000 requests/minute (local)

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run code formatting
5. Submit pull request

## License

MIT License - see LICENSE file for details.