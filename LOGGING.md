# Logging Configuration

This project uses a configurable logging system that can be disabled for production deployments.

## How it works

- In development mode, all logging is enabled by default
- In production builds, logging is disabled by default
- You can override this behavior using the `VITE_ENABLE_LOGGING` environment variable

## Configuration

### Development
Logging is enabled by default when running `npm run dev`.

### Production
To build for production with logging disabled (recommended):
```bash
npm run build:prod
```

To explicitly enable logging in production:
```bash
VITE_ENABLE_LOGGING=true npm run build
```

To disable logging in development (for testing):
```bash
VITE_ENABLE_LOGGING=false npm run dev
```

## Implementation

The logging system is implemented in `src/lib/logger.ts` and provides the same API as console methods:
- `logger.log()`
- `logger.error()`
- `logger.warn()`
- `logger.info()`
- `logger.debug()`

All console statements have been replaced with logger calls throughout the codebase for consistent behavior. 