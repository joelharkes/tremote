import { IConnectionAction, IVpnAction } from "./actionBase";
import { RemoteApp } from "../main/remote-app";
import * as cmd from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as EventEmitter from "events";
import * as os from "os";
import { VpnStatus, VpnProcessDto } from "../shared/interfaces";
import { logger } from "../main/logger";
import { VpnProcess } from "../main/vpnprocess-base";

/*
USAGE:
    rasdial entryname [username [password|*]] [/DOMAIN:domain]
            [/PHONE:phonenumber] [/CALLBACK:callbacknumber]
            [/PHONEBOOK:phonebookfile] [/PREFIXSUFFIX]

    rasdial [entryname] /DISCONNECT

    rasdial

    Please refer to our privacy statement at
    'https://go.microsoft.com/fwlink/?LinkId=521839'
 */
interface WindowsVpnOptions {
    file: string;
    user: string;
    password: string;
    domain: string;
}
export class WindowsVpnAction implements IVpnAction {
    isUiRequired = true;
    name = "Windows vpn";
    isVpnConnected(): Promise<boolean> {
        return new Promise((y, n) => {
            cmd.execFile("rasdial", (err, stdout) => {
                if (err) {
                    return n(err);
                }
                return !stdout.startsWith("No connections");
            });
        });
    }
    async execute(options: WindowsVpnOptions, app: RemoteApp) {
        var { file, user, password } = options;
        try {
            //  Normalize all to windows newlines!
            file = file.replace(/\r?\n/g, "\r\n");
            var dir = os.tmpdir();

            var serverName = file.split("\r\n")
                .filter(x => x.indexOf("PhoneNumber=") === 0)[0]
                .split("=")[1]
                .replace("\r", "");
            var connectionname = file.split("\r\n")
                .filter(x => x[0] === "[")[0]
                .replace(/[\[\]]/g, "");

            var filename = `${serverName}.pbk`;
            var filepath = path.resolve(dir, filename);

            fs.writeFileSync(filepath, file);

            var rasdialArgs = [connectionname];
            if (user) {
                rasdialArgs.push(user);
            }
            if (password) {
                rasdialArgs.push(password);
            }
            if (options.domain) {
                rasdialArgs.push(`/DOMAIN:${options.domain}`);
            }

            rasdialArgs.push(`/phonebook:${filepath}`);

            var proc = new WindowsVpnProcess("rasdial", rasdialArgs, { stdio: "pipe", cwd: path.resolve("."), detached: false });
            app.addVpn(proc);
        } catch (err) {
            logger.error(err, { vpn: true, type: "windows-vpn-powershell" });
            fs.appendFileSync("error.log", err.stack);
            app.quit();
        }
    }

}

export class WindowsVpnProcess extends EventEmitter implements VpnProcess {
    info: VpnProcessDto;
    spawnCommand: { command: string; args: string[]; options: cmd.SpawnOptions; };
    output: string[];
    proc: cmd.ChildProcess | null;
    constructor(command: string, args: string[], options: cmd.SpawnOptions) {
        super();
        this.info = { status: VpnStatus.Loading, name: "windows vpn" };
        this.spawnCommand = { command, args, options };
        var proc = cmd.spawn(command, args, options);
        this.output = [];
        proc.stdout.on("data", this.addConsoleData);
        proc.stderr.on("data", this.addConsoleData);
        proc.on("exit", () => {
            this.proc = null;
            this.emit("data", this.output);
        });
        this.proc = proc;
    }

    disconnect(): Promise<boolean> {
        var proc = cmd.spawn("rasdial", ["/DISCONNECT"]);
        proc.stdout.on("data", this.addConsoleData);
        proc.stderr.on("data", this.addConsoleData);
        return new Promise(y => {
            proc.on("exit", () => {
                y(true);
            });
        });
    }

    getExecutedCommand(): string {
        return this.spawnCommand.command + " " + this.spawnCommand.args.join(" ");
    }

    private addConsoleData = (buffer: String | Buffer) => {
        var newLines = buffer.toString().split("\n");
        newLines.forEach(l => logger.debug(l));
        if (newLines.some(x => x.startsWith("Successfully connected to") || x.startsWith("You are already connected to"))) {
            this.info.status = VpnStatus.Connected;
            logger.info(`windows vpn connection established`);
        }
        if (newLines.some(x => x.startsWith("A connection to the remote computer could not be established, so the port used for this connection was closed."))) {
            this.info.status = VpnStatus.Failed;
            logger.warn(`windows vpn connection Failed`);
        }
        this.output.push(...newLines);
        this.emit("data", this.output);
    }

}