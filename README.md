# @captify/core

Core components, types, and utilities for the Captify platform.

## Installation

```bash
npm install @captify/core
# or
pnpm add @captify/core
# or
yarn add @captify/core
```

## Usage

```tsx
import { Button, Card } from '@captify/core/ui';
import { useAuth } from '@captify/core/auth';
import { CaptifyProvider } from '@captify/core/components';

function App() {
  return (
    <CaptifyProvider>
      <Card>
        <Button>Click me</Button>
      </Card>
    </CaptifyProvider>
  );
}
```

## Exports

- `/ui` - UI components (Button, Card, Dialog, etc.)
- `/auth` - Authentication utilities and hooks
- `/components` - Core React components
- `/services` - Service utilities
- `/hooks` - React hooks
- `/types` - TypeScript type definitions
- `/api` - API utilities

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Development mode with watch
pnpm dev
```

## License

MIT