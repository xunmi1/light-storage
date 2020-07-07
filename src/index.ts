import { version } from '../package.json';
import { StorageValue } from './interfaces';
import StorageItem from './storage.item';
import List from './list';
import { isObject, isNumber, root } from './utils';
import { StorageValue } from './interfaces';

/**
 * LightStorage
 * @param prefix - 自定义前缀
 * @author xunmi <xunmi1@outlook.com>
 */
class LightStorage {
  static readonly version = version;

  private readonly localStorage: Storage;
  private _keys: List<string>;
  private _prefix: string;

  constructor(prefix = 'light-storage') {
    if (root?.localStorage == null) {
      throw new Error('Current environment does not support localStorage');
    }
    this.localStorage = root.localStorage;
    this._prefix = prefix;
    this.reload();
  }

  get prefix() {
    return this._prefix;
  }

  /**
   * Modify prefix
   * @param value
   */
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

  get size() {
    this.reload();
    return this._keys.size;
  }

  get keys() {
    this.reload();
    const keys: string[] = [];
    const len = this._prefix.length;
    // `-` occupied a character position
    this._keys.forEach(k => keys.push(k.slice(len + 1)));
    return keys;
  }

  private collectKeys() {
    const _keys = Object.keys(this.localStorage).filter(key => key.startsWith(this._prefix));
    this._keys = new List(_keys);
  }

  private isFormSelf<T>(key: string, data: StorageValue<T>) {
    return this._keys.has(key) && data.version !== undefined;
  }

  /**
   * 获取完整数据
   * @param key 键名
   * @returns {Object} 完整数据
   */
  private getCompleteData<T>(key: string): StorageValue<T> {
    key = this.getCompleteKey(key);
    const origin = this.localStorage.getItem(key);
    // if use `localStorage.removeItem`, remove _keys
    if (origin == null) {
      this._keys.delete(key);
      return { value: undefined };
    }

    try {
      this._keys.add(key);
      const data = JSON.parse(origin);
      return isObject(data) ? data : { value: data };
    } catch {
      return { value: (origin as unknown) as T };
    }
  }

  /**
   * 获取实际键名
   * @param key 查询键名
   * @return 实际键名
   */
  private getCompleteKey(key: string) {
    if (key.startsWith(this._prefix)) {
      return key;
    }
    return `${this._prefix}-${key}`;
  }

  private handleExpired<T = any>(key: string) {
    key = this.getCompleteKey(key);
    const data = this.getCompleteData<T>(key);
    if (this.isFormSelf(key, data) && !LightStorage.isValid(data)) {
      this.remove(key);
      return;
    }

    return data;
  }

  private static isValid(data: StorageValue<unknown>) {
    const { time, maxAge } = data;
    if (time && maxAge) {
      const age = Date.now() - time;
      return age >= 0 && age <= maxAge;
    }
    return true;
  }

  reload() {
    this.collectKeys();
    this._keys.forEach(k => this.handleExpired(k));
  }

  select<T>(key: string) {
    return new StorageItem<T>(this, key);
  }

  /**
   * 添加数据
   * @param key 键名，在内部会转换
   * @param value 键值
   * @param options
   * @param [options.maxAge] 有效期
   * @param [options.update=false] 是否更新创建时间
   */
  set<T = any>(key: string, value: T, options?: { maxAge?: number; update?: boolean }) {
    key = this.getCompleteKey(key);
    const data: StorageValue<T> = { value, version: LightStorage.version };
    const { maxAge, update } = options ?? {};
    const now = Date.now();
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
   * 访问数据
   * @param key 键名
   * @param [defaultValue] 默认值
   * @returns 键值，若过期，则自动删除，返回默认值
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const data = this.handleExpired(key);
    return data?.value === undefined ? defaultValue : data.value;
  }

  /**
   * 获取创建时间
   * @param key 键名
   * @returns 创建时间
   */
  getCreatedTime(key: string) {
    return this.handleExpired(key)?.time;
  }

  getMaxAge(key: string) {
    return this.handleExpired(key)?.maxAge;
  }

  /**
   * 判断是否含有该 key
   * @param key - 数据键名
   * @return {boolean}
   */
  has(key: string) {
    key = this.getCompleteKey(key);
    if (this._keys.has(key)) {
      return !!this.handleExpired(key);
    }
    return false;
  }

  /**
   * 移除指定数据
   * @param key - 数据键名
   * @return {boolean}
   */
  remove(key: string) {
    key = this.getCompleteKey(key);
    this.localStorage.removeItem(key);
    return this._keys.delete(key);
  }

  /**
   * 清理全部数据
   */
  clear() {
    this._keys.forEach(key => this.remove(key));
  }
}

export default LightStorage;
