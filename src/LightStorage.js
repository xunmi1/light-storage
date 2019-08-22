/**
 * LightStorage
 * 保证数据类型一致，缓解键名冲突, 具有存储有效期
 * @param {string} prefix - 自定义前缀
 * @author xunmi <xunmi1@outlook.com>
 */
class LightStorage {
  static version;

  #localStorage;
  #keys;
  #prefix;

  constructor (prefix = 'light-storage') {
    try {
      this.#localStorage = (window || self).localStorage;
    } catch {
      throw new TypeError('Current environment does not support localStorage');
    }
    this.prefix = prefix;
  }

  get prefix () {
    return this.#prefix;
  }

  set prefix (value) {
    this.#prefix = value;
    this.#initKeys();
  }

  /**
   * TODO babel-eslint 11.0.0-beta.0 bug
   * @see https://github.com/babel/babel-eslint/issues/749
   */
  #initKeys = () => {
    this.#keys = new Set();
    Object.keys(this.#localStorage).forEach(key => {
      // 或者使用正则从**首位**判断
      if (key.slice(0, this.#prefix.length) === this.#prefix) {
        this.#keys.add(key);
      }
    });
  };

  /**
   * 获取完整数据
   * @param {string} key 键名
   * @returns {Object} 完整数据
   */
  #getFullData = key => {
    key = this.getFullKey(key);
    if (this.#keys.has(key)) {
      const origin = this.#localStorage.getItem(key);
      try {
        const value = JSON.parse(origin);
        return typeof value === 'object' ? value : { value };
      } catch {
        return { value: origin };
      }
    }
  };

  /**
   * 获取实际键名
   * @param {string} key 查询键名
   * @return {string} 实际键名
   */
  getFullKey (key) {
    if (key.slice(0, this.#prefix.length) === this.#prefix) {
      return key;
    }
    return `${this.#prefix}-${key}`;
  }

  /**
   * 添加数据
   * @param {string} key 键名，在内部会转换
   * @param {any} value 键值
   * @param {number} [timeLimit] 有效期
   * @param {boolean} [update=false] 是否更新创建时间
   */
  set (key, value, timeLimit, update = false) {
    key = this.getFullKey(key);
    const data = { value, version: LightStorage.version };
    if (timeLimit) {
      if (typeof timeLimit !== 'number' || timeLimit < 0) {
        throw new TypeError('Please enter a valid time limit');
      }
      data.time = update ? Date.now() : (this.getCreatedTime(key) || Date.now());
      data.timeLimit = timeLimit;
    }
    this.#localStorage.setItem(key, JSON.stringify(data));
    this.#keys.add(key);
  }

  /**
   * 访问数据
   * @param {string} key 键名
   * @param {any} [defaultValue] 默认值
   * @returns {any} 键值，若过期，则自动删除，返回默认值
   */
  get (key, defaultValue) {
    const data = this.#getFullData(key);
    if (data && data.value !== undefined) {
      if (!data.time) return data.value;
      const valid = (Date.now() - data.time) < data.timeLimit;
      if (valid) return data.value;
      this.remove(key);
      return defaultValue;
    }
    return defaultValue;
  }

  /**
   * 获取创建时间
   * @param {string} key 键名
   * @returns {number|undefined} 创建时间
   */
  getCreatedTime (key) {
    const data = this.#getFullData(key);
    if (data && data.time) {
      return data.time;
    }
  }

  /**
   * 判断是否含有该 key
   * @param {string} key - 数据键名
   * @return {boolean}
   */
  has (key) {
    key = this.getFullKey(key);
    if (!this.#keys.has(key)) return false;
    const result = this.get(key);
    return result !== undefined;
  }

  /**
   * 移除指定数据
   * @param {string} key - 数据键名
   * @return {boolean}
   */
  remove (key) {
    key = this.getFullKey(key);
    if (this.#keys.has(key)) {
      this.#localStorage.removeItem(key);
      return this.#keys.delete(key);
    }
    return false;
  }

  /**
   * 清理全部数据
   */
  clear () {
    this.#keys.forEach(key => this.remove(key));
  }
}

export default LightStorage;
