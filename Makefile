# Smet Card Components - Development Makefile

.PHONY: help dev build test lint clean install setup storybook docs docker-build docker-run

# Default target
help: ## Show this help message
	@echo "Smet Card Components - Development Commands"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# Development
dev: ## Start development server (if in a Next.js project)
	@echo "🚀 Starting development server..."
	@if [ -f "package.json" ]; then \
		npm run dev; \
	else \
		echo "No package.json found. This appears to be a component library."; \
		echo "To use these components, integrate them into a React/Next.js project."; \
	fi

build: ## Build for production (if in a Next.js project)
	@echo "🔨 Building for production..."
	@if [ -f "package.json" ]; then \
		npm run build; \
	else \
		echo "No package.json found. This is a component library."; \
	fi

# Component Library Setup
init-package: ## Initialize as an npm package
	@echo "📦 Initializing npm package..."
	@if [ ! -f "package.json" ]; then \
		npm init -y; \
		npm install --save-dev typescript @types/react @types/node; \
		npm install --save react react-dom tailwindcss; \
		echo "✅ Package initialized. Update package.json with your details."; \
	else \
		echo "package.json already exists."; \
	fi

# TypeScript
type-check: ## Run TypeScript type checking
	@echo "🔍 Running TypeScript type checking..."
	@if [ -f "tsconfig.json" ]; then \
		npx tsc --noEmit; \
	else \
		echo "No tsconfig.json found. Run 'make init-package' first."; \
	fi

# Testing (placeholder)
test: ## Run tests (placeholder)
	@echo "🧪 Running tests..."
	@if [ -f "package.json" ] && grep -q '"test"' package.json; then \
		npm test; \
	else \
		echo "No test script configured. Add testing framework to package.json"; \
	fi

# Linting (placeholder)
lint: ## Run linting (placeholder)
	@echo "🔍 Running linter..."
	@if [ -f "package.json" ] && grep -q '"lint"' package.json; then \
		npm run lint; \
	else \
		echo "No lint script configured. Consider adding ESLint."; \
	fi

# Storybook (for component development)
storybook: ## Start Storybook for component development
	@echo "📚 Starting Storybook..."
	@if [ -f "package.json" ] && grep -q "storybook" package.json; then \
		npm run storybook; \
	else \
		echo "Storybook not configured. Install and setup Storybook for component development."; \
	fi

# Documentation
docs: ## Generate documentation
	@echo "📖 Generating documentation..."
	@if command -v typedoc &> /dev/null; then \
		npx typedoc --out docs src; \
	else \
		echo "TypeDoc not installed. Run: npm install -g typedoc"; \
	fi

# Dependencies
install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	@if [ -f "package.json" ]; then \
		npm install; \
	else \
		echo "No package.json found. Run 'make init-package' first."; \
	fi

deps-update: ## Update dependencies
	@echo "⬆️  Updating dependencies..."
	@if [ -f "package.json" ]; then \
		npm update; \
	else \
		echo "No package.json found."; \
	fi

# Docker
docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	docker build -t smet-components .

docker-run: ## Run Docker container
	@echo "🐳 Running Docker container..."
	docker run -p 3000:3000 smet-components

docker-compose-up: ## Start services with docker-compose
	@echo "🐳 Starting services with docker-compose..."
	docker-compose up -d

docker-compose-down: ## Stop services with docker-compose
	@echo "🛑 Stopping services with docker-compose..."
	docker-compose down

# Build & Publish
build-lib: ## Build the component library
	@echo "🔨 Building component library..."
	@if [ -f "package.json" ]; then \
		npm run build; \
	else \
		echo "No package.json found. Run 'make init-package' first."; \
	fi

publish-dry: ## Dry run npm publish
	@echo "📦 Dry run npm publish..."
	@if [ -f "package.json" ]; then \
		npm publish --dry-run; \
	else \
		echo "No package.json found."; \
	fi

publish: ## Publish to npm
	@echo "📦 Publishing to npm..."
	@if [ -f "package.json" ]; then \
		npm publish; \
	else \
		echo "No package.json found."; \
	fi

# Environment
setup: ## Setup development environment
	@echo "🚀 Setting up development environment..."
	./setup.sh

env-check: ## Check environment setup
	@echo "🔍 Checking environment..."
	@node --version 2>/dev/null || echo "Node.js not found"
	@npm --version 2>/dev/null || echo "npm not found"
	@npx --version 2>/dev/null || echo "npx not found"
	@echo "✅ Environment check complete"

# Cleanup
clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf build
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf docs

clean-all: ## Clean everything including node_modules
	@echo "🧹 Cleaning everything..."
	rm -rf dist
	rm -rf build
	rm -rf .next
	rm -rf node_modules
	rm -rf docs

# Component Development
create-component: ## Create a new component (usage: make create-component name=Button)
	@echo "🆕 Creating new component: $(name)"
	@if [ -z "$(name)" ]; then \
		echo "Usage: make create-component name=ComponentName"; \
		exit 1; \
	fi
	@mkdir -p components
	@echo "import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface $(name)Props extends HTMLAttributes<HTMLDivElement> {}

export const $(name) = forwardRef<HTMLDivElement, $(name)Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('', className)}
      {...props}
    />
  )
)
$(name).displayName = '$(name)'" > components/$(name).tsx
	@echo "✅ Component $(name).tsx created in components/ directory"

# Utility
format: ## Format code with Prettier
	@echo "💅 Formatting code..."
	@if command -v npx &> /dev/null; then \
		npx prettier --write .; \
	else \
		echo "Prettier not available"; \
	fi