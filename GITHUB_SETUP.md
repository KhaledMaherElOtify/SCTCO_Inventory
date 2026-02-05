# Steps to Upload to GitHub

## 1. Create a New GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `inventory-system` (or your preferred name)
   - **Description**: `CSTCO Inventory Management System - Full stack inventory tracking app`
   - **Visibility**: Public (or Private if preferred)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"
4. Copy the repository URL (HTTPS or SSH)
   - Example: `https://github.com/YOUR_USERNAME/inventory-system.git`

## 2. Initialize Git Locally

Open PowerShell and run:

```powershell
cd e:\CSTCO\Inventory\Inventory_Management_System

# Initialize git repository
git init

# Check git status
git status
```

You should see all files ready to be committed (except those in .gitignore).

## 3. Configure Git (First Time Only)

```powershell
# Set your GitHub username
git config --global user.name "Your Name"

# Set your GitHub email
git config --global user.email "your.email@gmail.com"
```

## 4. Add Remote Repository

Replace `YOUR_USERNAME` and `inventory-system` with your actual values:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/inventory-system.git
```

Verify it worked:
```powershell
git remote -v
```

## 5. Create Initial Commit

```powershell
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status

# Create commit
git commit -m "Initial commit: CSTCO Inventory Management System

- Full stack inventory management application
- React frontend with dashboard and CRUD operations
- Node.js backend with Express and SQLite
- JWT authentication and role-based access control
- Stock management, transaction tracking, and reporting"
```

## 6. Push to GitHub

First, rename main branch:
```powershell
git branch -M main
```

Then push:
```powershell
git push -u origin main
```

**If it asks for authentication:**
- Use your GitHub username
- Use a Personal Access Token as password (not your GitHub password)
  - Generate at: https://github.com/settings/tokens
  - Give it `repo` scope

## 7. Verify on GitHub

Go to https://github.com/YOUR_USERNAME/inventory-system

You should see:
✅ All your code files
✅ Proper folder structure
✅ README.md displayed
✅ Commit history

## 8. Future Updates

When you make changes:

```powershell
# Stage changes
git add .

# Commit with message
git commit -m "Describe your changes here"

# Push to GitHub
git push origin main
```

## Quick Reference Commands

```powershell
# Check status
git status

# View commit history
git log --oneline

# View remote
git remote -v

# Push changes
git push origin main

# Pull changes
git pull origin main
```

## Common Issues & Solutions

**Issue**: "fatal: not a git repository"
```powershell
# Solution: Initialize git first
git init
```

**Issue**: "permission denied" or "fatal: could not read Username"
```powershell
# Solution: Generate and use Personal Access Token
# https://github.com/settings/tokens
# Use token as password instead of GitHub password
```

**Issue**: ".gitignore not working - node_modules pushed"
```powershell
# Solution: Remove from git cache
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
git push origin main
```

**Issue**: "Untracked files" not showing
```powershell
# Solution: Check .gitignore rules
git check-ignore -v [filename]
```

## Done! 🎉

Your code is now on GitHub and ready for:
- ✅ Deployment (Vercel + Render)
- ✅ Version control
- ✅ Team collaboration
- ✅ Backup
