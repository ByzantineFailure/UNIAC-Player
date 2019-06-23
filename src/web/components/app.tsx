import React from "react";

import {Tracklist} from "./tracklist";

export class App extends React.Component<{}, {}> {
    public render() {
        return <div className="app">
            <Tracklist />
        </div>;
    }
}
