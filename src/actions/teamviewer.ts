import * as cmd from "child_process";
import { IConnectionAction } from "./actionBase";
import { RemoteApp } from "../main/remote-app";
import { logger } from "../main/logger";

export interface TeamViewerOptions {
    id: string;
    password: string;
}
export class TeamViewerAction implements IConnectionAction {
    isUiRequired = false;
    name = "TeamViewer";
    execute(options: TeamViewerOptions, app: RemoteApp) {
        var exe = "\\Program Files (x86)\\TeamViewer\\TeamViewer.exe";
        var args = ["-i", options.id, "-P", options.password];
        logger.debug(`opening ${exe} ${args.join(" ")}`);
        cmd.spawnSync(exe, args, { detached: true } as cmd.SpawnOptions);
    }

}