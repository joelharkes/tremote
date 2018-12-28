// import * as boostrap from 'bootstrap'
import * as React from "react";
import { Store } from "./store";
import { inject, observer } from "mobx-react";
import { Paper, Toolbar } from "@material-ui/core";
import ActionHome from "@material-ui/icons/Refresh";

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
        return (
            <div style={{ padding: 10 }}>
                <Paper>
                    <Toolbar title="Logs">
                        <ActionHome onClick={this.store.loadLogs} />

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
