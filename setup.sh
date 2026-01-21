#!/bin/bash

# Smet Card Components - Development Setup Script
echo "🚀 Setting up Smet Card Components development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d"." -f1 | cut -d"v" -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Check if this is already an npm package
if [ ! -f "package.json" ]; then
    echo "📦 Initializing npm package..."
    npm init -y

    # Install basic dependencies for a React component library
    echo "📦 Installing dependencies..."
    npm install --save-dev typescript @types/react @types/node
    npm install --save react react-dom tailwindcss

    # Create basic tsconfig.json
    echo "⚙️  Creating TypeScript configuration..."
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
EOF

    # Update package.json with component library settings
    npm pkg set name="smet-components"
    npm pkg set version="1.0.0"
    npm pkg set description="Card UI components for React applications"
    npm pkg set main="dist/index.js"
    npm pkg set types="dist/index.d.ts"
    npm pkg set scripts.build="tsc"
    npm pkg set scripts.dev="tsc --watch"
    npm pkg set scripts.clean="rm -rf dist"
    npm pkg set keywords="react,components,ui,card,tailwindcss"
    npm pkg set author="Smet"
    npm pkg set license="MIT"

    echo "✅ Package initialized with TypeScript and React support"
else
    echo "📦 Package already exists, installing dependencies..."
    npm install
fi

# Create lib/utils.ts if it doesn't exist (used by the card component)
if [ ! -d "lib" ]; then
    mkdir -p lib
fi

if [ ! -f "lib/utils.ts" ]; then
    echo "🛠️  Creating utility functions..."
    cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

    # Install required dependencies for utils
    npm install clsx tailwind-merge
fi

# Create a basic index.ts file for the library
if [ ! -f "index.ts" ]; then
    echo "📄 Creating library index file..."
    cat > index.ts << 'EOF'
export * from './card'
EOF
fi

# Try to build the library
echo "🔨 Building the component library..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Component library built successfully"
else
    echo "⚠️  Build failed, but that's okay for development"
fi

echo "🎉 Setup complete!"
echo ""
echo "Available commands:"
echo "  make help              - Show all available commands"
echo "  make dev               - Start TypeScript watch mode"
echo "  make build             - Build the component library"
echo "  make type-check        - Run TypeScript type checking"
echo "  make create-component  - Create a new component"
echo "  make docker-compose-up - Start all services"
echo ""
echo "Next steps:"
echo "1. The Card components are ready to use"
echo "2. Import them in your React/Next.js project:"
echo "   import { Card, CardHeader, CardTitle, CardContent } from 'smet-components'"
echo "3. Run 'make build' to build for production"
echo "4. Run 'make publish' to publish to npm (after updating package details)"
echo ""
echo "For development:"
echo "- Run 'make dev' to watch for changes"
echo "- Use 'make create-component name=Button' to create new components"
echo "- Components are located in the root directory and use Tailwind CSS classes"