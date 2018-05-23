import { RemoteApp } from "../main/remote-app";

export interface IConnectionAction {
    /** Wether ui should be shown bore executing action.  */
    isUiRequired: boolean;
    execute(options: Object, app: RemoteApp);
}

export interface IVpnAction extends IConnectionAction {
    /** 
     * Dispaly name so user understands what type of connection it is
     */
    name: string;
    /**
     * Tells our app if it found an open vpn.
     */
    isVpnConnected(): Promise<boolean>;
}