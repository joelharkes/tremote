import { Provider } from "mobx-react";
import * as React from "react";
import { render } from "react-dom";
import { App } from "./app";
import { Store, Stores } from "./store";
import "../styles/style.scss";

var store = new Store();
var stores = { store } as Stores;
const rootEl = document.getElementById("root");
render(
    <Provider {...stores} >
        <App />
    </Provider >,
    rootEl,
);