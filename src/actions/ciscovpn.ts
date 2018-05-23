import { IConnectionAction } from "./actionBase";
import { CiscoVpnScriptAction } from "./ciscovpnscript";
import { RemoteApp } from "../main/remote-app";
import { logger } from "../main/logger";

export interface CiscoVpnOptions {
    server: string;
    user: string;
    password: string;
    untrusted: boolean;
    acceptmessage: boolean;
}

export function createNewOptions(): CiscoVpnOptions {
    return {
        server: "",
        user: "",
        password: "",
        untrusted: false,
        acceptmessage: false
    };
}

const SCRIPT_NEWLINE = "\n";
export class CiscoVpnAction implements IConnectionAction {
    isUiRequired = true;
    execute(options: CiscoVpnOptions, app: RemoteApp) {
        var scriptAction = new CiscoVpnScriptAction();
        var { server, user, password } = options;
        logger.debug("trying to start cisco vpn", { vpn: true, ...options });
        var script = `connect ${server}`;
        if (options.untrusted) {
            script += SCRIPT_NEWLINE + "y";
        }
        script += SCRIPT_NEWLINE + user + SCRIPT_NEWLINE + options.password;
        if (options.acceptmessage) {
            script += SCRIPT_NEWLINE + "y";
        }
        script += SCRIPT_NEWLINE;
        return scriptAction.execute({ script: script }, app);
    }
}
