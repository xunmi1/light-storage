import { StorageValue } from './interfaces';
import LightStorage from './index';

class StorageItem<T> {
  private readonly context: StorageItem<T>;
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

  get time() {
    return this.data.time;
  }

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

  update() {
    this.storage.set(this.key, this.value, { maxAge: this.maxAge, update: true });
    this.data.time = this.storage.getCreatedTime(this.key);
    return this.context;
  }
}

export default StorageItem;
