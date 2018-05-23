import { Paper, RaisedButton, TextField, Toggle, Toolbar, ToolbarGroup, ToolbarTitle, IconMenu, IconButton, MenuItem } from "material-ui";
import SvgDelete from "material-ui/svg-icons/action/delete";
import SvgClear from "material-ui/svg-icons/content/clear";
import SvgCreate from "material-ui/svg-icons/content/create";
import NavigationExpandMoreIcon from "material-ui/svg-icons/navigation/expand-more";
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
        editMode: false
    };
    get store(): Store {
        return (this.props as any).store;
    }

    render() {
        var { model } = this.props;
        return (
            <Paper style={{ marginTop: 15 }}>
                <Toolbar>
                    <ToolbarGroup>
                        <ToolbarTitle text={model.name} />
                    </ToolbarGroup >
                    <ToolbarGroup>
                        <IconMenu
                            iconButtonElement={
                                <IconButton touch={true}>
                                    <NavigationExpandMoreIcon />
                                </IconButton>}
                        >
                            <MenuItem primaryText={this.state.editMode ? "Stop editing" : "Edit"}
                                leftIcon={this.state.editMode ? <SvgClear /> : <SvgCreate />}
                                onClick={this.toggleEditMode} />
                            <MenuItem primaryText="Delete" leftIcon={<SvgDelete />} onClick={this.props.onRemove} />
                        </IconMenu>
                    </ToolbarGroup >
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
                <RaisedButton primary onClick={this.connect} label="Connect" />
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
                <TextField type="text" floatingLabelText="Name"
                    value={options.name}
                    onChange={this.changeName} />
                <TextField type="text" floatingLabelText="server url/ip"
                    value={options.server}
                    onChange={this.changeServer} />
                <br />
                <TextField type="text" floatingLabelText="username"
                    value={options.user}
                    onChange={this.changeUser} />
                <br />
                <TextField type="password" floatingLabelText="password"
                    value={options.password || ""}
                    onChange={this.changePassword} />
                <br />
                <Toggle
                    label="Is it untrusted"
                    labelPosition="right"
                    toggled={options.untrusted}
                    onToggle={this.changeUntrusted}
                    style={{ marginTop: 14 }}
                /><br />

                <Toggle
                    label="Is there a Acceptmessage?"
                    labelPosition="right"
                    toggled={options.acceptmessage}
                    onToggle={this.changeAcceptMessage}
                    style={{ marginTop: 14 }}
                />
            </>
        );
    }
    toggleEditMode = () => {
        this.setState(prev => ({ editMode: !prev.editMode }));
    }
    changeName = (_, newValue: string) => {
        this.props.onChange({ name: newValue });
    }
    changeServer = (_, newValue: string) => {
        this.props.onChange({ server: newValue });
    }
    changeUser = (_, newValue: string) => {
        this.props.onChange({ user: newValue });
    }
    changePassword = (_, newValue: string) => {
        this.props.onChange({ password: newValue });
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