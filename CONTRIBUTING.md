# Contributing to Job Portal

We love your input! We want to make contributing to Job Portal as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Git

### Local Development

1. **Fork and clone the repository**
```bash
git clone https://github.com/p4r1ch4y/job-portal.git
cd job-portal
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Set up environment variables**
Copy `.env.example` files and configure them:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Code Style

### JavaScript/React
- Use ES6+ features
- Follow React Hooks patterns
- Use functional components over class components
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic color names

### Backend
- Follow RESTful API conventions
- Use async/await over promises
- Implement proper error handling
- Add input validation for all endpoints
- Use meaningful HTTP status codes

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples
```
feat(auth): add password reset functionality
fix(dashboard): resolve stats calculation error
docs(readme): update installation instructions
style(components): improve button hover effects
```

## Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd backend
npm test
```

### End-to-End Testing
```bash
npm run test:e2e
```

## Code Review Process

1. **Automated Checks**: All PRs must pass automated checks (linting, tests, build)
2. **Peer Review**: At least one maintainer must review and approve the PR
3. **Testing**: Ensure all new features are tested
4. **Documentation**: Update relevant documentation

## Issue Reporting

### Bug Reports

When filing a bug report, please include:

1. **Summary**: A clear and concise description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the behavior
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: 
   - OS (Windows, macOS, Linux)
   - Browser (Chrome, Firefox, Safari)
   - Node.js version
   - MongoDB version
6. **Screenshots**: If applicable, add screenshots
7. **Additional Context**: Any other context about the problem

### Feature Requests

When proposing a new feature:

1. **Problem Statement**: Describe the problem you're trying to solve
2. **Proposed Solution**: Describe your proposed solution
3. **Alternatives**: Describe alternatives you've considered
4. **Additional Context**: Add any other context or screenshots

## Security Issues

If you discover a security vulnerability, please send an email to security@jobportal.com instead of creating a public issue.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special recognition for major features or fixes

## Getting Help

- **Documentation**: Check the README and wiki
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

---

Thank you for contributing to Job Portal! 🚀
