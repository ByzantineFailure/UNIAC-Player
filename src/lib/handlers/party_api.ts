import {Express, Response} from "express";
import {Spotify} from "../spotify";

import {AsyncHandler, ErrorCodes, Handler, IAddTrackRequest, IErrorMessage, IGetPlayStateResponse} from "../../types/api";
import * as Paths from "../paths";
import { Authentication, redirectForAuth } from "./auth";

const TRACK_URI_REGEX = /spotify:track:(.+)/.compile();

// Also handles setting the error states and sending the error object.  If false, stop handler.
// Realistically this should be a middleware but I'm too lazy to restructure things right now.
function trackUriIsValid(uri: string, response: Response): boolean {
    if (!uri || !TRACK_URI_REGEX.test(uri)) {
        response.status(400);
        response.send({
            code: ErrorCodes.MALFORMATTED_URI,
            message: 'Missing or malformatted URI, please ensure your uri matches "spotify:track:ID"'
        });
        response.end();
        return false;
    }

    return true;
}

async function sendTracksAsResponse(spotify: Spotify, response: Response) {
    const rawTracks = await spotify.getPartyPlaylistTracks();
    const tracks = rawTracks.map((rawTrack) => rawTrack.track);
    const playlist = spotify.playlist;

    response.status(200);
    response.send({
        playlist,
        tracks
    });
    response.end();
}

function sendPlaystateAsReponse(spotify: Spotify, response: Response) {
    const responseBody: IGetPlayStateResponse = {
        currentTrack: spotify.currentTrack ? spotify.currentTrack.track : null,
        isPlaying: !!spotify.isPlaying,
    };
    response.status(200);
    response.send(responseBody);
    response.end();
}

function getTracklistHandler(spotify: Spotify): AsyncHandler {
    return async (req, res) => {
        try {
            sendTracksAsResponse(spotify, res);
        } catch (error) {
            res.status(500);
            res.send(error);
            res.end();
        }
    };
}

function addTrackHandler(spotify: Spotify): AsyncHandler {
    return async (req, res)  => {
        const request: IAddTrackRequest = req.body;

        if (!trackUriIsValid(request.uri, res)) {
            return;
        }

        try {
            await spotify.addTrackToPlaylist(request.uri, request.toFront);
            sendTracksAsResponse(spotify, res);
        } catch (error) {
            // TODO figure out needle's error response object and give 404 for an unknown uri.
            console.log(error);
            res.status(500);
            res.send(error);
            res.end();
        }
    };
}

function removeTrackHandler(spotify: Spotify): AsyncHandler {
    return async (req, res) => {
        const request: IAddTrackRequest = req.body;

        if (!trackUriIsValid(request.uri, res)) {
            return;
        }

        if (spotify.currentTrack && spotify.currentTrack.track.uri === request.uri) {
            const errorResponse: IErrorMessage = {
                code: ErrorCodes.CANNOT_REMOVE_CURRENTLY_PLAYING,
                message: "Cannot remove the currently playing track!",
            };
            res.status(400);
            res.send(errorResponse);
            res.end();
            return;
        }

        try {
            await spotify.removeTrackFromPlaylist(request.uri);
            sendTracksAsResponse(spotify, res);
        } catch (error) {
            // TODO figure out needle's error response object and give 404 for an unknown uri.
            console.log(error);
            res.status(500);
            res.send(error);
            res.end();
        }
    };
}

function getCurrentTrackHandler(spotify: Spotify): Handler {
    return (req, res) => {
        sendPlaystateAsReponse(spotify, res);
    };
}

function nextTrackHandler(spotify: Spotify): AsyncHandler {
    return async (req, res) => {
        if (spotify.currentTrack === null || spotify.currentTracklist.length <= 1) {
            const errorResponse = {
                code: ErrorCodes.CANNOT_SKIP,
                message: "Cannot skip track; no track playing or not enough tracks in queue",
            };
            res.send(errorResponse);
            res.status(400);
            res.end();
            return;
        }

        await spotify.partyNextTrack();
        sendPlaystateAsReponse(spotify, res);
    };
}

function startPlaybackHandler(spotify: Spotify): AsyncHandler {
    return async (req, res) => {
        if (spotify.currentTrack !== null && spotify.isPlaying) {
            const errorMessage: IErrorMessage = {
                code: ErrorCodes.ALREADY_PLAYING,
                message: "Already playing, cannot "
            };
            res.status(400);
            res.send(errorMessage);
            res.end();
            return;
        }

        await spotify.partyStartPlayback();
        sendPlaystateAsReponse(spotify, res);
    };
}

function pausePlaybackHandler(spotify: Spotify): AsyncHandler {
    return async (req, res) => {
        if (spotify.currentTrack === null) {
            const errorMessage: IErrorMessage = {
                code: ErrorCodes.NOT_PLAYING,
                message: "Not playing right now, cannot pause",
            };
            res.status(400);
            res.send(errorMessage);
            res.end();
            return;
        }

        await spotify.partyPausePlayback();
        sendPlaystateAsReponse(spotify, res);
    };
}

export function registerPartyHandlers(app: Express, spotify: Spotify, auth: Authentication) {
    app.get(Paths.PARTY_GET_TRACKS_PATH, redirectForAuth(auth, getTracklistHandler(spotify)));
    app.put(Paths.PARTY_ADD_TRACK_PATH, redirectForAuth(auth, addTrackHandler(spotify)));
    app.delete(Paths.PARTY_REMOVE_TRACK_PATH, redirectForAuth(auth, removeTrackHandler(spotify)));
    app.get(Paths.PARTY_GET_CURRENT_TRACK_PATH, redirectForAuth(auth, getCurrentTrackHandler(spotify)));
    app.post(Paths.PARTY_NEXT_TRACK_PATH, redirectForAuth(auth, nextTrackHandler(spotify)));
    app.post(Paths.PARTY_PLAY_PATH, redirectForAuth(auth, startPlaybackHandler(spotify)));
    app.post(Paths.PARTY_PAUSE_PATH, redirectForAuth(auth, pausePlaybackHandler(spotify)));
}
