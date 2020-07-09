import { StorageValue } from './interfaces';
import LightStorage from './index';

class LightStorageItem<T> {
  private readonly context: LightStorageItem<T>;
  private data: StorageValue<T>;

  constructor(private readonly storage: LightStorage, private readonly key: string) {
    this.context = this;
    //@ts-ignore
    this.data = this.storage.handleExpired<T>(this.key) ?? {};
  }

  get value() {
    return this.data.value;
  }

  get maxAge() {
    return this.data.maxAge;
  }

  /**
   * Return the created time
   */
  get time() {
    return this.data.time;
  }

  /**
   * Set the value with the given key
   * Note: Will keep if original storage has maxAge
   * @param value
   */
  setValue(value: T) {
    this.storage.set(this.key, value, { maxAge: this.maxAge, update: false });
    this.data.value = value;
    return this.context;
  }

  setMaxAge(maxAge: number) {
    this.storage.set(this.key, this.value, { maxAge, update: false });
    this.data.maxAge = maxAge;
    return this.context;
  }

  /**
   * Update creation time
   */
  update() {
    this.storage.set(this.key, this.value, { maxAge: this.maxAge, update: true });
    this.data.time = this.storage.getCreatedTime(this.key);
    return this.context;
  }

  /**
   * Remove oneself
   */
  remove() {
    this.storage.remove(this.key);
    this.data = {};
    return this.context;
  }
}

export default LightStorageItem;
