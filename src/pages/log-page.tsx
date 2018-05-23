// import * as boostrap from 'bootstrap'
import * as React from "react";
import { Store } from "./store";
import { inject, observer } from "mobx-react";
import { Snackbar, Paper, TextField, RaisedButton, ToolbarGroup, Toolbar, ToolbarTitle, Toggle, FontIcon } from "material-ui";
import ActionHome from "material-ui/svg-icons/navigation/refresh";
interface Props {
    store?: Store;
}
interface State {
}

@inject("store")
@observer
export class LogPage extends React.Component<Props, State> {
    get store(): Store {
        return this.props.store as Store;
    }
    componentDidMount() {
        this.store.loadLogs();
    }
    render() {
        var settings = this.store.settings;
        return (
            <div style={{ padding: 10 }}>
                <Paper>
                    <Toolbar>
                        <ToolbarGroup>
                            <ToolbarTitle text="Logs" />
                        </ToolbarGroup >
                        <ToolbarGroup>
                            <ActionHome onClick={this.store.loadLogs} />
                        </ToolbarGroup >

                    </Toolbar >
                    <div id="console" style={{ padding: 10 }}>
                        {this.store.logs.map((x, index) => (
                            <div key={index} className={"level-" + x.level}>{x.message}</div>
                        ))}
                    </div>

                </Paper>
            </div>
        );
    }
}
