import { createMuiTheme } from "@material-ui/core/styles";
// import baseTheme from "material-ui/styles/baseThemes/darkBaseTheme";
export const muiTheme = createMuiTheme({
  palette: {
    primary: {
      light: "#98ee99",
      main: "#66bb6a",
      dark: "#338a3e",
      contrastText: "#fff"
    },
    secondary: {
      light: "#ff6e60",
      main: "#e53835",
      dark: "#ab000d",
      contrastText: "#fff"
    }
  },
  // appBar: {
  //   height: 64,
  // },
});