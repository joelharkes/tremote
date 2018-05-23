import { observable, action, IObservableArray, toJS, isObservableArray } from "mobx";
import { RemoteAppInterface, VpnProcessDto, ProfileSettings, LogMessage, WidgetProfileModel } from "../shared/interfaces";
import { createRemoteSender } from "../shared/remoting";
import { ClassType } from "react";
import { StartPage } from "./start-page";

function safeReplace<T extends object>(arra: IObservableArray<T>, arrb: Array<T>) {
    if (arra.length > arrb.length) {
        arra.splice(arrb.length - 1, arra.length - arrb.length);
    }
    for (let i = 0; i < arrb.length; i++) {
        var b = arrb[i];
        var a = i < arra.length ? arra[i] : undefined;
        if (!a) {
            arra[i] = b;
            continue;
        }
        for (let key of Object.keys(b)) {
            if (a[key] !== b[key]) {
                a[key] = b[key];
            }
        }
    }
}

export class Store {
    @observable settings: ProfileSettings;
    @observable public isDrawerOpen: boolean = false;
    @observable public type: ClassType<{}, any, any> = StartPage;

    remoteApp: RemoteAppInterface;

    readonly vpns = observable.array<VpnProcessDto>([]);
    readonly logs = observable.array<LogMessage>([]);

    constructor() {
        this.remoteApp = createRemoteSender<RemoteAppInterface>();
        // todo request page to land on?

        setInterval(async () => {
            var result = await this.remoteApp.getVpns();
            // if (result.length !== this.vpns.length) {
            safeReplace(this.vpns, result);
            // }
        }, 3000);
        this.initialize();
    }

    loadLogs = async () => {
        this.logs.replace(await this.remoteApp.getLogs());
    }

    @action.bound
    saveProfileSettings(newProfileProps: Partial<ProfileSettings>) {
        for (var k of Object.keys(newProfileProps)) {
            this.settings[k] = newProfileProps[k];
        }
        return this.remoteApp.saveProfile(toJS(this.settings));
    }

    @action.bound
    addWiget(widgetUniqueName: string, widgetModel: object) {
        this.settings.widgets.push({ name: widgetUniqueName, options: widgetModel });
        console.log(this.settings.widgets);
        return this.remoteApp.saveProfile(toJS(this.settings));
    }

    @action.bound
    updateWidget(widget: object, widgetChanges: object) {
        console.log(widget, widgetChanges);
        
        for (var k of Object.keys(widgetChanges)) {
            widget[k] = widgetChanges[k];
        }
        return this.remoteApp.saveProfile(toJS(this.settings));
    }

    
    @action.bound
    removeWidget(widget: WidgetProfileModel) {
        (this.settings.widgets as IObservableArray<any>).remove(widget);
        return this.remoteApp.saveProfile(toJS(this.settings));
    }

    async initialize() {
        var result = await this.remoteApp.getProfile();
        if (!result.widgets) {
            result.widgets = [];
        }
        this.settings = result;
    }

    @action.bound
    public toggleDrawer(): void {
        this.isDrawerOpen = !this.isDrawerOpen;
    }

    disconnectVpn = (vpn: VpnProcessDto) => {
        this.remoteApp.disconnectVpn(vpn.name);
    }

    @action
    navigateTo = <T>(component: T) => {
        this.type = component;
    }
}

export interface Stores {
    store: Store;
}