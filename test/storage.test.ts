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

describe('get data', () => {
  const key = 'origin value';
  const fullKey = `light-storage-${key}`;
  const origin = JSON.stringify({ value: true });
  window.localStorage.setItem(key, origin);
  window.localStorage.setItem(fullKey, origin);
  const db = new LightStorage();

  test('get origin value', () => {
    expect(db.get(key)).toBe(true);
    expect(db.get(fullKey)).toBe(true);
  });

  test('get default value', () => {
    const key = 'get data';
    const defaultValue = { value: true, label: '获取默认值' };
    expect(db.get(key, defaultValue)).toEqual(defaultValue);
  });

  test('use native removeItem', () => {
    window.localStorage.removeItem(fullKey);
    expect(db.get(key)).toBeUndefined();
  })

  test('get unsafe data', () => {
    const unsafeData = '[{];<>';
    window.localStorage.setItem(fullKey, unsafeData);
    expect(db.get(key)).toBe(unsafeData);
  })

  test('get number-like', () => {
    const numberLike = '123456';
    window.localStorage.setItem(fullKey, numberLike);
    expect(db.get(key)).toBe(Number(numberLike));
  })

});

/**
 * use same instance
 */
const PREFIX = 'test';
const instance = new LightStorage(PREFIX);

afterEach(() => instance.clear());

describe('has value', () => {
  const key = 'undefined';
  expect(instance.has(key)).toBe(false);
  instance.set(key, key);
  expect(instance.has(key)).toBe(true);
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

  test('update maxAge', async () => {
    const key = 'maxAge';
    instance.set(key, mockData, 20);
    instance.set(key, mockData, 10);
    await delay(15);
    expect(instance.get(key)).toBeUndefined();
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

});

describe('cleanup', () => {
  instance.clear();
  const keys = Object.keys(window.localStorage).filter(k => k.startsWith(PREFIX))
  expect(keys.length).toBe(0);
})

describe('verify size', () => {
  beforeAll(() => {
    instance.clear();
    instance.set('verify size', '');
  })

  test('size is one', () => {
    expect(instance.size).toBe(1);
  });

  test('use native removeItem', () => {
    window.localStorage.removeItem('verify size');
    expect(instance.size).toBe(0);
  });

  test('size of new instance', () => {
    const db = new LightStorage('new-instance-size');
    expect(db.size).toBe(0);
  })
})
