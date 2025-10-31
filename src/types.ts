export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
    }
  : T;

export interface InitConfig {
  selector: string;
  proxyDomain: string;
  placeId: string;
}
