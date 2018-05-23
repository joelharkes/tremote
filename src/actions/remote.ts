import { IConnectionAction } from "./actionBase";
import { RemoteApp } from "../main/remote-app";
import * as cmd from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import fetch from "node-fetch";
import { logger } from "../main/logger";

export interface RemoteOptions {
    action: string;
}

export class RemoteAction implements IConnectionAction {
    isUiRequired: true;
    async execute(options: RemoteOptions, app: RemoteApp) {
        logger.debug(`fetching url`);
        var fetchResponse = await fetch(options.action);
        logger.debug(`converting json`);
        var connectionData = await fetchResponse.json();
        logger.debug(`parsin options`);
        var connectionOptions = JSON.parse(connectionData.options);
        logger.debug(`retrieved remote action ${connectionData.action}`, connectionOptions);
        return app.executeAction(connectionData.action, connectionOptions);
    }

}
