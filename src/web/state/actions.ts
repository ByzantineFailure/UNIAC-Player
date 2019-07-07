import {Action} from "redux";

import {IGetPlayStateResponse, IGetTracklistResponse} from "../../types/api";

export interface ITypes {
    [key: string]: string;
}

export type Payloads = void|IGetPlayStateResponse|IGetTracklistResponse|string;

export interface IAction<T extends Payloads> extends Action {
    payload?: T;
}

export const TYPES: Readonly<ITypes> = {
    PAUSE_PLAYBACK: "Pause Playback",
    PAUSE_PLAYBACK_ERROR: "Pause Playback Error",
    PAUSE_PLAYBACK_SUCCESS: "Pause Playback Success",
    REMOVE_TRACK: "Remove Track",
    REMOVE_TRACK_ERROR: "Remove Track Error",
    REMOVE_TRACK_SUCCESS: "Remove Track Success",
    REQUEST_PLAYLIST: "Request Playlist",
    REQUEST_PLAYLIST_ERROR: "Request Playlist Error",
    REQUEST_PLAYLIST_SUCCESS: "Request Playlist Success",
    REQUEST_PLAYSTATE: "Request PlayState",
    REQUEST_PLAYSTATE_ERROR: "Request PlayState Error",
    REQUEST_PLAYSTATE_SUCCESS: "Request PlayState Success",
    SKIP_TRACK: "Skip Track",
    SKIP_TRACK_ERROR: "Skip Track Error",
    SKIP_TRACK_SUCCESS: "Skip Track Success",
    START_PLAYBACK: "Start Playback",
    START_PLAYBACK_ERROR: "Start Playback Error",
    START_PLAYBACK_SUCCESS: "Start Playback Success",
    SUBMIT_URI: "Submit URI",
    SUBMIT_URI_ERROR: "Submit URI Error",
    SUBMIT_URI_SUCCESS: "Submit URI Success",
};

export interface IPausePlayback extends IAction<void> {
    type: typeof TYPES.PAUSE_PLAYBACK;
}
export interface IPausePlaybackError extends IAction<void> {
    type: typeof TYPES.PAUSE_PLAYBACK_ERROR;
}
export interface IPausePlaybackSuccess extends IAction<IGetPlayStateResponse> {
    payload: IGetPlayStateResponse;
    type: typeof TYPES.PAUSE_PLAYBACK_SUCCESS;
}
export interface IRemoveTrack extends IAction<void> {
    type: typeof TYPES.REMOVE_TRACK;
}
export interface IRemoveTrackError extends IAction<void> {
    type: typeof TYPES.REMOVE_TRACK_ERROR;
}
export interface IRemoveTrackSuccess extends IAction<IGetTracklistResponse> {
    payload: IGetTracklistResponse;
    type: typeof TYPES.REMOVE_TRACK_SUCCESS;
}
export interface IRequestPlaylist extends IAction<void> {
    type: typeof TYPES.REQUEST_PLAYLIST;
}
export interface IRequestPlaylistSuccess extends IAction<IGetTracklistResponse> {
    payload: IGetTracklistResponse;
    type: typeof TYPES.REQUEST_PLAYLIST_SUCCESS;
}
export interface IRequestPlaylistError extends IAction<void> {
    type: typeof TYPES.REQUEST_PLAYLIST_SUCCESS;
}
export interface IRequestPlaystate extends IAction<void> {
    type: typeof TYPES.REQUEST_PLAYSTATE;
}
export interface IRequestPlaystateSuccess extends IAction<IGetPlayStateResponse> {
    payload: IGetPlayStateResponse;
    type: typeof TYPES.REQUEST_PLAYSTATE_SUCCESS;
}
export interface IRequestPlaystateError extends IAction<void> {
    type: typeof TYPES.REQUEST_PLAYSTATE_ERROR;
}
export interface ISkipTrack extends IAction<void> {
    type: typeof TYPES.SKIP_TRACK;
}
export interface ISkipTrackError extends IAction<void> {
    type: typeof TYPES.SKIP_TRACK_ERROR;
}
export interface ISkipTrackSuccess extends IAction<IGetPlayStateResponse> {
    payload: IGetPlayStateResponse;
    type: typeof TYPES.SKIP_TRACK_SUCCESS;
}
export interface IStartPlayback extends IAction<void> {
    type: typeof TYPES.START_PLAYBACK;
}
export interface IStartPlaybackError extends IAction<void> {
    type: typeof TYPES.START_PLAYBACK_ERROR;
}
export interface IStartPlaybackSuccess extends IAction<IGetPlayStateResponse> {
    type: typeof TYPES.START_PLAYBACK_SUCCESS;
    payload: IGetPlayStateResponse;
}
export interface ISubmitUri extends IAction<string> {
    payload: string;
    type: typeof TYPES.SUBMIT_URI;
}
export interface ISubmitUriSuccess extends IAction<IGetTracklistResponse> {
    payload: IGetTracklistResponse;
    type: typeof TYPES.SUBMIT_URI_SUCCESS;
}
export interface ISubmitUriError extends IAction<void> {
    type: typeof TYPES.SUBMIT_URI_ERROR;
}
