export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';
export const isNumber = (val: unknown): val is number => typeof val === 'number';

export const startsWith = (str: string, target: string) => str.slice(0, target.length) === target;

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const hasOwn = (obj: object, key: string) => hasOwnProperty.call(obj, key);
