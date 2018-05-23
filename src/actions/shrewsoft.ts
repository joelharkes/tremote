import * as cmd from "child_process";
import { IConnectionAction } from "./actionBase";
import { RemoteApp } from "../main/remote-app";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import { logger } from "../main/logger";

export interface ShrewsoftOptions {
    file: string;
    password: string;
    user: string;
}

/* 
ipsecc.exe -r "name" [ -u <user> ][ -p <pass> ][ -a ]
 -r	site configuration path
 -u	connection user name
 -p	connection user password
 -a	auto connect
*/
const SHREW_PATH = "C:\\Program Files\\ShrewSoft\\VPN Client\\ipsecc.exe";
export class ShrewSoft implements IConnectionAction {
    isUiRequired = false;
    name = "remote desktop (file)";
    async execute(options: ShrewsoftOptions, app: RemoteApp) {
        var { file, user, password } = options;

        logger.debug(`shrewsoft building`, options);
        // normalize file to windows newline
        file = file.replace(/\r?\n/g, "\r\n");
        var server = file.split("\r\n").filter(x => x.startsWith("s:network-host:"))[0]
            .replace("s:network-host:", "");

        var host = server.split(":")[0];
        var dir = path.resolve(os.homedir(), "AppData/Local/Shrew Soft VPN/sites");

        var fileName = `${server}.vpn`;
        var filepath = path.resolve(dir, fileName);
        await fs.writeFile(filepath, file);
        logger.debug(`shrewsoft starting`, options);
        
        cmd.spawn(SHREW_PATH, ["-r", fileName, "-u", user, "-p", password, "-a"], { detached: true });
        // we are done electron no longer needed
    }
}
