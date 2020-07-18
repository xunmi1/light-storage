import LightStorage from '../src';
import { delay } from './utils';

describe('create', () => {
  const defaultPrefix = 'light-storage';
  const storage = new LightStorage();

  test('created instance', () => {
    expect(storage).toStrictEqual(expect.any(LightStorage));
    expect(storage.prefix).toBe(defaultPrefix);
  });
});

/**
 * use same instance
 */
const PREFIX = 'test';
const instance = new LightStorage(PREFIX);

afterEach(() => window.localStorage.clear());

describe('check prefix', () => {
  test('get prefix', () => {
    expect(instance.prefix).toBe(PREFIX);
  });

  describe('change prefix', () => {
    const prefix = 'old-prefix';
    const key = `${prefix}-change`;
    const newPrefix = 'new-prefix';
    const newKey = `${newPrefix}-change`;
    const value = 'value';
    const db = new LightStorage(prefix);

    window.localStorage.setItem(key, value);

    db.prefix = newPrefix;
    expect(db.prefix).toBe(newPrefix);
    expect(window.localStorage.getItem(key)).toBeNull();
    expect(window.localStorage.getItem(newKey)).toBe(value);

    test('use native removeItem', () => {
      window.localStorage.removeItem(newKey);
      db.prefix = prefix;
      expect(window.localStorage.getItem(key)).toBeNull();
    });
  });
});

describe('get data', () => {
  const key = 'origin value';
  const originKey = `${PREFIX}-${key}`;
  const origin = JSON.stringify({ value: true });

  test('get origin value', () => {
    window.localStorage.setItem(originKey, origin);
    expect(instance.get(key)).toBe(true);
    expect(instance.get(originKey)).toBe(true);
  });

  test('get default value', () => {
    const key = 'get data';
    const defaultValue = { value: true, label: '获取默认值' };
    expect(instance.get(key, defaultValue)).toEqual(defaultValue);
  });

  test('use native removeItem', () => {
    window.localStorage.removeItem(originKey);
    expect(instance.get(key)).toBeUndefined();
  });

  test('get unsafe data', () => {
    const unsafeData = '[{];<>';
    window.localStorage.setItem(originKey, unsafeData);
    expect(instance.get(key)).toBe(unsafeData);
  });

  test('get number-like', () => {
    const numberLike = '123456';
    window.localStorage.setItem(originKey, numberLike);
    expect(instance.get(key)).toBe(Number(numberLike));
  });
});

describe('check data', () => {
  test('set data', () => {
    const mockData = {
      str: 'A lightweight tool for handing localStorage',
      number: Math.random() * 1000,
      arr: ['a', 'b', { c: 'c' }, null],
      bool: true,
      empty: null,
      undef: undefined,
    };
    Object.entries(mockData).forEach(([key, value]) => instance.set(key, value));
    const copyData = Object.keys(mockData).reduce((obj, key) => {
      const value = instance.get(key);
      expect(value).toStrictEqual(mockData[key]);
      return { ...obj, [key]: instance.get(key) };
    }, {});
    expect(copyData).toStrictEqual(mockData);
  });
});

describe('check maxAge', () => {
  const mockData = 'light-storage';

  test('base time', async () => {
    const key = 'base';
    instance.set(key, mockData, { maxAge: 10 });
    expect(instance.get(key)).toBe(mockData);
    expect(instance.getMaxAge(key)).toBe(10);
    await delay(15);
    expect(instance.get(key)).toBeUndefined();
    expect(instance.getMaxAge(key)).toBeUndefined();
  });

  test('update maxAge', async () => {
    const key = 'maxAge';
    instance.set(key, mockData, { maxAge: 20 });
    instance.set(key, mockData, { maxAge: 10 });
    expect(instance.getMaxAge(key)).toBe(10);
    await delay(15);
    expect(instance.get(key)).toBeUndefined();
  });

  test('update created time', async () => {
    const key = 'createdTime';
    instance.set(key, mockData, { maxAge: 20 });
    await delay(10);
    instance.set(key, mockData, { maxAge: 20, update: true });
    await delay(5);
    expect(instance.get(key)).toBe(mockData);
    await delay(20);
    expect(instance.get(key)).toBeUndefined();
  });

  test('set maxAge with native setItem', async () => {
    const key = 'maxAge-with-native';
    const originKey = `${PREFIX}-${key}`;
    const time = Date.now();
    const setItem = (data: any) => window.localStorage.setItem(originKey, JSON.stringify(data));
    setItem({ value: '', time, maxAge: 20, version: '*' });
    expect(instance.get(key)).toBe('');
    setItem({ value: '', time, maxAge: 10, version: '*' });
    await delay(15);
    expect(instance.get(key)).toBeUndefined();
  });

  test('error time', () => {
    const trigger = () => instance.set('mock', mockData, { maxAge: -1 });
    expect(trigger).toThrowError(TypeError);
  });
});

describe('has value', () => {
  test('not maxAge', () => {
    const key = 'not maxAge';
    expect(instance.has(key)).toBe(false);
    instance.set(key, '');
    expect(instance.has(key)).toBe(true);
  });

  test('has maxAge', async () => {
    instance.set('maxAge', '', { maxAge: 5 });
    await delay(10);
    expect(instance.has('maxAge')).toBe(false);
  });
});

describe('remove one', () => {
  test('remove one', () => {
    instance.set('mock', true, { maxAge: 20 });
    instance.remove('mock');
    expect(instance.get('mock')).toBeUndefined();
  });
});

describe('cleanup', () => {
  instance.set('mock', true);
  instance.clear();
  const keys = Object.keys(window.localStorage).filter(k => k.startsWith(PREFIX));
  expect(keys.length).toBe(0);
});

describe('verify keys', () => {
  beforeAll(() => {
    instance.clear();
  });

  test('after cleanup', () => {
    expect(instance.keys).toStrictEqual([]);
  });

  test('size is one', () => {
    instance.set('verify keys', '');
    expect(instance.keys).toStrictEqual(['verify keys']);
  });

  test('use native removeItem', () => {
    instance.set('verify keys', '');
    window.localStorage.removeItem(`${PREFIX}-verify keys`);
    expect(instance.keys).toStrictEqual([]);
  });

  test('size of new instance', () => {
    const prefix = 'new-instance-size';
    window.localStorage.setItem(`${prefix}-a`, 'a');
    const db = new LightStorage(prefix);
    expect(db.keys).toStrictEqual(['a']);
    window.localStorage.removeItem(`${prefix}-a`);
    window.localStorage.setItem(`${prefix}-b`, 'b');
    expect(db.keys).toStrictEqual(['b']);
  });

  test('has maxAge', async () => {
    instance.set('maxAge', '', { maxAge: 5 });
    await delay(10);
    expect(instance.keys).toStrictEqual([]);
  });

  test('same prefix', () => {
    instance.set('same prefix', '');
    const db = new LightStorage(PREFIX);
    expect(db.keys).toStrictEqual(instance.keys);
  });
});
