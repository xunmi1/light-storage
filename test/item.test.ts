import LightStorage from '../src';
import StorageItem from '../src/storage.item';

const PREFIX = 'TEST_ITEM';
const instance = new LightStorage(PREFIX);
const getItem = (key: string) => {
  const data = window.localStorage.getItem(`${PREFIX}-${key}`);
  return data ? JSON.parse(data as string) : { value: undefined };
};

describe('use select', () => {
  test('created instance of `StorageItem`', () => {
    expect(instance.select('a')).toStrictEqual(expect.any(StorageItem));
  });
});

describe('check all getters', () => {
  const key = 'getter';
  const value = 'value';
  const maxAge = 10;
  instance.set(key, value, { maxAge });
  const storageItem = instance.select(key);

  test('get value', () => {
    expect(storageItem.value).toBe(value);
  });

  test('get maxAge', () => {
    expect(storageItem.maxAge).toBe(maxAge);
  });

  test('get time', () => {
    expect(storageItem.time).toBe(getItem(key).time);
  });
});

describe('check all setters', () => {
  const key = 'setters';
  const storageItem = instance.select(key);

  test('set value', () => {
    storageItem.setValue('');
    expect(storageItem.value).toBe('');
  });

  test('set maxAge', () => {
    storageItem.setMaxAge(10);
    expect(storageItem.maxAge).toBe(10);
  });

  test('update', () => {
    storageItem.update();
    expect(storageItem.time).toBe(getItem(key).time);
  });

  test('remove', () => {
    storageItem.remove();
    expect(storageItem.value).toBeUndefined();
    expect(getItem(key).value).toBeUndefined();
  });

  test('chain call', () => {
    const handler = () => storageItem.setValue('').setMaxAge(2).update().setValue(1);
    expect(handler).not.toThrowError(Error);
    expect(storageItem.value).toBe(getItem(key).value);
  });

  test('set value and not clear maxAge', () => {
    storageItem.setMaxAge(100).setValue('');
    expect(storageItem.maxAge).toBe(100);
  });
});
