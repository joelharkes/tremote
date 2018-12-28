import { Paper, Button, TextField, Switch, Toolbar, Menu, IconButton, MenuItem } from "@material-ui/core";
import SvgDelete from "@material-ui/icons/Delete";
import SvgClear from "@material-ui/icons/Clear";
import SvgCreate from "@material-ui/icons/Create";
import NavigationExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { inject } from "mobx-react";
import * as React from "react";
import { CiscoVpnOptions, createNewOptions } from "../../actions/ciscovpn";
import { Store } from "../store";
import { WidgetBase, WidgetComponent, WidgetPropsTyped } from "../widget-base";

interface WidgetModel extends CiscoVpnOptions {
    name: string;
}

interface State {
    editMode: boolean;
    menuOpen: boolean;
}

export function createNewWidgetModel(): WidgetModel {
    var options = createNewOptions();
    return {
        ...options,
        name: "Cisco vpn"
    };
}

@inject("store")
export class CiscoVpnWidgetComponent extends WidgetComponent<WidgetModel, State> {
    state = {
        editMode: false,
        menuOpen: false,
    };
    get store(): Store {
        return (this.props as any).store;
    }
    toggleMenu =  () => {
        this.setState((prev) => ({menuOpen: !prev.menuOpen}));
    }
    render() {
        var { model } = this.props;
        return (
            <Paper style={{ marginTop: 15 }}>
                <Toolbar>
                {model.name}
                    <IconButton onClick={this.toggleMenu}>
                        <NavigationExpandMoreIcon />
                    </IconButton>
                    <Menu open={this.state.menuOpen}>
                        <MenuItem onClick={this.toggleEditMode}>
                            {this.state.editMode ? <SvgClear /> : <SvgCreate />} {this.state.editMode ? "Stop editing" : "Edit"}
                        </MenuItem>
                        <MenuItem onClick={this.props.onRemove} ><SvgDelete />Delete</MenuItem>
                    </Menu>
                </Toolbar >
                <div style={{ padding: 10 }}>
                    {this.state.editMode ? this.renderForm(model) : this.renderWidget()}

                </div>

            </Paper>
        );
    }
    renderWidget() {
        return (
            <>
                <Button variant="contained" onClick={this.connect}>Connect</Button>
                &nbsp;{this.props.model.user}@{this.props.model.server}

            </>
        );
    }
    connect = () => {
        this.store.remoteApp.executeAction("ciscovpn", this.props.model);
    }

    renderForm(options: WidgetModel) {
        return (
            <>
                <TextField type="text" label="Name"
                    value={options.name}
                    onChange={this.changeName} />
                <TextField type="text" label="server url/ip"
                    value={options.server}
                    onChange={this.changeServer} />
                <br />
                <TextField type="text" label="username"
                    value={options.user}
                    onChange={this.changeUser} />
                <br />
                <TextField type="password" label="password"
                    value={options.password || ""}
                    onChange={this.changePassword} />
                <br />
                <Switch 
                    checked={options.untrusted}
                    onChange={this.changeUntrusted}
                    style={{ marginTop: 14 }}
                />Is it untrusted<br />

                <Switch
                    checked={options.acceptmessage}
                    onChange={this.changeAcceptMessage}
                    style={{ marginTop: 14 }}
                />Is there a Acceptmessage?
            </>
        );
    }
    toggleEditMode = () => {
        this.setState(prev => ({ editMode: !prev.editMode }));
    }
    changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange({ name: event.target.value });
    }
    changeServer = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange({ server: event.target.value });
    }
    changeUser = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange({ user: event.target.value });
    }
    changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange({ password: event.target.value });
    }
    changeUntrusted = (_, newValue: boolean) => {
        this.props.onChange({ untrusted: newValue });
    }
    changeAcceptMessage = (_, newValue: boolean) => {
        this.props.onChange({ acceptmessage: newValue });
    }
}

export class CiscoVpnWidget implements WidgetBase<WidgetModel> {
    createNewModel = createNewWidgetModel;
    render(props: WidgetPropsTyped<WidgetModel>): JSX.Element {
        return (
            <CiscoVpnWidgetComponent {...props} />
        );
    }
    // abstract createNewModel(): TModel;
}