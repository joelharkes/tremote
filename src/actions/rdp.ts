import * as cmd from "child_process";
import { IConnectionAction } from "./actionBase";
import { RemoteApp } from "../main/remote-app";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as Registry from "winreg";

import { screen } from "electron";
import { logger } from "../main/logger";
export interface RdpOptions {
    server: string;
    password: string;
    user: string;
    gateway: string;
}

export class RdpAction implements IConnectionAction {
    isUiRequired = false;
    name = "remote desktop";
    async execute(options: RdpOptions, app: RemoteApp) {
        var { server, user, password } = options;

        var serverParts = server.split(":");
        var host = serverParts[0];
        var port = 3389;
        if (serverParts.length > 1) {
            port = Number(serverParts[0]);
        }
        this.saveCredentials(host, user, password);

        // useful info: https://www.donkz.nl/overview-rdp-file-settings/
        // https://technet.microsoft.com/en-us/library/ff393699(v=ws.10).aspx
        var fileLines = [
            "redirectprinters:i:0", // disable printers!
            "full address:s:" + server,
            "connection type:i:1"
        ];
        if (port !== 3389) {
            fileLines.push("server port:i:0x" + port.toString(16).toUpperCase());
        }
        fileLines.push("username:s:" + user);
        if (options.gateway) {
            fileLines.push(
                "gatewaycredentialssource:i:4",
                "gatewayusagemethod:i:2",
                "gatewayhostname:s:" + options.gateway,
                "gatewayprofileusagemethod:i:1"
            );
            this.saveCredentials(options.gateway, user, password, "", "add");
            
        }
        var profile = await app.getProfile();
        var primaryScreen = screen.getPrimaryDisplay().bounds;
        var width = profile.rdpPreferedWidth || primaryScreen.width;
        var height = profile.rdpPreferedHeight || primaryScreen.height;
        var x = profile.rdpPreferedX || 0;
        var y = profile.rdpPreferedY || 0;
        fileLines.push(
            // use multimon:i:0
            "desktopwidth:i:" + width.toString(),
            "desktopheight:i:" + height.toString(),
            // session bpp:i:32
            "winposstr:s:0,1," + x.toString() + "," + y.toString() + "," + (x + width + 50).toString() + "," + (y + height + 50).toString()
        );
        if (!profile.rdpPreferedFullscreen) {
            fileLines.push("screen mode id:i:1");
        }
        if (!profile.rdpSendKeyCombinations) {
            // Default value = 2;
            const sendKeyComb = profile.rdpSendKeyCombinations === 0 ? profile.rdpSendKeyCombinations : profile.rdpSendKeyCombinations || 2;
            fileLines.push("keyboardhook:i:" + sendKeyComb);
        }
        
        // normalize file to windows newline
        var file = fileLines.join("\r\n");
        var tmp = os.tmpdir();
        var fileName = `tremote.pbk`;
        var filepath = path.resolve(tmp, fileName);
        await fs.writeFile(filepath, file);
        try {
            const regName = options.gateway ? `${host};${options.gateway}` : host;
            await this.acceptUnkownCertForHost(regName);
        } catch (err) {
            logger.error(err);
        }
        cmd.spawn("mstsc", [filepath /* ,`/v:${server}` */], { detached: true });

    }

    acceptUnkownCertForHost(server: string) {
        return new Promise((y, n) => {
            var reg = new Registry({
                hive: Registry.HKCU,
                key: "\\Software\\Microsoft\\Terminal Server Client\\LocalDevices"
            });
            reg.set(server, Registry.REG_DWORD, 12, (err) => {
                if (err) {
                    return n(err);
                }
                y(true);
            });
        });

    }
    saveCredentials(host: string, user: string, password: string, prefix: string= "TERMSRV/", generic: string = "generic") {
        cmd.execFileSync("cmdkey", [`/${generic}:${prefix}${host}`, `/user:${user}`, `/pass:${password}`]);
    }
}
