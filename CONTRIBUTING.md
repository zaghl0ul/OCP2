# Contributing to OpenClip Pro

Thank you for your interest in contributing to OpenClip Pro! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Community](#community)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@openclippro.com](mailto:conduct@openclippro.com).

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Git** (latest version)
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **FFmpeg** (for video processing)
- A code editor (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/openclip-pro.git
   cd openclip-pro
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/openclip-pro.git
   ```

## 🛠️ Development Setup

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Verify Setup

- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Frontend: http://localhost:3000

## 🤝 How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **🐛 Bug fixes**
- **✨ New features**
- **📚 Documentation improvements**
- **🧪 Tests**
- **🎨 UI/UX improvements**
- **⚡ Performance optimizations**
- **🔒 Security enhancements**

### Contribution Workflow

1. **Check existing issues** to see if your contribution is already being worked on
2. **Create an issue** if one doesn't exist (for bugs or feature requests)
3. **Discuss your approach** in the issue before starting work
4. **Create a branch** for your work
5. **Make your changes**
6. **Test thoroughly**
7. **Submit a pull request**

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes** following our coding standards

4. **Test your changes**:
   ```bash
   # Backend tests
   cd backend
   pytest
   
   # Frontend tests
   cd frontend
   npm test
   ```

5. **Lint your code**:
   ```bash
   # Backend
   cd backend
   black .
   flake8 .
   
   # Frontend
   cd frontend
   npm run lint
   npm run format
   ```

### Submitting the Pull Request

1. **Commit your changes** using conventional commits:
   ```bash
   git add .
   git commit -m "feat: add new video processing feature"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a pull request** on GitHub with:
   - Clear title and description
   - Reference to related issues
   - Screenshots (for UI changes)
   - Testing instructions

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (please describe)

## Related Issues
Fixes #123

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## 📝 Coding Standards

### Python (Backend)

#### Style Guide
- Follow **PEP 8** style guide
- Use **Black** for code formatting
- Use **flake8** for linting
- Maximum line length: **88 characters**

#### Code Organization
```python
# Imports order:
# 1. Standard library
# 2. Third-party packages
# 3. Local application imports

import os
import sys
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .models import Project
from .services import VideoProcessor
```

#### Naming Conventions
- **Functions and variables**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private methods**: `_leading_underscore`

#### Documentation
```python
def process_video(video_path: str, output_format: str = "mp4") -> str:
    """
    Process a video file and return the output path.
    
    Args:
        video_path: Path to the input video file
        output_format: Desired output format (default: mp4)
        
    Returns:
        Path to the processed video file
        
    Raises:
        FileNotFoundError: If input video file doesn't exist
        ValueError: If output format is not supported
    """
    pass
```

### JavaScript/React (Frontend)

#### Style Guide
- Use **ESLint** with Airbnb configuration
- Use **Prettier** for code formatting
- Use **2 spaces** for indentation
- Use **semicolons**

#### Component Structure
```jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { Button } from '../ui/Button'
import { useProjectStore } from '../../stores/projectStore'

/**
 * VideoUploader component for handling video file uploads
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onUpload - Callback when upload completes
 * @param {boolean} props.disabled - Whether upload is disabled
 */
const VideoUploader = ({ onUpload, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false)
  const { uploadVideo } = useProjectStore()

  // Component logic here

  return (
    <div className="video-uploader">
      {/* Component JSX */}
    </div>
  )
}

VideoUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default VideoUploader
```

#### Naming Conventions
- **Components**: `PascalCase`
- **Files**: `PascalCase` for components, `camelCase` for utilities
- **Functions and variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **CSS classes**: `kebab-case`

### Git Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance improvements
- `ci`: CI/CD changes

#### Examples
```bash
feat(video): add support for WebM format
fix(ui): resolve button alignment issue on mobile
docs(api): update endpoint documentation
test(upload): add unit tests for file validation
```

## 🧪 Testing Guidelines

### Backend Testing

#### Test Structure
```python
# tests/test_video_processor.py
import pytest
from unittest.mock import Mock, patch

from services.video_processor import VideoProcessor

class TestVideoProcessor:
    def setup_method(self):
        self.processor = VideoProcessor()
    
    def test_extract_metadata_success(self):
        # Test implementation
        pass
    
    def test_extract_metadata_invalid_file(self):
        # Test implementation
        pass
```

#### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_video_processor.py

# Run with verbose output
pytest -v
```

### Frontend Testing

#### Test Structure
```jsx
// components/__tests__/VideoUploader.test.jsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import VideoUploader from '../VideoUploader'

describe('VideoUploader', () => {
  const mockOnUpload = jest.fn()

  beforeEach(() => {
    mockOnUpload.mockClear()
  })

  test('renders upload button', () => {
    render(<VideoUploader onUpload={mockOnUpload} />)
    expect(screen.getByText('Upload Video')).toBeInTheDocument()
  })

  test('handles file upload', async () => {
    // Test implementation
  })
})
```

#### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test VideoUploader.test.jsx
```

### Test Coverage Requirements

- **Minimum coverage**: 80%
- **Critical paths**: 95%+ coverage
- **New features**: Must include tests
- **Bug fixes**: Must include regression tests

## 📚 Documentation

### Types of Documentation

1. **Code Documentation**
   - Inline comments for complex logic
   - Docstrings for functions and classes
   - Type hints (Python) and PropTypes (React)

2. **API Documentation**
   - FastAPI automatically generates OpenAPI docs
   - Keep endpoint descriptions up to date
   - Include example requests/responses

3. **User Documentation**
   - README files
   - Setup and installation guides
   - Feature documentation
   - Troubleshooting guides

4. **Developer Documentation**
   - Architecture decisions
   - Development setup
   - Deployment guides
   - Contributing guidelines

### Documentation Standards

- Use **Markdown** for all documentation
- Include **code examples** where applicable
- Keep documentation **up to date** with code changes
- Use **clear, concise language**
- Include **screenshots** for UI features

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for solutions
3. **Try the latest version** to see if the issue is resolved
4. **Gather relevant information** (logs, screenshots, etc.)

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots to help explain the problem.

## Environment
- OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [e.g., Chrome 96, Firefox 95]
- Python Version: [e.g., 3.9.7]
- Node.js Version: [e.g., 18.12.0]
- Application Version: [e.g., 1.0.0]

## Additional Context
Any other context about the problem.

## Logs
```
Paste relevant logs here
```
```

### Security Issues

**Do not create public issues for security vulnerabilities.** Instead, email us at [security@openclippro.com](mailto:security@openclippro.com) with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature you'd like to see.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
Describe your proposed solution.

## Alternative Solutions
Describe any alternative solutions you've considered.

## Use Cases
Describe specific use cases for this feature.

## Additional Context
Any other context, mockups, or examples.
```

### Feature Development Process

1. **Discussion**: Feature requests are discussed in issues
2. **Planning**: Approved features are planned and designed
3. **Implementation**: Features are implemented following our standards
4. **Review**: Code review and testing
5. **Documentation**: Update documentation
6. **Release**: Feature is included in the next release

## 🏗️ Architecture Guidelines

### Backend Architecture

- **FastAPI** for REST API
- **Pydantic** for data validation
- **SQLAlchemy** for database operations (if applicable)
- **Dependency injection** for services
- **Async/await** for I/O operations

### Frontend Architecture

- **React 18** with hooks
- **Zustand** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations

### Code Organization

- **Separation of concerns**
- **Single responsibility principle**
- **Dependency inversion**
- **Clean architecture patterns**

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Cycle

- **Major releases**: Every 6 months
- **Minor releases**: Monthly
- **Patch releases**: As needed for critical bugs

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers bumped
- [ ] Security review completed
- [ ] Performance testing completed
- [ ] Deployment tested

## 🌟 Recognition

We appreciate all contributions and recognize contributors in several ways:

- **Contributors list** in README
- **Release notes** mention significant contributions
- **Special recognition** for major features or fixes
- **Contributor badges** for different types of contributions

## 💬 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Discord**: Real-time chat and community support
- **Email**: [community@openclippro.com](mailto:community@openclippro.com)

### Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and experiences
- Provide constructive feedback
- Follow our Code of Conduct

### Getting Help

1. **Check the documentation** first
2. **Search existing issues** and discussions
3. **Ask in Discord** for quick questions
4. **Create an issue** for bugs or feature requests
5. **Email us** for private matters

## 📞 Contact

- **General**: [hello@openclippro.com](mailto:hello@openclippro.com)
- **Technical**: [dev@openclippro.com](mailto:dev@openclippro.com)
- **Security**: [security@openclippro.com](mailto:security@openclippro.com)
- **Community**: [community@openclippro.com](mailto:community@openclippro.com)

---

Thank you for contributing to OpenClip Pro! Your efforts help make this project better for everyone. 🙏

**Happy coding!** 🚀