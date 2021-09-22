export interface RouteList<T> {
  [key: string]: () => T;
}
