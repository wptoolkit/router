import { RouteInterface } from '.';

export interface RouteList {
  [key: string]: () => RouteInterface;
}
