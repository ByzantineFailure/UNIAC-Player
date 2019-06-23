import * as React from "react";
import * as ReactDOM from "react-dom";
import {Provider} from "react-redux";

import {Api} from "./api/spotify";
import {App} from "./components/app";
import {store} from "./state/reducer";

class AppHost extends React.Component<{}, {}> {
    public render() {
        return <Provider store={store}>
            <App />
        </Provider>;
    }
}

Api.getApi().getTracks();

ReactDOM.render(
    <AppHost />,
    document.getElementById("app-host")
);
