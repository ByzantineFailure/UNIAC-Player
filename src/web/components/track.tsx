import * as React from "react";
import {connect} from "react-redux";
import {Action} from "redux";

import {ITrack} from "../../types/spotify";
import {Api} from "../api/spotify";
import {IState} from "../state/reducer";

export interface ITrackProps {
    disabled: boolean;
    index: number;
    playing: boolean;
    track: ITrack;
}

// export interface ITrackState {}

function artistName(track: ITrack) {
    return track.artists.map((artist) => artist.name).join(", ");
}

// TODO - Visual indicator of disabled on the remove link.
class RawTrack extends React.Component<ITrackProps, {}> {
    constructor(props: ITrackProps) {
        super(props);
        this.remove = this.remove.bind(this);
    }

    public remove() {
        if (!this.props.disabled) {
            Api.getApi().removeTrack(this.props.track.uri);
        }
    }

    public render() {
        return (
        <div className="track">
            <div className="track-playing">
                {!this.props.playing ? "" :
                    <i className="fa fa-volume-up playing-icon"></i>
                }
            </div>
            <div className="track-data-container">
                <div className="track-name">{this.props.track.name}</div>
                <div className="track-artist">{artistName(this.props.track)}</div>
            </div>
            <div className="track-remove" onClick={this.remove} data-disabled={this.props.disabled}>
                <i className="fa fa-trash remove-icon"></i>
            </div>
        </div>
        );
    }
}

const mapState = (state: IState, ownProps: ITrackProps): ITrackProps => {
    const track = state.playlistTracks![ownProps.index];
    const playingId = state.isPlaying && state.currentTrack ? state.currentTrack.id : null;
    const playing = playingId === track.id;

    return {
        disabled: state.loading || playing,
        index: ownProps.index,
        playing,
        track,
    };
};

const mapDispatch = (dispatch: (action: Action) => void) => ({});

export const Track = connect(mapState, mapDispatch)(RawTrack);
