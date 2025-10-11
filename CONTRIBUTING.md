# Contributing to ATS Resume Checker

Thank you for your interest in contributing!

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, browser)

### Suggesting Enhancements

Open an issue with the "enhancement" label and describe:
- What problem it solves
- Proposed solution
- Alternative solutions considered

### Pull Requests

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript
- Follow existing code formatting
- Add comments for complex logic
- Keep functions small and focused
- Write descriptive variable names

### Testing

Before submitting:
- Test your changes locally
- Ensure no TypeScript errors
- Check that the build succeeds
- Test on different screen sizes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ats-checker.git
cd ats-checker

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Add your Gemini API key

# Start dev server
npm run dev
```

## Questions?

Feel free to open a discussion or reach out to the maintainers.

Thank you for contributing! 🙏
