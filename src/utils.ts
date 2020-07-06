export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';
export const isNumber = (val: unknown): val is number => typeof val === 'number';

/* istanbul ignore next */
export const root = globalThis ?? self ?? window;
