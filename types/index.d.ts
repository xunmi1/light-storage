// Type definitions for LightStorage
// Definitions by: xunmi <https://github.com/xunmi1>

/**
 * LightStorage
 * @param {string} prefix
 * @author xunmi <xunmi1@outlook.com>
 */
declare class LightStorage {
  static readonly version: string;
  private localStorage: Storage;
  private keys: Set<string>;
  public prefix: string;

  public constructor (prefix: string | number);

  /**
   * get data
   * @param {string} key
   * @param {any} [defaultValue]
   * @returns {any} return defaultValue if expired or undefined
   */
  public get(key: string, defaultValue?: any): any;

  /**
   * add data
   * @param {string} key
   * @param {any} value
   * @param {number} [timeLimit] Validity period 有效期
   * @param {boolean} [update=false] update the creation time 是否更新创建时间
   */
  public set(key: string, value: any, timeLimit?: number, update?: boolean):void;

  public has(key: string): boolean;

  /**
   * remove that key data from the storage,
   */
  public remove(key: string): boolean;

  /**
   * clear all data,
   */
  public clear (): void;

  public getCreatedTime(key: string): number | undefined;

  /**
   * get real key from the storage
   * @param {string} key
   */
  public getFullKey(key: string): string
}

export = LightStorage;

// If this module is a UMD module
export as namespace LightStorage;
