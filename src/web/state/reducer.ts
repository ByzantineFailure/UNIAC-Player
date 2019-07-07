import { createStore } from "redux";

import {IGetPlayStateResponse, IGetTracklistResponse} from "../../types/api";
import {IPlaylist, ITrack} from "../../types/spotify";
import {IAction, Payloads, TYPES} from "./actions";

export interface IState {
    currentTrack: ITrack|null;
    isPlaying: boolean;
    loading: boolean;
    playlist: IPlaylist|null;
    playlistTracks: ITrack[]|null;
    toSubmit: string|null;
}

const initialState: IState = {
    currentTrack: null,
    isPlaying: false,
    loading: false,
    playlist: null,
    playlistTracks: null,
    toSubmit: null
};

const reducer = (state: IState = initialState, action: IAction<Payloads>): IState => {
    console.log(action);
    switch (action.type) {
        case TYPES.PAUSE_PLAYBACK:
        case TYPES.REMOVE_TRACK:
        case TYPES.REQUEST_PLAYLIST:
        case TYPES.REQUEST_PLAYSTATE:
        case TYPES.SKIP_TRACK:
        case TYPES.START_PLAYBACK:
        case TYPES.SUBMIT_URI:
            return {
                ...state,
                loading: true
            };
        case TYPES.REMOVE_TRACK_SUCCESS:
        case TYPES.REQUEST_PLAYLIST_SUCCESS:
        case TYPES.SUBMIT_URI_SUCCESS:
            const tracklist = action.payload as IGetTracklistResponse;
            const newState = {
                ...state,
                loading: false,
                playlist: tracklist.playlist,
                playlistTracks: tracklist.tracks
            };
            return newState;
        case TYPES.PAUSE_PLAYBACK_SUCCESS:
        case TYPES.REQUEST_PLAYSTATE_SUCCESS:
        case TYPES.SKIP_TRACK_SUCCESS:
        case TYPES.START_PLAYBACK_SUCCESS:
            const playState = action.payload as IGetPlayStateResponse;
            return {
                ...state,
                currentTrack: playState.currentTrack,
                isPlaying: playState.isPlaying,
                loading: false,
            };
        case TYPES.PAUSE_PLAYBACK_ERROR:
        case TYPES.REQUEST_PLAYLIST_ERROR:
        case TYPES.REQUEST_PLAYSTATE_ERROR:
        case TYPES.REMOVE_TRACK_ERROR:
        case TYPES.SKIP_TRACK_ERROR:
        case TYPES.START_PLAYBACK_ERROR:
        case TYPES.SUBMIT_URI_ERROR:
            return {
                ...state,
                loading: false
            };
        default:
            return state;
    }
};

export const store = createStore(reducer);
