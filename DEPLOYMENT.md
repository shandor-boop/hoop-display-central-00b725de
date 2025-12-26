# Deployment Guide - GitHub Pages

This guide will help you deploy your Basketball Scoreboard app to GitHub Pages so it's accessible via a public URL.

## Prerequisites

1. A GitHub account
2. This repository pushed to GitHub
3. GitHub Pages enabled in your repository settings

## Step-by-Step Deployment

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (in the repository navigation bar)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
5. Save the settings

### 2. Push Your Code

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Build your app when you push to `main` or `master` branch
- Deploy it to GitHub Pages

Simply push your code:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 3. Wait for Deployment

1. Go to the **Actions** tab in your GitHub repository
2. You'll see a workflow run called "Deploy to GitHub Pages"
3. Wait for it to complete (usually takes 1-2 minutes)
4. Once complete, you'll see a green checkmark

### 4. Access Your App

Your app will be available at:
```
https://YOUR_USERNAME.github.io/hoop-display-central-00b725de/
```

Replace `YOUR_USERNAME` with your GitHub username.

**Routes:**
- Controller: `https://YOUR_USERNAME.github.io/hoop-display-central-00b725de/`
- Scoreboard: `https://YOUR_USERNAME.github.io/hoop-display-central-00b725de/scoreboard`

## Custom Domain (Optional)

If you want to use a custom domain:

1. In your repository **Settings** > **Pages**
2. Enter your custom domain in the **Custom domain** field
3. Update `vite.config.ts` to set `base: '/'` instead of the current base path
4. Update the GitHub Actions workflow if needed
5. Configure DNS records as instructed by GitHub

## Troubleshooting

### Build Fails
- Check the **Actions** tab for error messages
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### 404 Errors on Routes
- The `404.html` file in `public/` handles SPA routing
- Ensure it's included in your build

### Base Path Issues
- The app is configured for the base path `/hoop-display-central-00b725de/`
- If you change the repository name, update `base` in `vite.config.ts`

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build the app
npm run build

# The dist folder contains your built app
# You can deploy the contents of dist/ to any static hosting service
```

## Local Development

To test locally with the same base path as production:

```bash
npm run dev
```

The app will be available at `http://localhost:8080/hoop-display-central-00b725de/`

