import express from "express";
import {IPlaylist, ITrack} from "./spotify";

export type AsyncHandler = (req: express.Request, res: express.Response) => Promise<void>;
export type Handler = (req: express.Request, res: express.Response) => void;

//////////
// Generic
/////////
export interface IGenericStartPlaylistRequest {
  uri: string;
}

//////////
// Party mode
//////////
/**
 * Response object for the get tracks call.  There is no request body.
 */
export interface IGetTracklistResponse {
    playlist: IPlaylist;
    tracks: ITrack[];
}

/**
 * Request to add a track to the playlist.  Will add it to the back of the queue unless toFront is set
 * to true, in which case it will be added to the front of the queue.
 */
export interface IAddTrackRequest {
    uri: string;
    toFront: boolean;
}

export interface IAddTrackResponse {
    playlist: IPlaylist;
    tracks: ITrack[];
}

/**
 * Request object for removing a track from the playlist.
 */
export interface IRemoveTrackRequest {
    uri: string;
}

/**
 * Response object containing the current play state.
 */
export interface IGetPlayStateResponse {
    isPlaying: boolean;
    currentTrack: ITrack|null;
}

/**
 * Enum of possible error codes.
 */
export enum ErrorCodes {
    ALREADY_PLAYING,
    CANNOT_REMOVE_CURRENTLY_PLAYING,
    CANNOT_SKIP,
    MALFORMATTED_URI,
    NOT_PLAYING,
    UNKNOWN_URI,
}

/**
 * Error response object.
 */
export interface IErrorMessage {
    code: ErrorCodes;
    message: string;
}
