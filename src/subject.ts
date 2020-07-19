import EventChannel from '@xunmi/event-channel';
import { Observer } from './interfaces';

export abstract class Subject {
  private readonly event: EventChannel<Observer<any, any>>;

  protected constructor() {
    this.event = new EventChannel();
  }

  protected notify<T extends any, U = T>(key: string, ...rest: Parameters<Observer<T, U>>) {
    if (rest[0] !== rest[1]) this.event.emit(key, ...rest);
  }

  /**
   * Watch the change of a value associated with the given key
   * @param key
   * @param observer
   * @since v1.1.0
   */
  watch<T extends any, U = T>(key: string, observer: Observer<T, U>) {
    this.event.on(key, observer);
  }

  /**
   * Unwatch that stops firing the observer.
   * @param key
   * @param observer
   * @since v1.1.0
   */
  unwatch<T extends any, U = T>(key: string, observer?: Observer<T, U>) {
    this.event.off(key, observer);
  }
}

export abstract class SubjectItem<T extends Subject> {
  protected abstract instance: T;
  protected abstract key: string;
  protected abstract context: this;

  /**
   * Watch the change of a value
   * @param observer
   * @since v1.1.0
   */
  watch<T extends any, U = T>(observer: Observer<T, U>) {
    this.instance.watch(this.key, observer);
    return this.context;
  }

  /**
   * Unwatch that stops firing the observer.
   * @param observer
   * @since v1.1.0
   */
  unwatch<T extends any, U = T>(observer?: Observer<T, U>) {
    this.instance.unwatch(this.key, observer);
    return this.context;
  }
}
