import { createStore } from "redux";

import {IGetTracklistResponse} from "../../types/api";
import {IPlaylist, ITrack} from "../../types/spotify";
import {IAction, Payloads, TYPES} from "./actions";

export interface IState {
    loading: boolean;
    playlist: IPlaylist|null;
    playlistTracks: ITrack[]|null;
    toSubmit: string|null;
}

const initialState: IState = {
    loading: false,
    playlist: null,
    playlistTracks: null,
    toSubmit: null
};

const reducer = (state: IState = initialState, action: IAction<Payloads>): IState => {
    console.log(action);
    switch (action.type) {
        case TYPES.REQUEST_PLAYLIST:
            return {
                ...state,
                loading: true
            };
        case TYPES.REQUEST_PLAYLIST_SUCCESS:
            const payload = action.payload as IGetTracklistResponse;
            return {
                ...state,
                loading: false,
                playlist: payload.playlist,
                playlistTracks: payload.tracks
            };
        case TYPES.REQUEST_PLAYLIST_ERROR:
            return {
                ...state,
                loading: false
            };
        default:
            return state;
    }
};

export const store = createStore(reducer);
