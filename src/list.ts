interface List<T> {
  add(value: T): void;
  delete(value: T): boolean;
  forEach(func: (value: T) => void): void;
  has(value: T): boolean;
  readonly size: number;
}

class CustomSet<T> implements List<T> {
  private data: T[];
  constructor(list: T[] = []) {
    this.data = [...list];
  }

  get size() {
    return this.data.length;
  }

  add(value: T) {
    if (this.has(value)) return;
    this.data.push(value);
  }

  delete(value: T) {
    const index = this.data.indexOf(value);
    if (index < 0) return false;
    this.data.splice(index, 1);
    return true;
  }

  has(value: T) {
    return this.data.indexOf(value) > -1;
  }

  forEach(func: (value: T) => void) {
    this.data.forEach(value => func.call(this, value));
  }
}

const List = window.Set ?? CustomSet;
export default List;
