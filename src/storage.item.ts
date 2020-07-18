import { StorageValue } from './interfaces';
import { SubjectItem } from './subject';
import type LightStorage from './index';

class LightStorageItem<T> extends SubjectItem<LightStorage> {
  protected readonly context: this;
  private data: StorageValue<T>;

  constructor(protected readonly instance: LightStorage, protected readonly key: string) {
    super();
    this.context = this;
    // @ts-ignore
    this.data = this.instance.handleExpired<T>(this.key) ?? {};
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
    this.instance.set(this.key, value, { maxAge: this.maxAge, update: false });
    this.data.value = value;
    return this.context;
  }

  setMaxAge(maxAge: number) {
    this.instance.set(this.key, this.value, { maxAge, update: false });
    this.data.maxAge = maxAge;
    return this.context;
  }

  /**
   * Update creation time
   */
  update() {
    this.instance.set(this.key, this.value, { maxAge: this.maxAge, update: true });
    this.data.time = this.instance.getCreatedTime(this.key);
    return this.context;
  }

  /**
   * Remove oneself
   */
  remove() {
    this.instance.remove(this.key);
    this.data = {};
    return this.context;
  }
}

export default LightStorageItem;
