# Frontend Testing Documentation

## Overview

This document outlines the comprehensive testing strategy for the Smet Gaming Ecosystem frontend, including unit tests, integration tests, and end-to-end (E2E) tests.

## Testing Stack

### Unit & Integration Tests
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Environment**: jsdom
- **Coverage**: 70% threshold for branches, functions, lines, and statements

### E2E Tests
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Chrome Mobile, Safari Mobile
- **Coverage**: All critical user paths

## Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── **/*.test.tsx          # Component unit tests
│   ├── lib/
│   │   └── **/*.test.ts           # Utility function tests
│   └── test/
│       ├── setup.ts               # Test configuration
│       ├── utils.tsx              # Test utilities
│       └── integration/           # Integration tests
└── e2e/
    └── **/*.spec.ts               # E2E tests
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Install browsers (first time)
npx playwright install
```

## Test Categories

### Unit Tests (>70% Coverage)

#### UI Components
- **Button Component**: Variants, sizes, click handlers, disabled states
- **Loading Components**: Spinner, overlay, skeleton states
- **RewardCard**: Display logic, interactions, loading states
- **TransactionHistory**: Data display, pagination, error states

#### Utilities
- **ProbabilityCalculator**: Mathematical calculations, edge cases
- **Service Functions**: Data transformation, error handling

### Integration Tests

#### Service Integration
- **RewardVisualizationService**: Contract interactions, data processing
- **TransactionHistoryService**: Blockchain data fetching
- **Component + Service**: End-to-end data flow

### E2E Tests (Critical User Paths)

#### Navigation & Layout
- **Home Page**: Loading, navigation, wallet connection prompts
- **Mobile Responsiveness**: Menu behavior, layout adaptation
- **Cross-page Navigation**: Routing between pages

#### Analytics Dashboard
- **Data Visualization**: Charts loading, interaction
- **Responsive Design**: Mobile/desktop layouts
- **User Interactions**: Refresh functionality

## Test Configuration

### Vitest Configuration
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})
```

### Playwright Configuration
```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  }
})
```

## Mocking Strategy

### External Dependencies
- **Next.js Router**: Navigation hooks mocked
- **Wagmi**: Wallet connection hooks mocked
- **Ethers**: Contract interactions mocked
- **Window APIs**: matchMedia, localStorage mocked

### Test Data
- **Mock Factories**: Consistent test data generation
- **Fixtures**: Reusable test scenarios
- **Utilities**: Helper functions for common operations

## CI/CD Integration

### GitHub Actions Workflow
```yaml
jobs:
  unit-tests:
    - Install dependencies
    - Run unit tests with coverage
    - Upload coverage reports
  
  e2e-tests:
    - Install Playwright browsers
    - Build application
    - Run E2E tests
    - Upload test artifacts
```

### Coverage Requirements
- **Minimum**: 70% coverage across all metrics
- **Exclusions**: Configuration files, test files, type definitions
- **Reporting**: HTML, JSON, and text formats

## Best Practices

### Unit Testing
1. **Test Behavior, Not Implementation**: Focus on user interactions
2. **Use Testing Library Queries**: Prefer accessible queries
3. **Mock External Dependencies**: Isolate component logic
4. **Test Error States**: Handle loading and error scenarios

### E2E Testing
1. **Test Critical Paths**: Focus on user workflows
2. **Use Page Object Model**: Organize selectors and actions
3. **Test Across Devices**: Mobile and desktop scenarios
4. **Minimize Flakiness**: Use reliable selectors and waits

### Integration Testing
1. **Test Service Integration**: Verify data flow
2. **Mock Network Calls**: Use consistent test data
3. **Test Error Handling**: Network failures, invalid responses
4. **Verify State Management**: Component state updates

## Test Examples

### Unit Test Example
```typescript
describe('Button', () => {
  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Test Example
```typescript
test('should navigate between pages', async ({ page }) => {
  await page.goto('/')
  
  await page.getByRole('link', { name: /analytics/i }).click()
  await expect(page).toHaveURL('/analytics')
  await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible()
})
```

### Integration Test Example
```typescript
describe('Service Integration', () => {
  it('should fetch and process data', async () => {
    mockContract.getRewardDistribution.mockResolvedValue([BigInt(100)])
    
    const distribution = await service.getRewardDistribution(1)
    
    expect(distribution[0].count).toBe(100)
  })
})
```

## Debugging Tests

### Unit Tests
- Use `test.only()` to run specific tests
- Add `console.log()` for debugging
- Use Vitest UI for interactive debugging

### E2E Tests
- Use `--debug` flag for step-by-step execution
- Add `await page.pause()` for manual inspection
- Use Playwright Inspector for visual debugging

## Maintenance

### Regular Tasks
1. **Update Dependencies**: Keep testing libraries current
2. **Review Coverage**: Ensure coverage thresholds are met
3. **Refactor Tests**: Keep tests maintainable and readable
4. **Add New Tests**: Cover new features and bug fixes

### Performance Considerations
1. **Parallel Execution**: Run tests concurrently when possible
2. **Selective Testing**: Run only affected tests in development
3. **Efficient Mocking**: Minimize setup/teardown overhead
4. **Resource Management**: Clean up after tests

## Troubleshooting

### Common Issues
1. **Flaky Tests**: Use proper waits and stable selectors
2. **Memory Leaks**: Clean up event listeners and timers
3. **Async Issues**: Properly handle promises and async operations
4. **Mock Problems**: Ensure mocks are properly reset between tests

### Solutions
- Use `waitFor()` for async operations
- Clear mocks in `beforeEach()` hooks
- Use `cleanup()` from Testing Library
- Implement proper error boundaries in tests