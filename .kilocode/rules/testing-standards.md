# Testing Standards

## Test-Driven Development Approach

- Always write tests before implementing features
- Test user interactions, not implementation details
- Use React Testing Library for component testing
- Use Jest for utility function testing
- Achieve comprehensive test coverage
- Never ever mark a task as completed if all test is not passing

## Testing Framework Requirements

- **Primary Testing Library**: React Testing Library
- **Test Runner**: Jest (included with Create React App)
- **Assertion Library**: Jest + @testing-library/jest-dom
- **User Event Simulation**: @testing-library/user-event

## Test File Organization

### File Structure
- Co-locate test files with components as `Component.test.js`
- Test files for utilities in same directory as utility
- Use descriptive test names that explain behavior
- Use `describe` blocks for grouping related tests

### Directory Structure
```
src/
├── components/
│   ├── Search/
│   │   ├── Search.js
│   │   └── Search.test.js
│   └── Reusable/
│       ├── ErrorBox.js
│       └── ErrorBox.test.js
└── utilities/
    ├── DataUtils.js
    └── DataUtils.test.js
```

## Testing Patterns

### Component Testing Template
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  test('should render with required props', () => {
    render(<ComponentName requiredProp="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('should handle user interactions', async () => {
    const user = userEvent.setup();
    const mockHandler = jest.fn();
    
    render(<ComponentName onClick={mockHandler} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test('should display loading state', () => {
    render(<ComponentName isLoading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### API Testing Patterns
```javascript
import { fetchWeatherData } from './WeatherService';

// Mock fetch globally
global.fetch = jest.fn();

describe('WeatherService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('should fetch weather data successfully', async () => {
    const mockResponse = { main: { temp: 25 } };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchWeatherData(40.7128, -74.0060);
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('lat=40.7128&lon=-74.0060')
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchWeatherData(40.7128, -74.0060))
      .rejects.toThrow('Network error');
  });
});
```

## Testing Best Practices

### Test Organization
- **Arrange**: Set up test data and conditions
- **Act**: Execute the function or interaction being tested
- **Assert**: Verify the expected outcome

### What to Test
- **User Interactions**: Clicks, form submissions, input changes
- **Visual Output**: Text content, element presence/absence
- **State Changes**: Component state updates, prop changes
- **Error Handling**: Error states, fallback UI
- **Accessibility**: Screen reader compatibility, keyboard navigation

### What Not to Test
- **Implementation Details**: Internal state, private methods
- **Third-party Libraries**: MUI component internals
- **Browser APIs**: Focus on component behavior

## Mocking Strategies

### Environment Variables
```javascript
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    REACT_APP_OPENWEATHER_API_KEY: 'test-api-key',
  };
});

afterEach(() => {
  process.env = originalEnv;
});
```

### External Dependencies
```javascript
// Mock react-select-async-paginate
jest.mock('react-select-async-paginate', () => ({
  AsyncPaginate: ({ onChange, placeholder }) => (
    <input
      placeholder={placeholder}
      onChange={(e) => onChange({ value: e.target.value })}
      data-testid="async-paginate"
    />
  ),
}));
```

## Coverage Requirements

### Coverage Thresholds
- **Statements**: 80% minimum
- **Branches**: 75% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum

### Coverage Commands
```bash
# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test

# Run specific test file
npm test Search.test.js

# Run tests with verbose output
npm test -- --verbose
```

## Testing Utilities

### Custom Render Helper
```javascript
// test-utils.js
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

const theme = createTheme();

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## Continuous Integration

### Pre-commit Testing
- All tests must pass before commits
- Use husky for git hooks if needed
- Run linting and formatting checks

### CI Pipeline Requirements
- Run full test suite on pull requests
- Generate coverage reports
- Fail builds if coverage drops below thresholds