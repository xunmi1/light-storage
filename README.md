# light-storage

[![ci](https://img.shields.io/github/workflow/status/xunmi1/light-storage/CI?style=flat-square&logo=github)](https://github.com/xunmi1/light-storage/actions?query=workflow%3ACI)
[![codecov](https://img.shields.io/codecov/c/github/xunmi1/light-storage?style=flat-square&logo=codecov)](https://codecov.io/gh/xunmi1/light-storage)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/light-storage?style=flat-square)](https://www.npmjs.com/package/light-storage)
[![npm version](https://img.shields.io/npm/v/light-storage?&style=flat-square&logo=npm)](https://www.npmjs.com/package/light-storage)

A lightweight tool for handing localStorage.

- Serialization and deserialization
- Using prefix to avoid key collisions
- Support expiration
- Support call chaining
- Observer Pattern
- 100% test coverage

### Install

- NPM

  ```bash
  npm install --save light-storage
  # or
  yarn add light-storage
  ```

  ```js
  import LightStorage from 'light-storage';
  ```

- CDN

  ```html
  <script src="https://cdn.jsdelivr.net/npm/light-storage@1/dist/light-storage.umd.min.js"></script>
  ```

### Basic Usage

- Get instance

  ```js
  // generate an instance with prefix
  const storage = new LightStorage('PREFIX');
  ```

- Set data

  - Set the value with the given key, creating a new value if none existed.

    ```js
    storage.set('key', 'example');
    ```

  - Set the value that expires 2 minutes from now.

    ```js
    storage.set('key', 'example', { maxAge: 2 * 60 * 1000 });
    ```

    If you need to time again, set `update` to `true`.

    ```js
    storage.set('key', 'example', { maxAge: 2 * 60 * 1000, update: true });
    ```

  - Using call chaining.

    ```js
    storage
      .select('key')
      .setValue('example')
      .setMaxAge(2 * 60 * 1000);

    // if need to update creation time
    storage.select('key').update();
    ```

- Get data

  > **Note**: return `undefined` if none existed

  - Get the current value associated with the given key.

    ```js
    storage.get('key');
    ```

  - Using call chaining.

    ```js
    storage.select('key').value;
    ```

- Delete data

  - Remove the data with the given key.

    ```js
    storage.remove('key');
    ```

  - Using call chaining.

    ```js
    storage.select('key').remove();
    ```

  - Clear all.

    ```js
    storage.clear();
    ```

- Watch

  > **Note**: since v1.1.0, based on [`@xunmi/event-channel`](https://github.com/xunmi1/event-channel).
  >
  > **Warning**: can't watch if you use native operations (e.g. localStorage.setItem).

  - Watch the change of a value associated with the given key.

    ```js
    const observer = (value, oldValue) => {
      // do something
    };

    storage.watch('key', observer);
    ```

  - Unwatch that stops firing the observer.

    ```js
    storage.unwatch('key', observer);
    ```

  - Using call chaining.

    ```js
    // watch
    storage.select('key').watch(observer);

    // unwatch
    storage.select('key').unwatch(observer);
    ```

### Other Usage

- Get all keys.

  ```js
  storage.keys;
  ```

- Set a new prefix to replace the original prefix.

  ```js
  storage.prefix = 'NEW_PREFIX';
  ```

- Get other metadata associated with the given key.

  ```js
  // return the created time
  storage.getCreatedTime('key');
  // return the `maxAge`
  storage.getMaxAge('key');
  // whether it contains the key
  storage.has('key');
  ```

- Synchronize data in the localStorage, and check validity.

  > **Note**: If you use localstorage directly and things don't work as expected, you may need to use this function.

  ```js
  storage.reload();
  ```
