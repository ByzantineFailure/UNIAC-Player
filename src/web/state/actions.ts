import {Action} from "redux";

import {IGetTracklistResponse} from "../../types/api";

export interface ITypes {
    [key: string]: string;
}

export type Payloads = void|IGetTracklistResponse;

export interface IAction<T extends Payloads> extends Action {
    payload?: T;
}

export const TYPES: Readonly<ITypes> = {
    REQUEST_PLAYLIST: "Request Playlist",
    REQUEST_PLAYLIST_ERROR: "Request Playlist Error",
    REQUEST_PLAYLIST_SUCCESS: "Request Playlist Success",
};

export interface IRequestPlaylist extends IAction<void> {
    type: typeof TYPES.REQUEST_PLAYLIST;
}
export interface IRequestPlaylistSuccess extends IAction<IGetTracklistResponse> {
    type: typeof TYPES.REQUEST_PLAYLIST_SUCCESS;
    payload: IGetTracklistResponse;
}
export interface IRequestPlaylistError extends IAction<void> {
    type: typeof TYPES.REQUEST_PLAYLIST_SUCCESS;
}
