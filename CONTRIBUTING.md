# Contributing to MultiBot Platform

Thank you for your interest in contributing to the MultiBot Platform! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment
4. Create a feature branch
5. Make your changes
6. Test your changes
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- MongoDB 6.0+
- npm 8+ or yarn 1.22+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/multibot-platform.git
   cd multibot-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp Backend/env.example Backend/.env
   cp frontend/env.example frontend/.env
   # Edit the .env files with your configuration
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

### Docker Setup

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

## Contributing Process

### 1. Choose an Issue

- Look for issues labeled `good first issue` for beginners
- Check the project roadmap for planned features
- Create a new issue if you have a feature request or bug report

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-number-description
```

### 3. Make Your Changes

- Follow the coding standards outlined below
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### 5. Commit Your Changes

Use conventional commit messages:

```
feat: add new AI model integration
fix: resolve authentication token issue
docs: update API documentation
test: add unit tests for user service
refactor: improve error handling
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Use async/await instead of callbacks
- Handle errors properly

### React

- Use functional components with hooks
- Follow React best practices
- Use PropTypes for prop validation
- Keep components small and focused
- Use meaningful component names

### General

- Write clean, readable code
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Follow the DRY principle
- Use TypeScript when possible

## Testing

### Backend Testing

```bash
cd Backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### Frontend Testing

```bash
cd frontend
npm test                   # Run all tests
npm run test:coverage      # Run tests with coverage
```

### Test Requirements

- Write unit tests for new functions
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for at least 80% code coverage
- Test error cases and edge cases

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples
- Update README files when needed

### API Documentation

- Update API_DOCUMENTATION.md for new endpoints
- Include request/response examples
- Document error codes and messages
- Add authentication requirements

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the bug
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, Node.js version, etc.)
5. **Screenshots** or error messages if applicable
6. **Logs** if available

### Feature Requests

When requesting features, please include:

1. **Clear description** of the feature
2. **Use case** and motivation
3. **Proposed implementation** (if you have ideas)
4. **Alternative solutions** considered
5. **Additional context** or examples

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] All tests pass
- [ ] Code is properly documented
- [ ] No console.log statements in production code
- [ ] Environment variables are properly handled
- [ ] Security considerations are addressed

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** from at least one maintainer
5. **Merge** after approval

## Development Guidelines

### Git Workflow

1. **Main branch** is `main`
2. **Feature branches** from `main`
3. **Hotfix branches** from `main`
4. **Release branches** from `main`

### Commit Messages

Use conventional commits:

```
type(scope): description

feat(auth): add JWT token refresh
fix(api): resolve rate limiting issue
docs(readme): update installation instructions
test(user): add unit tests for user service
refactor(utils): improve error handling
```

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and general discussion
- **Email** - For security issues: security@multibotplatform.com
- **Documentation** - Check the docs folder

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to MultiBot Platform! 🚀
