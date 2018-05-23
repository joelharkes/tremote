import * as React from "react";
import { observer } from "mobx-react";
import { VpnProcessDto, VpnStatus } from "../shared/interfaces";
import { Snackbar } from "material-ui";

@observer
export class OpenVpnView extends React.Component<{ vpn: VpnProcessDto, ondisconnect(vpn: VpnProcessDto) }> {
    ondisconnect = (e) => {
        this.props.ondisconnect(this.props.vpn);
    }
    render() {
        var { vpn, ondisconnect } = this.props;
        return (
            <Snackbar
                open={true}
                message={<span>{vpn.name} is {this.renderStatus(vpn.status)}</span>}
                action="disconnect"
                onActionClick={this.ondisconnect}
                onRequestClose={(r) => { }}
            />
        );
    }
    renderStatus(status: VpnStatus) {
        if (status === VpnStatus.Connected) {
            return <span style={{ color: "green" }}>Connected</span>;
        }
        if (status === VpnStatus.Loading) {
            return <span style={{ color: "yellow" }}>Loading...</span>;
        }
        if (status === VpnStatus.Failed) {
            return <span style={{ color: "red" }}>Failed</span>;
        }
        if (status === VpnStatus.Disconnected) {
            return <span style={{ color: "red" }}>Disconnected</span>;
        }
    }
}