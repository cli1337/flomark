# 🎭 Demo Mode Guide

Enable demo mode in Flomark to allow anyone to access and interact with a public demo project without authentication.

---

## What is Demo Mode?

Demo mode allows you to showcase Flomark's features by making a specific project publicly accessible. Users can:

- ✅ View the demo project without login
- ✅ Create and edit tasks
- ✅ Move tasks between columns
- ✅ Add labels and due dates
- ✅ See real-time updates
- ✅ Try all features without registration

**Limitations:**
- ❌ Cannot delete the demo project
- ❌ Cannot delete users
- ⚠️ All changes are visible to everyone using the demo

---

## Setup Demo Mode

### 1. Enable Demo Mode

Edit `backend/.env`:

```env
DEMO_MODE=true
DEMO_PROJECT_ID=demo-project
```

### 2. Create Demo Project

Run the setup script to create the demo project with sample data:

```bash
cd backend
pnpm run setup-demo
```

This will create:
- Demo user account (`demo@flomark.local`)
- Demo project with sample lists (To Do, In Progress, Review, Done)
- Sample tasks with different labels
- Sample labels (Feature, Bug, Enhancement, Documentation)

### 3. Restart Backend

```bash
pm2 restart flomark-backend
# or during development
pnpm dev
```

### 4. Access Demo Project

The demo project will be accessible at:
```
http://yourdomain.com/projects/demo-project
```

A banner will appear at the top of the page indicating demo mode is active.

---

## Installation Script Support

The unified installation script (`install.sh`) includes an interactive prompt for demo mode:

```bash
chmod +x install.sh
sudo ./install.sh yourdomain.com
```

During installation, you'll be asked:
```
Enable Demo Mode? (allows anyone to access without login) [y/N]:
```

Answer `y` to automatically:
- Enable demo mode in `.env`
- Set up the demo project ID
- Display instructions for creating demo data

---

## Configuration Options

### Environment Variables

```env
# Enable/disable demo mode
DEMO_MODE=true

# ID of the demo project (must match the project created)
DEMO_PROJECT_ID=demo-project
```

### Customize Demo Project

You can customize the demo project by editing:
```
backend/scripts/setup-demo.js
```

Modify:
- Project name and description
- List names and order
- Sample tasks
- Labels and colors
- Number of demo users

---

## Security Considerations

### What Demo Mode Does

1. **Bypasses Authentication**: For the demo project only, users don't need to login
2. **Creates Demo User**: Automatically creates/uses `demo@flomark.local` user
3. **Prevents Destruction**: Blocks deletion of projects (but allows task deletion)
4. **Middleware Layer**: Intercepts requests to demo project before authentication

### What Demo Mode DOESN'T Do

- ❌ Doesn't affect other projects
- ❌ Doesn't create security vulnerabilities for non-demo projects
- ❌ Doesn't expose user data
- ❌ Doesn't allow admin access
- ❌ Doesn't bypass authorization for protected routes

### Best Practices

1. **Production Use**: Only enable demo mode if you want public demo access
2. **Monitoring**: Monitor the demo project for inappropriate content
3. **Reset Periodically**: Consider resetting demo data regularly
4. **Separate Instance**: For high-traffic demos, use a separate server instance
5. **Rate Limiting**: Consider adding rate limiting to demo endpoints

---

## Resetting Demo Data

To reset the demo project to its original state:

```bash
# Option 1: Re-run setup (updates existing data)
cd backend
pnpm run setup-demo

# Option 2: Delete and recreate via Prisma Studio
npx prisma studio
# Navigate to Project table, delete demo project, then run setup-demo

# Option 3: Manual database reset (use with caution)
# This will delete ALL data, not just demo data
npx prisma db push --force-reset
pnpm run setup-demo
```

---

## Technical Implementation

### Backend Middleware

Demo mode uses three middleware functions:

1. **`demoModeMiddleware`**: Checks if request is for demo project and creates/attaches demo user
2. **`preventDemoDestruction`**: Prevents destructive operations on demo projects
3. **`addDemoInfo`**: Adds demo mode info to responses

### Frontend Components

- **`DemoModeBanner`**: Displays banner when demo mode is active
- Shows demo project link
- Indicates public access

### API Endpoint

```
GET /api/demo-info
```

Returns:
```json
{
  "demoMode": true,
  "demoProjectId": "demo-project"
}
```

---

## Use Cases

### 1. Product Showcase

Show potential users how Flomark works:
- Add to landing page
- Link from marketing materials
- Embed in product tours

### 2. Feature Demo

Demonstrate specific features:
- Real-time collaboration
- Drag-and-drop
- Task management
- Label filtering

### 3. User Onboarding

Let new users try before signing up:
- Interactive tutorial
- Guided walkthroughs
- Feature exploration

### 4. Testing & QA

Use for testing without creating accounts:
- UI/UX testing
- Performance testing
- Feature testing

---

## Customization Examples

### Custom Welcome Message

Edit `backend/scripts/setup-demo.js`:

```javascript
description: 'Welcome to [Your Company] Task Manager! This is a live demo where you can explore all features. Feel free to create, edit, and move tasks around.',
```

### More Sample Tasks

Add to the `tasks` array in `setup-demo.js`:

```javascript
{
  title: '🔍 Search and Filter',
  description: 'Try the search and filter features in the project header!',
  listId: todoList.id,
  order: 2,
  labelId: featureLabel?.id
}
```

### Additional Labels

Add to the `labels` array:

```javascript
{ name: 'Priority', color: '#dc2626' },
{ name: 'Design', color: '#8b5cf6' }
```

---

## Troubleshooting

### Demo Mode Not Working

```bash
# Check .env file
cat backend/.env | grep DEMO

# Should show:
# DEMO_MODE=true
# DEMO_PROJECT_ID=demo-project

# Restart backend
pm2 restart flomark-backend
```

### Demo Project Not Found

```bash
# Run setup script
cd backend
pnpm run setup-demo

# Check project exists in database
npx prisma studio
# Navigate to Project table, verify demo-project exists
```

### Banner Not Showing

- Clear browser cache
- Check browser console for errors
- Verify `/api/demo-info` endpoint returns correct data:
  ```bash
  curl http://localhost:3000/api/demo-info
  ```

### Cannot Access Demo Project

- Verify project ID matches in `.env` and database
- Check browser network tab for 401/403 errors
- Ensure demo middleware is applied to routes

---

## Disabling Demo Mode

To disable demo mode:

1. Edit `backend/.env`:
   ```env
   DEMO_MODE=false
   ```

2. Restart backend:
   ```bash
   pm2 restart flomark-backend
   ```

The demo project will still exist but require authentication to access.

---

## FAQ

**Q: Can I have multiple demo projects?**  
A: Currently, only one demo project is supported. You can modify the middleware to support multiple demo projects.

**Q: Will demo users see other users' projects?**  
A: No, demo mode only affects the specific demo project. All other projects remain protected.

**Q: Can demo users create accounts?**  
A: Yes, demo users can still navigate to the registration page and create real accounts.

**Q: Is data persistent?**  
A: Yes, all changes in demo mode are saved to the database. Consider periodic resets.

**Q: Can I use this for user testing?**  
A: Absolutely! Demo mode is perfect for user testing and gathering feedback.

**Q: Does demo mode affect performance?**  
A: Minimal impact. The middleware adds a small overhead for demo project checks.

---

## Support

For issues or questions:

- **Main Documentation**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **GitHub Issues**: https://github.com/cli1337/flomark/issues

---

**Make Flomark accessible to everyone! 🚀**

