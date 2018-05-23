export interface ProfileSettings {
    rdpPreferedX: number;
    rdpPreferedY: number;
    rdpPreferedWidth: number;
    rdpPreferedHeight: number;
    rdpPreferedFullscreen: boolean;
    rdpSendKeyCombinations: number;

    widgets: WidgetProfileModel[];
}

export interface WidgetProfileModel {
    name: string;
    /** the Widget's persistent state */
    options: object;
}

export interface VpnConnectionInfo {
    name: string;
    isConnected: boolean;
}

export interface LogMessage {
    message: string;
    level: string;
}
export interface RemoteAppInterface {
    getVpnConnectionInfo(): Promise<VpnConnectionInfo[]>;
    getVpns(): Promise<VpnProcessDto[]>;
    disconnectVpn(name: string): Promise<boolean>;
    getProfile(): Promise<ProfileSettings>;
    executeUrl(urlString: string);
    saveProfile(profile: ProfileSettings);
    executeAction(actionName: string, options: Object);
    gotoUrl(url: string): Promise<boolean>;
    getLogs(): LogMessage[];
}

export enum VpnStatus {
    Loading,
    Connected,
    Failed,
    Disconnected
}

export interface VpnProcessDto {
    name: string;
    status: VpnStatus;
}