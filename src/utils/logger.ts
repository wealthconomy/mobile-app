/**
 * Production-safe logger.
 * All methods are no-ops in production builds (__DEV__ === false).
 * The bundler (Metro) will dead-code-eliminate these calls entirely in release builds.
 */
const isDev = __DEV__;

export const logger = {
  log: (): void => {},
  warn: (...args: any[]): void => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]): void => {
    if (isDev) console.error(...args);
  },
  info: (): void => {},
};
