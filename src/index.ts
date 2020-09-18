import { version } from '../package.json';
import { StorageValue, SetOptions, Observer } from './interfaces';
import { isObject, isNumber, startsWith, hasOwn } from './utils';
import LightStorageItem from './storage.item';
import List from './list';
import { Subject } from './subject';

export type { SetOptions, Observer, Subject };

class LightStorage extends Subject {
  static readonly version = version;
  private static readonly Item = LightStorageItem;

  private readonly localStorage: Storage;
  private _keys: List<string>;
  private _prefix: string;
  /** save all timer */
  private readonly timers: { [key: string]: number | undefined };
  /**
   * @param prefix - Custom prefix of Storage
   */
  constructor(prefix = 'light-storage') {
    super();
    this.localStorage = window.localStorage;
    this._prefix = prefix;
    this.timers = Object.create(null);
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
      const origin = this.localStorage.getItem(key);
      this.localStorage.removeItem(key);
      /* istanbul ignore else */
      if (origin != null) this.localStorage.setItem(newKey, origin);
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
    this._keys.forEach(k => keys.push(this.getSimplifyKey(k)));
    return keys;
  }

  private collectKeys() {
    const _keys = Object.keys(this.localStorage).filter(key => startsWith(key, this._prefix));
    this._keys = new List(_keys);
  }

  private static isFormSelf<T>(data: any): data is StorageValue<T> {
    return isObject(data) && hasOwn(data, 'version');
  }

  private getCompleteData<T>(key: string): StorageValue<T> | undefined {
    const origin = this.localStorage.getItem(key);
    // if use `localStorage.removeItem`, remove the key
    if (origin == null) {
      this._keys.delete(key);
      return;
    }

    try {
      const data = JSON.parse(origin);
      return LightStorage.isFormSelf<T>(data) ? data : { value: data };
    } catch {
      return { value: (origin as unknown) as T };
    }
  }

  private getCompleteKey(key: string) {
    if (startsWith(key, this._prefix)) return key;
    return `${this._prefix}-${key}`;
  }

  private getSimplifyKey(key: string) {
    return key.slice(this._prefix.length + 1);
  }

  /** @internal  */
  private handleExpired<T = any>(key: string) {
    key = this.getCompleteKey(key);
    this._keys.add(key);
    const data = this.getCompleteData<T>(key);
    if (!data) return;

    const { time, maxAge } = data;
    // if it has expiration
    if (isNumber(maxAge) && isNumber(time)) {
      const isValid = LightStorage.isValid(time, maxAge);
      // if it within the validity period, start timer
      if (isValid) {
        if (!this.timers[key]) this.startTimer(key, time, maxAge);
      } else {
        // expired
        this.remove(key);
        return;
      }
    }

    return data;
  }

  /**
   * use timer for expiration
   */
  private startTimer(key: string, time: number, maxAge: number) {
    const remaining = time + maxAge - Date.now();
    this.timers[key] = window.setTimeout(() => this.remove(key), remaining);
  }

  private abortTimer(key: string) {
    if (this.timers[key]) {
      window.clearTimeout(this.timers[key]);
      this.timers[key] = undefined;
    }
  }

  private static isValid(time: number, maxAge: number): boolean {
    const age = Date.now() - time;
    return age >= 0 && age <= maxAge;
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
  set<T = any>(key: string, value: T, options?: SetOptions) {
    key = this.getCompleteKey(key);
    const data: StorageValue<T> = { value, version: LightStorage.version };
    const { maxAge, update } = options ?? {};
    const now = Date.now();
    const oldData = this.handleExpired(key);
    data.time = update ? now : oldData?.time ?? now;

    this.abortTimer(key);

    if (maxAge) {
      if (!isNumber(maxAge) || maxAge < 0) {
        throw new TypeError('maxAge is invalid, and must be a non-negative number');
      }
      data.maxAge = maxAge;
      this.startTimer(key, data.time, maxAge);
    }

    this.localStorage.setItem(key, JSON.stringify(data));
    this._keys.add(key);

    // notify `set` handler
    this.notify<T, any>(this.getSimplifyKey(key), value, oldData?.value);
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
    const data = this.getCompleteData(key);
    this.abortTimer(key);
    this.localStorage.removeItem(key);
    this._keys.delete(key);
    this.notify(this.getSimplifyKey(key), undefined, data?.value);
  }

  /**
   * Clear all data with the current prefix
   */
  clear() {
    this.collectKeys();
    this._keys.forEach(key => {
      const data = this.getCompleteData(key);
      this.abortTimer(key);
      this.localStorage.removeItem(key);
      this.notify(this.getSimplifyKey(key), undefined, data?.value);
    });

    this._keys.clear();
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
