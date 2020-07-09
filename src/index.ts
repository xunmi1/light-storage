import { version } from '../package.json';
import { StorageValue, setOptions } from './interfaces';
import LightStorageItem from './storage.item';
import List from './list';
import { isObject, isNumber, startsWith } from './utils';

/**
 * LightStorage
 * @public
 */
class LightStorage {
  static readonly version = version;
  static readonly Item = LightStorageItem;

  private readonly localStorage: Storage;
  private _keys: List<string>;
  private _prefix: string;

  /**
   * @param prefix - Custom prefix of Storage
   */
  constructor(prefix = 'light-storage') {
    this.localStorage = window.localStorage;
    this._prefix = prefix;
    this.reload();
  }

  /**
   * Get or set the current prefix
   */
  get prefix() {
    return this._prefix;
  }

  set prefix(value: string) {
    this.reload();
    const len = this._prefix.length;

    this._keys.forEach(key => {
      const newKey = String(value) + key.slice(len);
      const StorageValue = this.localStorage.getItem(key);
      this.localStorage.removeItem(key);
      /* istanbul ignore else */
      if (StorageValue != null) this.localStorage.setItem(newKey, StorageValue);
    });

    this._prefix = value;
    this.collectKeys();
  }

  /**
   * Get all keys currently present
   */
  get keys() {
    this.reload();
    const keys: string[] = [];
    const len = this._prefix.length;
    // `-` occupied a character position
    this._keys.forEach(k => keys.push(k.slice(len + 1)));
    return keys;
  }

  private collectKeys() {
    const _keys = Object.keys(this.localStorage).filter(key => startsWith(key, this._prefix));
    this._keys = new List(_keys);
  }

  private isFormSelf<T>(key: string, data: StorageValue<T>) {
    return this._keys.has(key) && data.version !== undefined;
  }

  private getCompleteData<T>(key: string): StorageValue<T> | undefined {
    key = this.getCompleteKey(key);
    const origin = this.localStorage.getItem(key);
    // if use `localStorage.removeItem`, remove _keys
    if (origin == null) {
      this._keys.delete(key);
      return;
    }

    try {
      this._keys.add(key);
      const data = JSON.parse(origin);
      return isObject(data) ? data : { value: data };
    } catch {
      return { value: (origin as unknown) as T };
    }
  }

  private getCompleteKey(key: string) {
    if (startsWith(key, this._prefix)) return key;
    return `${this._prefix}-${key}`;
  }

  /** @internal  */
  private handleExpired<T = any>(key: string) {
    const data = this.getCompleteData<T>(key);
    if (data && this.isValid(key, data)) return data;

    this.remove(key);
    return;
  }

  private isValid(key: string, data: StorageValue<unknown>) {
    key = this.getCompleteKey(key);
    if (!this.isFormSelf(key, data)) return true;
    const { time, maxAge } = data;
    if (time && maxAge) {
      const age = Date.now() - time;
      return age >= 0 && age <= maxAge;
    }
    return true;
  }

  /**
   * Synchronize data in the localStorage, and check validity
   * @remarks use for localStorage is used directly, and it does not meet expectations
   */
  reload() {
    this.collectKeys();
    this._keys.forEach(k => this.handleExpired(k));
  }

  /**
   * Set the value with the given key, creating a new value if none existed
   * Note: calling will reset the original storage
   * @param key - Key name
   * @param value - Data to be stored
   * @param options - Options
   */
  set<T = any>(key: string, value: T, options?: setOptions) {
    const now = Date.now();
    key = this.getCompleteKey(key);
    const data: StorageValue<T> = { value, version: LightStorage.version };
    const { maxAge, update } = options ?? {};
    data.time = update ? now : this.getCreatedTime(key) ?? now;

    if (maxAge) {
      if (!isNumber(maxAge) || maxAge < 0) {
        throw new TypeError('maxAge is invalid, and must be a non-negative number');
      }
      data.maxAge = maxAge;
    }
    this.localStorage.setItem(key, JSON.stringify(data));
    this._keys.add(key);
  }

  /**
   * Return the current value associated with the given key, or undefined if the given key does not exist.
   * @param key - Key name
   * @param defaultValue - Return the default value if the given key does not exist
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const data = this.handleExpired(key);
    return data?.value === undefined ? defaultValue : data.value;
  }

  /**
   * Return the created time associated with the given key
   */
  getCreatedTime(key: string) {
    return this.handleExpired(key)?.time;
  }

  /**
   * Return the `maxAge` associated with the given key
   */
  getMaxAge(key: string) {
    return this.handleExpired(key)?.maxAge;
  }

  /**
   * Whether it contains the key
   */
  has(key: string) {
    key = this.getCompleteKey(key);
    if (this._keys.has(key)) {
      return !!this.handleExpired(key);
    }
    return false;
  }

  /**
   * Remove the data with the given key
   */
  remove(key: string) {
    key = this.getCompleteKey(key);
    this.localStorage.removeItem(key);
    this._keys.delete(key);
  }

  /**
   * Clear all data with the current prefix
   */
  clear() {
    this._keys.forEach(key => this.remove(key));
  }

  /**
   * Generate an instance with the given key
   * @param key - the given key
   */
  select<T>(key: string) {
    return new LightStorage.Item<T>(this, key);
  }
}

export default LightStorage;
