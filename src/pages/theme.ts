import getMuiTheme from "material-ui/styles/getMuiTheme";
import { cyan500 } from "material-ui/styles/colors";
// import baseTheme from "material-ui/styles/baseThemes/darkBaseTheme";
export const muiTheme = getMuiTheme( {
    "palette": {
        "primary1Color": "#009688",
        "primary2Color": "#00796b",
        "accent1Color": "#ff5722",
    },
    appBar: {
      height: 64,
    },
  });