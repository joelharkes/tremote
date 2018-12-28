// import * as boostrap from 'bootstrap'
import * as React from "react";
import { Store } from "./store";
import { inject, observer } from "mobx-react";
import { Paper, TextField,  Toolbar, Switch } from "@material-ui/core";

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
    changeNumberSetting = (e: React.ChangeEvent<HTMLInputElement>) => {
        var name = e.currentTarget.name;
        var part = {};
        part[name] = e.target.value;
        return this.store.saveProfileSettings(part);
    }
    render() {
        var settings = this.store.settings;
        return (
            <div style={{ padding: 10 }}>
                <Paper>
                    <Toolbar title="Rdp settings">
                    </Toolbar >
                    <div style={{ padding: 10 }}>
                        <TextField
                            value={settings.rdpPreferedWidth}
                            name={"rdpPreferedWidth"}
                            type="number"
                            label="Width"
                            onChange={this.changeNumberSetting}
                        // errorText="pixels width to open new rdp connections"
                        /><br />
                        <TextField
                            value={settings.rdpPreferedHeight}
                            name={"rdpPreferedHeight"}
                            type="number"
                            label="Height"
                            onChange={this.changeNumberSetting}
                        /><br />
                        <TextField
                            value={settings.rdpPreferedX}
                            name={"rdpPreferedX"}
                            type="number"
                            label="X position"
                            onChange={this.changeNumberSetting}
                        /><br />
                        <TextField
                            value={settings.rdpPreferedY}
                            name={"rdpPreferedY"}
                            type="number"
                            label="Y position"
                            onChange={this.changeNumberSetting}
                        /><br />
                        <Switch
                            checked={settings.rdpPreferedFullscreen}
                            onChange={(e, checked) => this.store.saveProfileSettings({ rdpPreferedFullscreen: checked })}
                        />Open rdp as fullscreen<br />
                        <TextField
                            value={settings.rdpSendKeyCombinations}
                            name={"rdpSendKeyCombinations"}
                            type="number" 
                            // min={0} max={2} step={1}
                            label="Send key combinations (0,1,2)"
                            onChange={this.changeNumberSetting}
                            // errorText="0 never, 1 always, 2 only in fullscreen"
                            // errorStyle={{color: muiTheme.palette.text.primary && muiTheme.textField.hintColor}}
                        /><br />
                    </div>

                </Paper>
            </div>
        );
    }
}
