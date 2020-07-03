import { version } from '../package.json';

interface LightStorageValue<T> {
  value: T;
  version: string;
  maxAge?: number;
  time?: number;
}

interface OriginValue<T> {
  value?: T | string;
}

/**
 * LightStorage
 * @param prefix - 自定义前缀
 * @author xunmi <xunmi1@outlook.com>
 */
class LightStorage {
  static readonly version = version;

  private readonly localStorage: Storage;
  private keys: Set<string>;
  private _prefix: string;

  constructor(prefix = 'light-storage') {
    try {
      this.localStorage = (window || self).localStorage;
    } catch {
      throw new TypeError('Current environment does not support localStorage');
    }
    this.prefix = prefix;
  }

  get prefix() {
    return this._prefix;
  }

  set prefix(value: string) {
    this._prefix = value;
    this.initKeys();
  }

  private initKeys() {
    this.keys = new Set();
    Object.keys(this.localStorage).forEach(key => {
      if (key.startsWith(this._prefix)) {
        this.keys.add(key);
      }
    });
  }

  private isFormSelf<T>(key: string, data: LightStorageValue<T> | OriginValue<T>): data is LightStorageValue<T> {
    return this.has(key) && (data as LightStorageValue<T>).version !== undefined;
  }

  /**
   * 获取完整数据
   * @param key 键名
   * @returns {Object} 完整数据
   */
  private getCompleteData<T>(key: string): LightStorageValue<T> | OriginValue<T> {
    key = this.getCompleteKey(key);
    if (this.keys.has(key)) {
      const origin = this.localStorage.getItem(key);
      if (origin == null) return { value: undefined };

      try {
        const data = JSON.parse(origin);
        return typeof data === 'object' ? data : { value: data };
      } catch {
        return { value: origin };
      }
    }
    return { value: undefined };
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

  /**
   * 添加数据
   * @param key 键名，在内部会转换
   * @param value 键值
   * @param [maxAge] 有效期
   * @param [update=false] 是否更新创建时间
   */
  set<T>(key: string, value: T, maxAge?: number, update = false) {
    key = this.getCompleteKey(key);
    const data: LightStorageValue<T> = { value, version: LightStorage.version };
    if (maxAge) {
      if (typeof maxAge !== 'number' || maxAge <= 0) {
        throw new TypeError('Please enter a valid time limit');
      }
      const now = Date.now();
      data.time = update ? now : this.getCreatedTime(key) ?? now;
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
  get<T>(key: string, defaultValue?: T) {
    const data = this.getCompleteData<T>(key);

    if (this.isFormSelf(key, data) && data.maxAge && data.time) {
      const isExpires = Date.now() - data.time > data.maxAge;
      if (isExpires) {
        this.remove(key);
        return defaultValue;
      }
    }

    return data.value === undefined ? defaultValue : data.value;
  }

  /**
   * 获取创建时间
   * @param key 键名
   * @returns 创建时间
   */
  getCreatedTime(key: string) {
    const data = this.getCompleteData(key);
    if (this.isFormSelf(key, data)) return data.time;
  }

  /**
   * 判断是否含有该 key
   * @param key - 数据键名
   * @return {boolean}
   */
  has(key: string) {
    key = this.getCompleteKey(key);
    return this.keys.has(key);
  }

  /**
   * 移除指定数据
   * @param key - 数据键名
   * @return {boolean}
   */
  remove(key: string) {
    key = this.getCompleteKey(key);
    if (this.keys.has(key)) {
      this.localStorage.removeItem(key);
      return this.keys.delete(key);
    }
    return false;
  }

  /**
   * 清理全部数据
   */
  clear() {
    this.keys.forEach(key => this.remove(key));
  }
}

export default LightStorage;
