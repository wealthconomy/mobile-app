/**
 * Production-safe logger.
 * All methods are no-ops in production builds (__DEV__ === false).
 * The bundler (Metro) will dead-code-eliminate these calls entirely in release builds.
 */
const isDev = __DEV__;

export const logger = {
  log: (...args: any[]): void => {
    if (isDev) console.log(...args);
  },
  warn: (...args: any[]): void => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]): void => {
    if (isDev) console.error(...args);
  },
  info: (...args: any[]): void => {
    if (isDev) console.info(...args);
  },
};
