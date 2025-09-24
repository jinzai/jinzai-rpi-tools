import { ByteTransportBase } from "../spi/ByteTransport.js";
import { createRequire } from "node:module";

type SerialPortCtor = new (opts: any) => any;

export class SerialPortTransport extends ByteTransportBase {
  private port?: InstanceType<SerialPortCtor>;

  constructor(private path: string, private baud: number) {
    super();
  }

  async start(): Promise<void> {
    if (this.port) return;

    // Resolve serialport relative to the consuming app (cwd)
    let SerialPort: SerialPortCtor;
    try {
      const reqFromApp = createRequire(process.cwd() + "/package.json");
      const spPath = reqFromApp.resolve("serialport");
      const spMod = reqFromApp(spPath);
      SerialPort = (spMod && (spMod.SerialPort ?? spMod.default)) as SerialPortCtor;
    } catch {
      throw new Error(
        'serialport module not found. Install it in the consuming app: "npm i serialport"'
      );
    }

    this.port = new SerialPort({
      path: this.path,
      baudRate: this.baud,
      lock: false, // optional: avoids stale lockfile headaches
    }) as any;
    this.port.on("open", () => this.emit("open"));
    this.port.on("data", (chunk: Buffer) => this.emit("data", chunk));
    this.port.on("close", () => this.emit("close"));
    this.port.on("error", (e: unknown) => this.emit("error", e));
  }

  async stop(): Promise<void> {
    await new Promise<void>((res) => this.port?.close(() => res()));
    this.port = undefined;
  }

  async write(buf: Buffer): Promise<void> {
    await new Promise<void>((res, rej) =>
      this.port?.write(buf, (e: unknown) => (e ? rej(e) : res()))
    );
  }
}
