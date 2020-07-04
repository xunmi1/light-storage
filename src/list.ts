class List<T = string> {
  private data: T[];
  /* istanbul ignore next */
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
    return this.data.includes(value);
  }

  forEach(func: (value: T, index: number) => void) {
    this.data.forEach((value, index) => func.call(this, value, index));
  }
}

export default List;
