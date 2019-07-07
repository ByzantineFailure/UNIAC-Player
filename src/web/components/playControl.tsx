import * as React from "react";
import {connect} from "react-redux";
import {Action} from "redux";

import {Api} from "../api/spotify";
import {IState} from "../state/reducer";

export interface IPlayControlProps {
    isPlaying: boolean;
}

class RawPlayControl extends React.Component<IPlayControlProps, {}> {
    constructor(props: IPlayControlProps) {
        super(props);

        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.next = this.next.bind(this);
    }

    public play() {
        if (this.props.isPlaying) {
            return;
        }
        Api.getApi().startPlayback();
    }

    public pause() {
        if (!this.props.isPlaying) {
            return;
        }
        Api.getApi().pausePlayback();
    }

    public next() {
        if (!this.props.isPlaying) {
            return;
        }
        Api.getApi().skipTrack();
    }

    public render() {
        return(
            <div className="play-control-container">
                <i className="fa fa-play control" onClick={this.play} data-disabled={this.props.isPlaying}></i>
                <i className="fa fa-pause control" onClick={this.pause} data-disabled={!this.props.isPlaying}></i>
                <i className="fa fa-forward control" onClick={this.next} data-disabled={!this.props.isPlaying}></i>
            </div>
        );
    }
}

const mapStateToProps = (state: IState): IPlayControlProps => {
    return {
        isPlaying: state.isPlaying,
    };
};

const mapDispatchToProps = (dispatch: (a: Action) => void): {} => {
    return {};
};

export const PlayControl = connect(mapStateToProps, mapDispatchToProps)(RawPlayControl);
