# @captify-io/core

Core components, types, and utilities for the Captify platform.

## Installation

This package is hosted on GitHub Package Registry. To install it in your project:

```bash
npm install @captify-io/core
```

Or with pnpm:
```bash
pnpm add @captify-io/core
```

## Package Exports

This package provides multiple entry points for different parts of the core functionality:

### Components
```typescript
import { /* components */ } from '@captify-io/core/components'
// or
import { /* components */ } from '@captify-io/core'
```

### UI Components
```typescript
import { /* UI components */ } from '@captify-io/core/ui'
```

### Services
```typescript
import { /* services */ } from '@captify-io/core/services'
```

### Hooks
```typescript
import { /* hooks */ } from '@captify-io/core/hooks'
```

### Types
```typescript
import type { /* types */ } from '@captify-io/core/types'
```

### API Utilities
```typescript
import { /* API utilities */ } from '@captify-io/core/api'
```

### Auth Utilities
```typescript
import { /* auth utilities */ } from '@captify-io/core/auth'
```

## Features

- **UI Components**: Pre-built React components using Radix UI and Tailwind CSS
- **AWS Integration**: Built-in AWS SDK clients for Cognito, DynamoDB, and S3
- **Authentication**: NextAuth integration with AWS Cognito
- **Form Handling**: React Hook Form with Zod validation
- **Data Tables**: Tanstack Table integration
- **Charts**: Recharts for data visualization
- **Theming**: Dark mode support with next-themes
- **Animations**: Tailwind CSS animations

## Development

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Building the Package

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm type-check

# Clean build artifacts
pnpm clean
```

### Project Structure

```
captify-core/
├── src/
│   ├── components/    # React components
│   ├── services/      # Service utilities
│   ├── hooks/         # React hooks
│   ├── types/         # TypeScript types
│   ├── api/           # API utilities
│   ├── auth/          # Authentication utilities
│   └── ui/            # UI components
├── dist/              # Built files (generated)
└── package.json
```

## Publishing

This package is automatically published to GitHub Package Registry. The package is configured to be publicly accessible.

### Manual Publishing

1. Ensure you're authenticated with GitHub Package Registry
2. Build the package: `pnpm build`
3. Publish: `npm publish`

## Version

Current version: 1.0.7

## Repository

- **GitHub**: https://github.com/captify-io/core
- **Issues**: https://github.com/captify-io/core/issues

## License

Proprietary - Captify IO

## Contributing

Please submit issues and pull requests to the [captify-io/core](https://github.com/captify-io/core) repository.