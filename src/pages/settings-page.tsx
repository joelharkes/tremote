// import * as boostrap from 'bootstrap'
import * as React from "react";
import { Store } from "./store";
import { inject, observer } from "mobx-react";
import { Snackbar, Paper, TextField, RaisedButton, ToolbarGroup, Toolbar, ToolbarTitle, Toggle } from "material-ui";
import { muiTheme } from "./theme";

interface Props {
    store?: Store;
}
interface State {
}

@inject("store")
@observer
export class SettingsPage extends React.Component<Props, State> {
    get store(): Store {
        return this.props.store as Store;
    }
    changeNumberSetting = (e: React.FormEvent<HTMLInputElement>, newValue: string) => {
        var name = e.currentTarget.name;
        var part = {};
        part[name] = newValue;
        return this.store.saveProfileSettings(part);
    }
    render() {
        var settings = this.store.settings;
        return (
            <div style={{ padding: 10 }}>
                <Paper>
                    <Toolbar>
                        <ToolbarGroup>
                            <ToolbarTitle text="Rdp settings" />
                        </ToolbarGroup >
                    </Toolbar >
                    <div style={{ padding: 10 }}>
                        <TextField
                            value={settings.rdpPreferedWidth}
                            name={"rdpPreferedWidth"}
                            type="number"
                            floatingLabelText="Width"
                            onChange={this.changeNumberSetting}
                        // errorText="pixels width to open new rdp connections"
                        /><br />
                        <TextField
                            value={settings.rdpPreferedHeight}
                            name={"rdpPreferedHeight"}
                            type="number"
                            floatingLabelText="Height"
                            onChange={this.changeNumberSetting}
                        /><br />
                        <TextField
                            value={settings.rdpPreferedX}
                            name={"rdpPreferedX"}
                            type="number"
                            floatingLabelText="X position"
                            onChange={this.changeNumberSetting}
                        /><br />
                        <TextField
                            value={settings.rdpPreferedY}
                            name={"rdpPreferedY"}
                            type="number"
                            floatingLabelText="Y position"
                            onChange={this.changeNumberSetting}
                        /><br />
                        <Toggle
                            label="Open rdp as fullscreen"
                            labelPosition="right"
                            toggled={settings.rdpPreferedFullscreen}
                            onToggle={(e, checked) => this.store.saveProfileSettings({ rdpPreferedFullscreen: checked })}
                            style={{marginTop: 14}}
                        /><br />
                        <TextField
                            value={settings.rdpSendKeyCombinations}
                            name={"rdpSendKeyCombinations"}
                            type="number" min={0} max={2} step={1}
                            floatingLabelText="Send key combinations"
                            onChange={this.changeNumberSetting}
                            errorText="0 never, 1 always, 2 only in fullscreen"
                            errorStyle={{color: muiTheme.textField && muiTheme.textField.hintColor}}
                        /><br />
                    </div>

                </Paper>
            </div>
        );
    }
}
