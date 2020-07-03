import LightStorage from '../src';

const delay = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

describe('create', () => {
  const prefix = 'mock-test';
  const storage = new LightStorage(prefix);

  test('created instance', () => {
    expect(storage).toStrictEqual(expect.any(LightStorage));
    expect(storage.prefix).toBe(prefix);
  });

  test('change prefix', () => {
    const newPrefix = 'mock-test-new';
    storage.prefix = newPrefix;
    expect(storage.prefix).toBe(newPrefix);
  });
});

const instance = new LightStorage('test');

afterEach(() => instance.clear());

describe('get data', () => {
  test('get default value', () => {
    const key = 'get data';
    const defaultValue = { value: true, label: '获取默认值' };
    expect(instance.get(key, defaultValue)).toEqual(defaultValue);
  });

  test('get origin value', () => {
    const key = 'origin value';
    const fullKey = `light-storage-${key}`;
    const origin = JSON.stringify({ value: true });
    window.localStorage.setItem(key, origin);
    window.localStorage.setItem(fullKey, origin);
    const db = new LightStorage();
    expect(db.get(key)).toBe(true);
    expect(db.get(fullKey)).toBe(true);
    window.localStorage.setItem(fullKey, '100');
    expect(db.get(key)).toBe(100);
    db.clear();
  });

  test('has value', () => {
    const key = 'undefined';
    expect(instance.has(key)).toBe(false);
    instance.set(key, key);
    expect(instance.has(key)).toBe(true);
  });
});


describe('check data', () => {
  test('set data', () => {
    const mockData = 'light-storage';
    instance.set('mock', mockData);
    expect(instance.get('mock')).toBe(mockData);
  });

  test('data type', () => {
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
      return { ...obj, [key]: instance.get(key) }
    }, {});
    expect(copyData).toStrictEqual(mockData);
  });
});


describe('check validity period', () => {
  const mockData = 'light-storage';

  test('base time', async () => {
    const key = 'base';
    instance.set(key, mockData, 10);
    expect(instance.get(key)).toBe(mockData);
    await delay(11);
    expect(instance.get(key)).toBeUndefined();
  });

  test('update time limit', async () => {
    const key = 'timeLimit';
    instance.set(key, mockData, 10);
    await delay(5);
    instance.set(key, mockData, 10);
    expect(instance.get(key)).toBe(mockData);
  });

  test('update created time', async () => {
    const key = 'createdTime';
    instance.set(key, mockData, 50);
    await delay(10);
    instance.set(key, mockData, 50, true);
    await delay(20);
    expect(instance.get(key)).toBe(mockData);
    await delay(40);
    expect(instance.get(key)).toBeUndefined();
  });

  test('error time', () => {
    const trigger = () => instance.set('mock', mockData, -50);
    expect(trigger).toThrowError(TypeError);
  });
});


describe('remove one', () => {
  test('remove one', () => {
    instance.set('mock', true, 50);
    instance.set('mock-copy', true);
    expect(instance.remove('mock')).toBe(true);
    expect(instance.get('mock')).toBeUndefined();
    expect(instance.get('mock-copy')).toBeTruthy();
  });

  test('remove undefined key', () => {
    expect(instance.remove('undefined-mock')).toBe(false);
  });

  test('clear all', () => {
    instance.set('clear-mock', true, 50);
    instance.set('clear-mock-copy', true);
    instance.clear();
    expect(instance.get('clear-mock')).toBeUndefined();
    expect(instance.get('clear-mock-copy')).toBeUndefined();
  });
});
