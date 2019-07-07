import React from "react";

import {Api} from "../api/spotify";

interface IUriInputState {
    value: string;
}

export class UriInput extends React.Component<{}, IUriInputState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            value: ""
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.addToFront = this.addToFront.bind(this);
    }

    public onChange(e: React.FormEvent<HTMLInputElement>) {
        this.setState({ value: e.currentTarget.value });
    }

    public onSubmit(e: React.FormEvent<{}>) {
        e.preventDefault();
        Api.getApi().submitTrackUri(this.state.value)
            .then(() => this.setState({ value: "" }));
    }

    public addToFront(e: React.FormEvent<{}>) {
        e.preventDefault();
        Api.getApi().submitTrackUri(this.state.value, true)
            .then(() => this.setState({ value: "" }));
    }

    public render() {
        return (
            <div className="uri-input-container">
                <form className="uri-input-form" onSubmit={this.onSubmit}>
                    <input className="uri-input" value={this.state.value} onChange={this.onChange} placeholder="Spotify URI"/>
                    <div className="button-row">
                        <button className="add-button" onClick={this.onSubmit}>Add</button>
                        <button className="add-to-front" onClick={this.addToFront}>Add next</button>
                    </div>
                </form>
            </div>
        );
    }
}
