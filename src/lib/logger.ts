import { dev } from '$app/environment';

const isLoggingEnabled = dev || globalThis?.process?.env?.VITE_ENABLE_LOGGING === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.debug(...args);
    }
  }
}; 