import { version } from '../package.json';
import List from './list';
import { isObject, isNumber, root } from './utils';

interface LightStorageValue<T> {
  value: T;
  version: string;
  maxAge?: number;
  time?: number;
}

interface OriginValue<T> {
  value?: T;
}

/**
 * LightStorage
 * @param prefix - 自定义前缀
 * @author xunmi <xunmi1@outlook.com>
 */
class LightStorage {
  static readonly version = version;

  private readonly localStorage: Storage;
  private keys: List<string>;
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

    this.keys.forEach(key => {
      const newKey = String(value) + key.slice(len);
      const originValue = this.localStorage.getItem(key);
      this.localStorage.removeItem(key);
      /* istanbul ignore else */
      if (originValue != null) this.localStorage.setItem(newKey, originValue);
    });

    this._prefix = value;
    this.collectKeys();
  }

  get size() {
    this.reload();
    return this.keys.size;
  }

  private collectKeys() {
    const keys = Object.keys(this.localStorage).filter(key => key.startsWith(this._prefix));
    this.keys = new List(keys);
  }

  private isFormSelf<T>(key: string, data: LightStorageValue<T> | OriginValue<T>): data is LightStorageValue<T> {
    return this.keys.has(key) && (data as LightStorageValue<T>).version !== undefined;
  }

  /**
   * 获取完整数据
   * @param key 键名
   * @returns {Object} 完整数据
   */
  private getCompleteData<T>(key: string): LightStorageValue<T> | OriginValue<T> {
    key = this.getCompleteKey(key);
    const origin = this.localStorage.getItem(key);
    // if use `localStorage.removeItem`, remove keys
    if (origin == null) {
      this.keys.delete(key);
      return { value: undefined };
    }

    try {
      this.keys.add(key);
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

  private static isValid(data: LightStorageValue<unknown>) {
    const { time, maxAge } = data;
    if (time && maxAge) {
      const age = Date.now() - time;
      return age >= 0 && age <= maxAge;
    }
    return true;
  }

  /**
   * 刷新
   */
  reload() {
    this.collectKeys();
    this.keys.forEach(k => this.handleExpired(k));
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
    const data: LightStorageValue<T> = { value, version: LightStorage.version };
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
    this.keys.add(key);
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
    const data = this.handleExpired(key);
    if (data && this.isFormSelf(key, data)) return data.time;
  }

  /**
   * 判断是否含有该 key
   * @param key - 数据键名
   * @return {boolean}
   */
  has(key: string) {
    key = this.getCompleteKey(key);
    if (this.keys.has(key)) {
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
    return this.keys.delete(key);
  }

  /**
   * 清理全部数据
   */
  clear() {
    this.keys.forEach(key => this.remove(key));
  }
}

export default LightStorage;
