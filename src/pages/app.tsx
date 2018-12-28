import * as React from "react";
import { StartPage } from "./start-page";
import { inject, observer, IReactComponent } from "mobx-react";
import { Store, Stores } from "./store";
import { SettingsPage } from "./settings-page";
import { muiTheme } from "./theme";
import { LogPage } from "./log-page";
import { OpenVpnView } from "./openvpn-view";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider, AppBar, Drawer, List, Toolbar, IconButton, Typography, withStyles, ListItem, ListItemText } from "@material-ui/core";

import MenuIcon from "@material-ui/icons/Menu";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

interface Props {
    store?: Store;
    classes: ClassNameMap<string>;
}
interface State {
}

var PAGES = { StartPage, /* CiscVpnPage, WindowsVpnPage */ };

var drawerSize = 180;

var styles = {};
@inject("store")
@observer

class AppIntern extends React.Component<Props, State> {
    get store(): Store {
        return this.props.store as Store;
    }
    render() {
        var { classes } = this.props;
        return (
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                <div className="app" style={{ marginLeft: drawerSize }}>
                    <AppBar title="Tremote" position="static">
                        <Toolbar>
                            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={this.store.toggleDrawer}>
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="title" color="inherit" className={classes.flex}>
                                Tremote
                            </Typography>
                            {/* <Button color="inherit">Login</Button> */}
                        </Toolbar>
                    </AppBar>
                    <Drawer variant="permanent" onClose={this.store.toggleDrawer}>
                        <List  style={{width: drawerSize}}>
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

export const App = withStyles(styles)(AppIntern);

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
            <ListItem button onClick={this.onClick}
             style={{ color: active && muiTheme.palette ? muiTheme.palette.common.black : undefined }} >
             
             <ListItemText primary={text}  />
 
             </ListItem>
        );
    }
}

const NavItemMobx: IReactComponent<NavPropsSimple> = inject((stores: Stores, props: NavProps, context) =>
    ({ active: props.component === stores.store.type, navigateTo: stores.store.navigateTo }))
    (observer(NavItem));