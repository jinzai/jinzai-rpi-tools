export interface Logger {
  info(obj: any, msg?: string): void;
  warn(obj: any, msg?: string): void;
  error(obj: any, msg?: string): void;
  debug?(obj: any, msg?: string): void;
}
