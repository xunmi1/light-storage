import LightStorage from '../src';

const storage = new LightStorage('test');

describe('instance watch', () => {
  test('watch a key', done => {
    let count = 0;
    const val = 'value';
    const observer = (value: any) => {
      count++;
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
          done(new Error());
          break;
      }
    }
    storage.watch('key', observer);
    storage.set('key', val);

    storage.unwatch('key', observer);
    storage.set('key', val);
  });

  test('watch with expiration', done => {
    let count = 0;
    let time: number = 0;
    const val = 'expiration';
    const key = 'watch-expiration';
    const maxAge = 20;
    const observer = (value: any) => {
      count++;
      switch (count) {
        case 2:
          time = Date.now();
          expect(value).toBe(val);
          break;
        case 3:
          expect(value).toBeUndefined();
          expect(Date.now() - time).toBeGreaterThanOrEqual(maxAge);
          done();
      }
    }
    storage.watch(key, observer);
    storage.set(key, val, { maxAge });
  })
});


describe('instance item watch', () => {
  const storageItem = storage.select('item');

  test('watch a key', done => {
    let count = 0;
    const val = 'val';
    const observer = (value: any) => {
      count++;
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
          done(new Error());
          break;
      }
    }
    storageItem.watch(observer);
    storageItem.setValue(val);

    storageItem.unwatch(observer);
    storageItem.setValue('');
  });
});
