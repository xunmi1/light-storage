import LightStorage from '../src';

const PREFIX = 'test';
const storage = new LightStorage(PREFIX);

describe('instance watch', () => {
  test('watch a key', done => {
    let count = 0;
    const val = 'value';
    const observer = (value: any) => {
      count++;
      try {
        switch (count) {
          case 1:
            expect(value).toBeUndefined();
            break;
          case 2:
            expect(value).toBe(val);
            setTimeout(() => done(), 100);
            break;
          // if unwatch fail, throw error
          case 3:
            throw new Error();
        }
      } catch (error) {
        done(error);
      }
    }
    storage.watch('key', observer);
    storage.set('key', val);

    storage.unwatch('key', observer);
    storage.set('key', val);
  });
});


describe('instance item watch', () => {
  const storageItem = storage.select('item');

  test('watch a key', done => {
    let count = 0;
    const val = 'val';
    const observer = (value: any) => {
      count++;
      try {
        switch (count) {
          case 1:
            expect(value).toBeUndefined();
            break;
          case 2:
            expect(value).toBe(val);
            setTimeout(() => done(), 100);
            break;
          // if unwatch fail, throw error
          case 3:
            throw new Error();
        }
      } catch (error) {
        done(error);
      }
    }
    storageItem.watch(observer);
    storageItem.setValue(val);

    storageItem.unwatch(observer);
    storageItem.setValue('');
  });
});
