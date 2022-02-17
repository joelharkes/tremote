import { IConnectionAction, IVpnAction } from "./actionBase";
import { RemoteApp } from "../main/remote-app";
import * as cmd from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { EventEmitter } from "events";
import { VpnProcessBase } from "../main/vpnprocess-base";
import { VpnStatus } from "../shared/interfaces";
import { logger } from "../main/logger";

// todo: turn into self discovering setting.
const CISCO_CLI_PATH = "C:\\Program Files (x86)\\Cisco\\Cisco AnyConnect Secure Mobility Client\\vpncli.exe";
const SCRIPT_NEWLINE = "\n";
const QUIT_COMMANDS = ["exit", "quit", "q"];

export interface CiscoVpnScriptOptions {
    script: string;
}

export class CiscoVpnScriptAction implements IVpnAction {
    isUiRequired = true;
    name = "Cisco Anyconnect";
    isVpnConnected(): Promise<boolean> {
        return new Promise((y, n) => {
            cmd.execFile(CISCO_CLI_PATH, ["status"], (err, stdout) => {
                if (err) {
                    return n(err);
                }
                return -1 === stdout.indexOf("state: Disconnected");
            });
        });
    }
    async execute(options: CiscoVpnScriptOptions, app: RemoteApp) {
        var script = options.script + QUIT_COMMANDS[0] + SCRIPT_NEWLINE;

        var pr = new CiscoVpnProcess(CISCO_CLI_PATH, ["-s"], { stdio: "pipe", cwd: "", detached: false }, script);
        app.addVpn(pr);
    }

}

export class CiscoVpnProcess extends VpnProcessBase {

    constructor(command: string, args: string[], options: cmd.SpawnOptions, script: string) {
        super(command, args, options);
        this.info.name = "Cisco VPN";
        const proc = this.proc as cmd.ChildProcess;
        (proc.stdin as any).setEncoding("utf8");
        proc.stdin?.write(script);
    }

    detectVpnConnected(newLines: string[]): VpnStatus | null {
        if (newLines.some(x => x.indexOf("state: Connected") !== -1)) {
            return VpnStatus.Connected;
        }
        if (newLines.some(x => x.indexOf("Login failed.") !== -1)
            || newLines.some(x => x.indexOf("error: Connect not available. Another AnyConnect application is running") !== -1)) {
            return VpnStatus.Failed;
        }

        return null;
    }
    disconnect(): Promise<boolean> {
        return new Promise((y) => {
            if (this.proc && !this.proc.killed) {
                try {
                    this.proc.kill();
                } catch (error) {
                    logger.error(error, { vpn: true });
                }
            }
            var proc = cmd.spawn(CISCO_CLI_PATH, ["disconnect"]);
            proc.stdout.on("data", this.addConsoleData);
            proc.stderr.on("data", this.addConsoleData);
            proc.on("exit", () => {
                this.info.status = VpnStatus.Disconnected;
                y(true);
            });
        });

    }
}
