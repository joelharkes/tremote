import { IConnectionAction, IVpnAction } from "./actionBase";
import { RemoteApp } from "../main/remote-app";
import * as cmd from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as EventEmitter from "events";
import * as os from "os";
import { WindowsVpnProcess } from "./windowsvpn";
import { logger } from "../main/logger";

function ucFirst(txt: string) {
    return txt.charAt(0).toUpperCase() + txt.slice(1);
}

const psExec = (command: string, options: Object, cmdOptions?: cmd.SpawnOptions) => {
    var args = new Array<string>();

    Object.keys(options).forEach(x => {
        var optionValue = options[x];
        if (optionValue) {
            var psname = "-" + ucFirst(x);
            args.push(psname);
            if (optionValue !== true) {
                args.push(optionValue);
            }
        }
    });
    const psCommand = command + " " + args.join(" ");
    var cmdOpt = cmdOptions || {};
    cmdOpt.cwd = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0";
    return new Promise((y, n) => {
        var result = cmd.spawnSync("powershell.exe", ["-NoProfile", "-InputFormat", "None", "-ExecutionPolicy", "Bypass", "-Command", psCommand], cmdOpt);
        if (result.error) {
            return n(result.error);
        }
        return y(result.stdout);
    });
};
// Extra options: https://docs.microsoft.com/en-us/powershell/module/vpnclient/add-vpnconnection?view=win10-ps
interface WindowsVpnOptions {
    name: string;
    user: string;
    password: string;
    domain: string;
}
export class WindowsVpnPowershellAction implements IVpnAction {
    isUiRequired = true;
    name = "Windows ps vpn";
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
    async setConnection(options: WindowsVpnOptions) {
        var psOptions = { ...options, force: true, splitTunneling: true };
        delete psOptions.domain;
        delete psOptions.user;
        delete psOptions.password;
        try {
            await psExec("Remove-VpnConnection", { name: options.name, force: true });
        } catch (err) {
            logger.error(err);
            // expected
        }
        await psExec("Add-VpnConnection", psOptions);
    }
    async execute(options: WindowsVpnOptions, app: RemoteApp) {
        var { name, domain, user, password } = options;
        try {
            await this.setConnection(options);

            var rasdialArgs = [name];
            if (user) {
                rasdialArgs.push(user);
            }
            if (password) {
                rasdialArgs.push(password);
            }
            if (domain) {
                rasdialArgs.push(`/DOMAIN:${domain}`);
            }
            var proc = new WindowsVpnPoweshellProcess("rasdial", rasdialArgs, { stdio: "pipe", cwd: path.resolve("."), detached: false });
            app.addVpn(proc);
        } catch (err) {
            logger.error(err);
            app.quit();
        }
    }
}

class WindowsVpnPoweshellProcess extends WindowsVpnProcess {
    async disconnect() {
        var result = await super.disconnect();
        await psExec("Remove-VpnConnection", { name: this.spawnCommand.args[0], force: true });
        return result;
    }
}