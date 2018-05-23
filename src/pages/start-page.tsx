// import * as boostrap from 'bootstrap'
import * as React from "react";
import { CiscoVpnOptions } from "../actions/ciscovpn";
import { ProfileSettings, RemoteAppInterface, VpnConnectionInfo, VpnProcessDto, VpnStatus, WidgetProfileModel } from "../shared/interfaces";
import { createRemoteSender } from "../shared/remoting";
import { Store } from "./store";
import { inject, observer } from "mobx-react";
import { Snackbar, Paper, TextField, RaisedButton, ToolbarGroup, ToolbarTitle, Toolbar, FloatingActionButton } from "material-ui";
import ContentAdd from "material-ui/svg-icons/content/add";
import { CiscoVpnWidgetComponent, CiscoVpnWidget } from "./cisco/cisco-widget";
import { Widget } from "./widget-base";
import { toJS } from "mobx";

var WIDGETS = {
    "Cisco VPN": new CiscoVpnWidget()
};

interface Props {
    store?: Store;
}
interface State {
    vpnInfo: VpnConnectionInfo[];
    url: string;
}
@inject("store")
@observer
export class StartPage extends React.Component<Props, State> {
    state = { url: "", vpnInfo: [] } as State;

    get store(): Store {
        return this.props.store as Store;
    }
    async componentDidMount() {
        try {
            var vpnInfo = await this.store.remoteApp.getVpnConnectionInfo();
            this.setState(() => ({ vpnInfo } as State));
        } catch (err) {
            console.error(err);
        }

    }
    executeUrl = () => {
        this.store.remoteApp.executeUrl(this.state.url);
    }
    changeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
        var url = e.target.value;
        this.setState(() => ({ url: url }));
    }
    render() {
        if (!this.state) {
            return (
                <div>loading</div>
            );
        }

        var { url } = this.state;
        var profile = this.store.settings || {};
        return (
            <div style={{ padding: 10 }}>
                <Paper>
                    <Toolbar>
                        <ToolbarGroup>
                            <ToolbarTitle text="Execute manualy" />
                        </ToolbarGroup >
                    </Toolbar >
                    <div style={{ padding: 10 }}>
                        Insert your url below and click execute to test your magnet link:<br />
                        <TextField
                            hintText="Url"
                            value={url} onChange={this.changeUrl}
                        />
                        <RaisedButton label="Execute" primary={true} onClick={this.executeUrl} />
                    </div>
                </Paper>
                {this.renderWidgets()}
                <FloatingActionButton style={{ position: "fixed", bottom: 0, right: 0, margin: 20 }} onClick={this.addWidget}>
                    <ContentAdd />
                </FloatingActionButton>
            </div >
        );
    }
    rennderVpnInfo() {
        if (this.state && this.state.vpnInfo) {
            return this.state.vpnInfo.map(x => {
                if (x.isConnected) {
                    return <div key={x.name}>{x.name} detected.</div>;
                } else {
                    return <div key={x.name}>No {x.name} detected</div>;
                }
            });
        }
        return <div>Loading connection info...</div>;
    }
    renderWidgets() {

        return this.store.settings && this.store.settings.widgets.map((widget, i) => {
            return <WidgetWrapper key={i} widget={widget} />;
        });
    }
    addWidget = () => {
        // todo show menu of widget options
        this.store.addWiget("Cisco VPN", WIDGETS["Cisco VPN"].createNewModel());
    }
}

@inject("store")
@observer
export class WidgetWrapper extends React.Component<{ widget: WidgetProfileModel, store?: Store }> {
    get store(): Store {
        return this.props.store as Store;
    }
    render() {
        var { widget } = this.props;
        var w = WIDGETS[widget.name] as Widget;
        return w.render({
            model: toJS(widget.options),
            onChange: this.onChange,
            onRemove: this.onRemove,
        });
    }
    onChange = (changes: object) => {
        this.store.updateWidget(this.props.widget.options, changes);
    }
    onRemove = () => {
        this.store.removeWidget(this.props.widget);
    }
    
}