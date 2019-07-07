import React, {FunctionComponent} from "react";
import {connect} from "react-redux";
import {Action} from "redux";

import {ITrack} from "../../types/spotify";
import {IState} from "../state/reducer";
import {Track} from "./track";

interface ITracklistProps {
    tracks: ITrack[]|null;
}

const TracklistDisplay: FunctionComponent<ITracklistProps> = ({tracks}: ITracklistProps) =>
    <div className="tracklist">
        <h1>Playlist</h1>
        { tracks && tracks.length > 0 ?
            tracks.map((track, index) =>
                <Track key={track.id + index} disabled={false} index={index} track={track} playing={false}/>
            ) :
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
