import LightStorage from '../src';
import { toBeWithinRange } from './utils';

expect.extend({ toBeWithinRange });

const PREFIX = 'TEST';
const storage = new LightStorage(PREFIX);

describe('instance watch', () => {
  test('watch a key', done => {
    let count = 0;
    const [key, originData, newData] = ['key', 'origin', 'new'];
    window.localStorage.setItem(`${PREFIX}-${key}`, JSON.stringify({ value: originData, version: '*' }));

    const observer = (val: string, oldVal: any) => {
      count++;
      switch (count) {
        case 1:
          expect(val).toBe(newData);
          expect(oldVal).toBe(originData);
          setTimeout(() => done(), 100);
          break;
        // if unwatch fail, throw error
        case 2:
          done(new Error());
          break;
      }
    };
    storage.watch<string>(key, observer);
    storage.set(key, newData);

    storage.unwatch(key, observer);
    storage.set(key, '');
  });

  test('watch with expiration', done => {
    let count = 0;
    let time: number = 0;
    const [key, data, maxAge] = ['watch-expiration', 'expiration', 20];
    const observer = (val: any, oldVal: any) => {
      count++;
      switch (count) {
        case 1:
          time = Date.now();

          expect(val).toBe(data);
          expect(oldVal).toBeUndefined();
          break;
        // when expired
        case 2:
          expect(val).toBeUndefined();
          expect(oldVal).toBe(data);
          // test interval
          expect(Date.now() - time).toBeWithinRange(maxAge - 3, maxAge + 3);
          done();
      }
    };
    storage.watch(key, observer);
    storage.set(key, data, { maxAge });
  });
});

describe('instance item watch', () => {
  const storageItem = storage.select('item');

  test('watch a key', done => {
    let count = 0;
    const data = 'data';
    const observer = (val: any, oldVal: any) => {
      count++;
      switch (count) {
        case 1:
          expect(val).toBe(data);
          expect(oldVal).toBeUndefined();
          setTimeout(() => done(), 100);
          break;
        // if unwatch fail, throw error
        case 2:
          done(new Error());
          break;
      }
    };
    storageItem.watch(observer);
    storageItem.setValue(data);

    storageItem.unwatch(observer);
    storageItem.setValue('');
  });
});
