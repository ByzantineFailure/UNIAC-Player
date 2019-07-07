import * as React from "react";
import * as ReactDOM from "react-dom";
import {Provider} from "react-redux";

import {Api} from "./api/spotify";
import {App} from "./components/app";
import "./index.scss";
import {store} from "./state/reducer";

Api.createApi(store);

class AppHost extends React.Component<{}, {}> {
    public render() {
        return <Provider store={store}>
            <App />
        </Provider>;
    }
}

Api.getApi().getTracks();
Api.getApi().getPlayState();

ReactDOM.render(
    <AppHost />,
    document.getElementById("app-host")
);
