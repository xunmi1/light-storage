import LightStorage from '../src';
import { delay } from './utils';

const PREFIX = 'TEST_SUBJECT';
const storage = new LightStorage(PREFIX);
const setItem = (key: string, value: any) =>
  window.localStorage.setItem(`${PREFIX}-${key}`, JSON.stringify({ value, version: '*' }));

describe('instance watch', () => {
  test('watch a key', () => {
    const observer = jest.fn();
    const [key, originData, newData] = ['key', 'origin', 'new'];
    setItem(key, originData);

    storage.watch<string>(key, observer);
    storage.set(key, newData);

    storage.unwatch(key, observer);
    storage.set(key, '');

    expect(observer.mock.calls.length).toBe(1);
    expect(observer.mock.calls[0]).toEqual([newData, originData]);
  });

  test('watch with expiration', async () => {
    const observer = jest.fn();
    const [key, data, maxAge] = ['watch-expiration', 'data', 15];
    storage.watch(key, observer);
    storage.set(key, data, { maxAge });

    await delay(30);
    
    expect(observer.mock.calls.length).toBe(2);
    expect(observer.mock.calls[0]).toEqual([data, undefined]);
    expect(observer.mock.calls[1]).toEqual([undefined, data]);

    storage.unwatch(key);
  });
});

describe('instance item watch', () => {
  const storageItem = storage.select('item');

  test('watch a key', () => {
    const observer = jest.fn();
    const data = 'data';
    storageItem.watch(observer);
    storageItem.setValue(data);

    storageItem.unwatch(observer);
    storageItem.setValue('');

    expect(observer.mock.calls.length).toBe(1);
    expect(observer.mock.calls[0]).toEqual([data, undefined]);
  });
});
