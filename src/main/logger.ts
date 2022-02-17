import * as winston from "winston";
import * as Transport from 'winston-transport';
import * as stream from "stream";
import * as os from "os";
import * as path from "path";
import * as process from "process";

let IN_DEV: boolean | null = null;
export function isDevelopment() {
  if (IN_DEV === null) {
    IN_DEV = process.argv.join(" ").indexOf("index.ts") > -1;
  }
  return IN_DEV;
}

class LogRotator extends stream.Writable {
  log = [] as object[];
  constructor() {
    super({ objectMode: true, });
  }

  write(chunk: object) {
    this.log.push(chunk);
    return true;
  }
}

export const MemLog = new LogRotator();

var transports = new Array<Transport>();
if (isDevelopment() || process.env.NODE_ENV === "development") {
  transports.push(new winston.transports.Console());
}
if (!isDevelopment()) {
  // transports.push(new winston.transports.File({ filename: path.join(os.tmpdir(), "tremote.log"), level: "debug" }));
}
transports.push(new (winston.transports as any).Stream({ stream: MemLog }));

export const logger = winston.createLogger({
  level: "debug",
  transports
}) as winston.Logger;