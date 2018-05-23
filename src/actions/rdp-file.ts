import * as cmd from "child_process";
import { IConnectionAction } from "./actionBase";
import { RemoteApp } from "../main/remote-app";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

export interface RdpFileOptions {
    file: string;
    password: string;
    user: string;
}

export class RdpFileAction implements IConnectionAction {
    isUiRequired = false;
    name = "remote desktop (file)";
    async execute(options: RdpFileOptions, app: RemoteApp) {
        var { file, user, password } = options;

        // normalize file to windows newline
        file = file.replace(/\r?\n/g, "\r\n");
        var server = file.split("\r\n").filter(x => x.startsWith("full address:s:"))[0]
            .replace("full address:s:", "");

        var host = server.split(":")[0];
        var tmp = os.tmpdir();


        //var gateway = file.split("\r\n").filter(x => x.startsWith("gatewayhostname:s:"))[0]
        //    .replace("gatewayhostname:s:", "");
        const name = server.replace(/[^\w]/g, "_");
        var fileName = `${name}.pbk`;
        var filepath = path.resolve(tmp, fileName);
        await fs.writeFile(filepath, file);
        //if (gateway) {
        //this.saveCredentials(gateway, user, password);
        //}
        this.saveCredentials(`TERMSRV/${host}`, user, password);
        cmd.spawn("mstsc", [filepath], { detached: true });

        // we are done electron no longer needed
    }

    saveCredentials(host: string, user: string, password: string) {
        cmd.execFileSync("cmdkey", [`/generic:${host}`, `/user:${user}`, `/pass:${password}`]);
    }
}
