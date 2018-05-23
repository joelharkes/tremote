import { EventEmitter } from "events";
import * as cmd from "child_process";
import * as electron from "electron";
import { VpnStatus, VpnProcessDto } from "../shared/interfaces";
import { logger } from "./logger";

export interface VpnProcess {
    info: VpnProcessDto;
    disconnect(): Promise<boolean>;
}

export abstract class VpnProcessBase implements VpnProcess {
    info: VpnProcessDto;
    window: electron.BrowserWindow;
    spawnCommand: { command: string; args: string[]; options: cmd.SpawnOptions; };
    proc: cmd.ChildProcess | null;
    constructor(command: string, args: string[], options: cmd.SpawnOptions) {
        this.info = { status: VpnStatus.Loading, name: "vpn" };
        this.spawnCommand = { command, args, options };
        var proc = cmd.spawn(command, args, options);
        proc.stdout.on("data", this.addConsoleData);
        proc.stderr.on("data", this.addConsoleData);
        proc.on("exit", () => {
            this.proc = null;
            this.onProcessClose();
        });
        this.proc = proc;
    }

    onProcessClose() {
        logger.info(`vpn process closed`, { vpn: true, status: this.info.status, cmd: this.spawnCommand });
        if (this.info.status === VpnStatus.Loading) {
            this.info.status = VpnStatus.Failed;
        }
    }
    abstract detectVpnConnected(newLines: string[]): VpnStatus | null;
    abstract disconnect(): Promise<boolean>;

    getExecutedCommand(): string {
        return this.spawnCommand.command + " " + this.spawnCommand.args.join(" ");
    }

    addConsoleData = (buffer: String | Buffer) => {
        var newLines = buffer.toString().split("\n");
        newLines.forEach(l => logger.debug(l, { vpn: true, status: this.info.status, cmd: this.spawnCommand }));
        var newStatus = this.detectVpnConnected(newLines);
        if (newStatus != null) {
            this.info.status = newStatus;
            logger.info(`vpn status changed to: ${newStatus}`, { vpn: true, status: this.info.status, cmd: this.spawnCommand });
        }
    }
}