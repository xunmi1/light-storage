import EventChannel from '@xunmi/event-channel';
import { Observer } from './interfaces';

export abstract class Subject {
  private readonly event: EventChannel<Observer>;

  protected constructor() {
    this.event = new EventChannel();
  }

  protected notify(key: string, ...rest: Parameters<Observer>) {
    this.event.emit(key, ...rest);
  }

  watch(key: string, observer: Observer) {
    this.event.on(key, observer);
  }

  unwatch(key: string, observer?: Observer) {
    this.event.off(key, observer);
  }
}

export abstract class SubjectItem<T extends Subject> {
  protected abstract instance: T;
  protected abstract key: string;
  protected abstract context: this;

  watch(observer: Observer) {
    this.instance.watch(this.key, observer);
    return this.context;
  }

  unwatch(observer?: Observer) {
    this.instance.unwatch(this.key, observer);
    return this.context;
  }
}
