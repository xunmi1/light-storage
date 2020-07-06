export interface StorageValue<T> {
  value?: T;
  version?: string;
  maxAge?: number;
  time?: number;
}
