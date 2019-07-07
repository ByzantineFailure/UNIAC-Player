import React from "react";

import {LoadingBar} from "./loadingBar";
import {PlayControl} from "./playControl";
import {Tracklist} from "./tracklist";
import {UriInput} from "./uriInput";

export class App extends React.Component<{}, {}> {
    public render() {
        return <div className="app">
            <h1 className="title">UNIAC Web Control</h1>
            <LoadingBar />
            <PlayControl />
            <UriInput />
            <Tracklist />
        </div>;
    }
}
