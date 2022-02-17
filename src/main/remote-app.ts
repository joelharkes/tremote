import { BrowserWindow, app } from "electron";
import * as fs from "fs-extra";
import * as open from "open";
import * as os from "os";
import * as path from "path";
import * as url from "url";
import { IConnectionAction } from "../actions/actionBase";
import { CiscoVpnAction } from "../actions/ciscovpn";
import { CiscoVpnScriptAction } from "../actions/ciscovpnscript";
import { RdpAction } from "../actions/rdp";
import { RdpFileAction } from "../actions/rdp-file";
import { RemoteAction } from "../actions/remote";
import { ShrewSoft } from "../actions/shrewsoft";
import { TeamViewerAction } from "../actions/teamviewer";
import { WindowsVpnAction } from "../actions/windowsvpn";
import { WindowsVpnPowershellAction } from "../actions/windowsvpn-powershell";
import { ProfileSettings, RemoteAppInterface, VpnConnectionInfo, VpnProcessDto, LogMessage } from "../shared/interfaces";
import { RemoteResponder } from "../shared/remoting";
import { logger, MemLog, isDevelopment } from "./logger";
import { VpnProcess } from "./vpnprocess-base";

// const remote = require('../actions/remote');
// const windowsvpn = require('../actions/windowsvpn');

var actions = {
    ciscovpn: CiscoVpnAction,
    ciscovpnscript: CiscoVpnScriptAction,
    windowsvpn: WindowsVpnAction,
    windowsvpnpowershell: WindowsVpnPowershellAction,
    rdp: RdpAction,
    rdpfile: RdpFileAction,
    teamviewer: TeamViewerAction,
    remote: RemoteAction,
    shrewsoft: ShrewSoft
};

export class RemoteApp implements RemoteAppInterface {

    window?: BrowserWindow;
    private openVpns: VpnProcess[] = [];
    private profile?: ProfileSettings;
    constructor() {
        logger.info("remoteapp created");
    }

    getProfilePath(): string {
        return path.resolve(os.homedir(), ".tremote.json");
    }
    async getProfile(): Promise<ProfileSettings> {
        if (!this.profile) {
            var diskProfile = {};
            try {
                diskProfile = await fs.readJson(this.getProfilePath(), { throws: false });
            } catch (err) {
                // expected error
            }
            this.profile = diskProfile as ProfileSettings;
        }
        return this.profile as ProfileSettings;
    }
    saveProfile(profile: ProfileSettings) {
        this.profile = profile;
        return fs.writeJson(this.getProfilePath(), this.profile);
    }

    async main(args: string[]) {
        var openedWithMagnetLink = args.length > 1 && args[1].startsWith("tremote://");
        var action = openedWithMagnetLink ? this.parseUrltoAction(args[1]) : null;

        if (!openedWithMagnetLink && !isDevelopment()) {
            logger.debug("registering url protocol termote:// for magnet links");
            app.setAsDefaultProtocolClient("tremote");
        }
        if (action == null || action.action.isUiRequired) {
            logger.debug("opening startup page");
            await this.openStartPage();
        }

        if (action != null) {
            logger.debug(`executing action ${action.actionName}`);
            try {
                var result = action.execute();
                if (result instanceof Promise) {
                    return await result;

                }
            } catch (error) {
                logger.error(error.stack);
            }

        }
    }

    parseUrltoAction(urlString: string) {
        var urlObj = url.parse(urlString, true);
        var actionName = urlObj.hostname as string;
        if (actionName.endsWith(".js")) {
            actionName = actionName.substring(0, actionName.length - 3);
        }

        var actionType = actions[actionName];
        var Action = new actionType() as IConnectionAction;
        return {
            action: Action,
            actionName,
            execute: () => Action.execute(urlObj.query, this),
            options: urlObj.query,
        };
    }
    executeUrl(urlString: string) {
        var urlObj = url.parse(urlString, true);
        var actionName = urlObj.hostname as string;
        if (actionName.endsWith(".js")) {
            actionName = actionName.substring(0, actionName.length - 3);
        }
        return this.executeAction(actionName, urlObj.query);
        // var queryIndex = urlString.indexOf('?');
        // var queryObject = queryIndex > 0 ? JSON.parse(atob(decodeURIComponent(urlString.substring(queryIndex + 1)))) : {};
        // return this.executeAction(actionName, queryObject);
    }

    executeAction(actionName: string, options: Object) {
        var actionType = actions[actionName];
        var Action = new actionType() as IConnectionAction;
        var actionResult = Action.execute(options, this);
        return actionResult; // not used atm
    }

    getVpns(): Promise<VpnProcessDto[]> {
        return Promise.resolve(this.openVpns.map(x => x.info));
    }
    async disconnectVpn(name: string): Promise<boolean> {
        logger.debug("disconnecting vpn", { name });
        var vpn = this.openVpns.find(x => x.info.name === name);
        if (vpn) {
            var r = await vpn.disconnect();
            if (r) {
                this.openVpns = this.openVpns.filter(x => name !== name);
            }
            return r;
        }
        return true;
    }
    addVpn(vpn: VpnProcess) {
        this.openVpns.push(vpn);
    }
    async openStartPage(): Promise<BrowserWindow> {
        if (this.window) {
            return this.window;
        }
        var x = new RemoteResponder<RemoteAppInterface>(this);
        await app.whenReady();
        const win = new BrowserWindow({
            width: 1240,
            height: 1080,
            title: "TRemote > start",
            autoHideMenuBar: false,
        });
        logger.info("opening main window startup page");

        var pathX = url.format({
            pathname: path.join(__dirname, "..", "output", "index.html"),
            protocol: "file:",
            slashes: true
        });
        var page = isDevelopment() ? "http://localhost:3009/" : pathX;
        win.loadURL(page);

        if (isDevelopment()) {
            win.webContents.openDevTools();
        }

        this.window = win;
        return win;
    }
    getLogs(): LogMessage[] {
        return MemLog.log as LogMessage[];
    }
    async getVpnConnectionInfo(): Promise<VpnConnectionInfo[]> {
        var vpns = [new WindowsVpnAction(), new CiscoVpnScriptAction()
        ];

        var promises = vpns.map(x => x.isVpnConnected());
        var isConnected = Promise.all(promises);
        return vpns.map((vpn, i) => ({ name: vpn.name, isConnected: isConnected[i] } as VpnConnectionInfo));
    }
    gotoUrl(url: string): Promise<boolean> {
        open(url);
        return Promise.resolve(true);
    }
    quit() {
        app.quit();
    }
}
