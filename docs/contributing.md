# Contributing Guide

Thank you for your interest in contributing to the Idle MMO game! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. We expect all contributors to:

- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the Repository**
   - Click the Fork button in the top right corner of the repository page
   - This creates a copy of the repository in your GitHub account

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/idle-mmo.git
   cd idle-mmo
   ```

3. **Set Up Development Environment**
   - Follow the setup instructions in the [README.md](../README.md)
   - Make sure all tests pass before making changes

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   - Use a descriptive branch name that reflects your contribution
   - Prefix with `feature/`, `bugfix/`, `docs/`, etc. as appropriate

## Development Workflow

### Before You Start

1. **Sync with Upstream**
   ```bash
   git remote add upstream https://github.com/original-owner/idle-mmo.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Choose an Issue**
   - Look for open issues or create a new one describing your intended contribution
   - Comment on the issue to let others know you're working on it

### Making Changes

1. **Follow Coding Standards**
   - Use consistent indentation (2 spaces)
   - Follow TypeScript best practices
   - Maintain the existing code style

2. **Write Tests**
   - Add tests for new features
   - Ensure existing tests pass with your changes
   - Aim for good test coverage

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```
   - Use clear, descriptive commit messages
   - Reference the issue number if applicable (e.g., "Fixes #123")

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting a Pull Request

1. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch and the target branch on the original repository

2. **Describe Your Changes**
   - Use the PR template if available
   - Clearly describe what your changes do
   - Mention any issues that are addressed
   - Include screenshots or videos for UI changes

3. **Wait for Review**
   - Maintainers will review your PR
   - Address any requested changes or feedback
   - Be responsive to questions

4. **After Merge**
   - Delete your branch once it's merged
   - Celebrate your contribution! 🎉

## Types of Contributions

### Code

- **Bug Fixes**
  - Fix existing issues in the codebase
  - Ensure fixes are well-tested

- **Features**
  - Add new functionality to the game
  - Follow the architectural patterns described in [architecture.md](./architecture.md)

- **Performance Improvements**
  - Optimize existing code
  - Provide benchmarks showing the improvement

### Documentation

- **Code Documentation**
  - Add or improve comments in the code
  - Document public APIs

- **User Documentation**
  - Improve the game manual
  - Create tutorials for players

### Art and Design

- **UI/UX Improvements**
  - Enhance the user interface
  - Create mockups for new features

- **Game Assets**
  - Create sprites, textures, or sound effects
  - Follow the asset style guide

## Development Guidelines

### Frontend Development

- **Component Structure**
  - Follow the scene-based architecture
  - Keep UI components reusable and composable

- **State Management**
  - Use appropriate state management patterns
  - Document complex state flows

### Backend Development

- **API Design**
  - Follow RESTful principles
  - Document new endpoints

- **Database Changes**
  - Include migration scripts
  - Explain schema changes

### Game Design

- **Balance Changes**
  - Provide reasoning for balance adjustments
  - Include test data if possible

- **New Mechanics**
  - Describe how new mechanics interact with existing systems
  - Consider player experience

## Testing

- **Unit Tests**
  - Write tests using Jest
  - Focus on testing behavior, not implementation

- **Integration Tests**
  - Test interactions between components
  - Ensure APIs work correctly

- **Manual Testing**
  - Test your changes in the game
  - Verify on different browsers if applicable

## Release Process

1. **Version Bumping**
   - Follow semantic versioning (MAJOR.MINOR.PATCH)
   - Update version in package.json

2. **Change Log**
   - Document changes in CHANGELOG.md
   - Categorize changes (Added, Changed, Fixed)

3. **Release Notes**
   - Write user-friendly release notes
   - Highlight important changes

## Getting Help

- **Discord Channel**
  - Join our Discord server for real-time help
  - Ask questions in the #development channel

- **GitHub Issues**
  - Search existing issues before creating a new one
  - Use the appropriate issue template

## Recognition

All contributors will be recognized in the CONTRIBUTORS.md file. We appreciate all forms of contribution, whether it's code, documentation, design, or ideas! 