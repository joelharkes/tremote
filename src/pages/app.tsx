import * as React from "react";
import { StartPage } from "./start-page";
import { inject, observer, IReactComponent } from "mobx-react";
import { Store, Stores } from "./store";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import Drawer from "material-ui/Drawer";
import { List, ListItem } from "material-ui";
import { SettingsPage } from "./settings-page";
import { getMuiTheme } from "material-ui/styles";
import { muiTheme } from "./theme";
import { LogPage } from "./log-page";
import { OpenVpnView } from "./openvpn-view";
interface Props {
    store?: Store;
}
interface State {
}

var PAGES = { StartPage, /* CiscVpnPage, WindowsVpnPage */ };

var drawerSize = 160;
@inject("store")
@observer
export class App extends React.Component<Props, State> {
    get store(): Store {
        return this.props.store as Store;
    }
    render() {
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div className="app" style={{ marginLeft: drawerSize }}>
                    <AppBar title="Tremote"
                        onLeftIconButtonClick={this.store.toggleDrawer}

                    />
                    <Drawer docked={true} onRequestChange={this.store.toggleDrawer} width={drawerSize}>
                        <List>
                            <NavItemMobx text="Dashboard" component={StartPage} />
                            <NavItemMobx text="Settings" component={SettingsPage} />
                            <NavItemMobx text="Log" component={LogPage} />
                        </List>
                    </Drawer>
                    {this.renderContent()}
                    {this.store.vpns.map(x => <OpenVpnView key={x.name} vpn={x} ondisconnect={this.store.disconnectVpn} />)}
                </div>
            </MuiThemeProvider>
        );
    }
    renderContent() {
        return React.createElement(this.store.type);
    }
}

interface NavPropsSimple {
    text: string;
    component: React.ClassType<{}, any, any>;
}
interface NavProps extends NavPropsSimple {
    active: boolean;
    navigateTo(component: React.ClassType<{}, any, any>): void;
}
export class NavItem extends React.Component<NavProps> {
    onClick = () => {
        this.props.navigateTo(this.props.component);
    }
    render() {
        var { text, active } = this.props;
        return (
            <ListItem primaryText={text} onClick={this.onClick} style={{ color: active && muiTheme.palette ? muiTheme.palette.accent1Color : undefined }} />
        );
    }
}

const NavItemMobx: IReactComponent<NavPropsSimple> = inject((stores: Stores, props: NavProps, context) =>
    ({ active: props.component === stores.store.type, navigateTo: stores.store.navigateTo }))
    (observer(NavItem));