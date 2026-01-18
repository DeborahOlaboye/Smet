# Smet

A modern, accessible React component library built with TypeScript and Tailwind CSS.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## ✨ Overview

Smet is a lightweight, accessible component library inspired by shadcn/ui. It provides a collection of reusable React components built with modern web standards, TypeScript, and Tailwind CSS.

### Key Features

- **TypeScript First**: Full TypeScript support with comprehensive type definitions
- **Accessible**: WCAG 2.1 AA compliant components with proper ARIA attributes
- **Customizable**: Built with Tailwind CSS for easy theming and customization
- **Lightweight**: Minimal dependencies, tree-shakable components
- **Modern**: Uses React 18 features and modern JavaScript patterns
- **Responsive**: Mobile-first design with responsive breakpoints

## 🚀 Installation

```bash
npm install smet
```

## 📦 Components

### Layout Components

#### Card
A flexible container component for content organization.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from 'smet'

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <button>Action</button>
      </CardFooter>
    </Card>
  )
}
```

### Props

| Component | Props | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `Card` | `className` | `string` | `undefined` | Additional CSS classes |
| `CardHeader` | `className` | `string` | `undefined` | Additional CSS classes |
| `CardTitle` | `className` | `string` | `undefined` | Additional CSS classes |
| `CardContent` | `className` | `string` | `undefined` | Additional CSS classes |
| `CardFooter` | `className` | `string` | `undefined` | Additional CSS classes |

## 🎨 Styling

Smet uses Tailwind CSS for styling. You can customize the appearance by:

1. **Overriding CSS classes** using the `className` prop
2. **Modifying Tailwind config** to change design tokens
3. **Creating custom variants** with Tailwind's variant system

### Customizing Styles

```tsx
// Using className prop
<Card className="bg-red-100 border-red-200">
  <CardHeader>
    <CardTitle className="text-red-800">Custom Card</CardTitle>
  </CardHeader>
</Card>
```

### Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      }
    }
  }
}
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/AdekunleBamz/Smet.git
cd Smet

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Project Structure

```
Smet/
├── card.tsx              # Card component
├── pull_request_template.md # PR template
├── package.json          # Package configuration
├── README.md             # This file
└── tsconfig.json         # TypeScript configuration
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 API Reference

### Card Component

The Card component is a flexible container that groups related content.

#### Card Props

```typescript
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}
```

#### CardHeader Props

```typescript
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}
```

#### CardTitle Props

```typescript
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string
}
```

#### CardDescription Props

```typescript
interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string
}
```

#### CardContent Props

```typescript
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}
```

#### CardFooter Props

```typescript
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- **Components**: Add new accessible UI components
- **Features**: Enhance existing components with new functionality
- **Documentation**: Improve docs, add examples, and tutorials
- **Testing**: Add comprehensive test coverage
- **Accessibility**: Ensure WCAG compliance and improve screen reader support
- **Performance**: Optimize bundle size and runtime performance

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-component`
3. Make your changes with tests
4. Ensure TypeScript types are correct
5. Run linting and formatting
6. Submit a pull request

### Guidelines

- **TypeScript**: All components must have proper TypeScript definitions
- **Accessibility**: Components must be WCAG 2.1 AA compliant
- **Testing**: Add unit tests for all new functionality
- **Documentation**: Document all props and usage examples
- **Styling**: Use Tailwind CSS classes for customization
- **Performance**: Keep bundle size minimal and tree-shakable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [shadcn/ui](https://ui.shadcn.com/)
- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

<div align="center">

**Built with ❤️ for modern web applications**

</div>
