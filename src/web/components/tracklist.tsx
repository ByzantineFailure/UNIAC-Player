import React, {FunctionComponent} from "react";
import {connect} from "react-redux";
import {Action} from "redux";

import {ITrack} from "../../types/spotify";
import {IState} from "../state/reducer";

interface ITracklistProps {
    tracks: ITrack[]|null;
}

const Track: FunctionComponent<ITrack> = (track: ITrack) =>
    <div className="track">
        <span>{track.name} - {(track.artists[0].name)}</span>
    </div>;

const TracklistDisplay: FunctionComponent<ITracklistProps> = ({tracks}: ITracklistProps) =>
    <div className="tracklist">
        <h1>Tracks in the playlist</h1>
        { tracks && tracks.length > 0 ?
            tracks.map((listTrack) => Track(listTrack)) :
            <span> No tracks available</span>
        }
    </div>;

const mapStateToProps = (state: IState): ITracklistProps => ({
    tracks: state.playlistTracks
});

const mapDispatchToProps = (dispatch: (action: Action) => void) => ({});

export const Tracklist = connect(
    mapStateToProps,
    mapDispatchToProps
)(TracklistDisplay);
