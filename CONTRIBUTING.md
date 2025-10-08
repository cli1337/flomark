# Contributing to Flomark

Thanks for your interest in contributing! 🎉

## 📋 Quick Guide

- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## 👋 How to Contribute

We welcome all contributions! Be respectful and helpful to others.

### Found a Bug?
Open an issue with:
- Clear description
- Steps to reproduce
- Screenshots if helpful

### Want a Feature?
Open an issue describing:
- What you want
- Why it would be useful
- How it might work

### Want to Code?
1. Fork the repo
2. Create a branch
3. Make your changes
4. Test it
5. Submit a PR!

## 🛠️ Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/flomark.git
   cd flomark
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   pnpm install
   
   # Frontend
   cd ../frontend
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Backend (from backend directory)
   pnpm dev
   
   # Frontend (from frontend directory)
   pnpm dev
   ```

## 🔄 Pull Request Tips

- Keep PRs focused on one thing
- Update docs if needed
- Test your changes
- Write clear commit messages
- Be patient for review 😊

## 💻 Code Style

**Just keep it clean and consistent:**
- Use ES6+ features
- Functional components with hooks
- Meaningful variable names
- Comments for complex stuff
- 2 spaces for indentation

## 📝 Commit Messages

Keep them simple and clear:

```bash
feat: add dark mode
fix: resolve login issue
docs: update readme
refactor: simplify task logic
```

Common types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`

## 🎯 Quick Workflow

```bash
# 1. Create a branch
git checkout -b my-feature

# 2. Make changes and commit
git commit -m "feat: my awesome feature"

# 3. Push and create PR
git push origin my-feature
```

Then open a Pull Request on GitHub!

## ❓ Need Help?

- Check existing issues
- Open a new issue if stuck
- Ask in discussions

## 🙏 Thanks!

Every contribution helps make Flomark better! ⭐

---

**Note:** By contributing, you agree your code will be under the MIT License.

