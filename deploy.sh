#!/bin/bash
# Deploy script for D&D Grimoire Builder

echo "🧙‍♂️ Starting deployment of D&D Grimoire Builder..."
echo "🔧 Building application..."
pnpm run build

echo "🚀 Deploying to GitHub Pages..."
npx gh-pages -d build

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://rogeriomoura.github.io/dnd-grimoire"
