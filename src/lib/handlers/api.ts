import {Express} from "express";
import {Spotify} from "../spotify";

import {AsyncHandler} from "../../types/api";
import {IPlaylist} from "../../types/spotify";
import * as Paths from "../paths";
import { Authentication, redirectForAuth } from "./auth";

const PLAYLIST_NAME = "UNIAC Web Player Playlist";

let playerPlaylist: IPlaylist|null = null;

async function getPlaylist(spotify: Spotify): Promise<IPlaylist> {
    if (playerPlaylist) {
        return playerPlaylist;
    }

    const playlists = await spotify.getPlaylists();
    const foundPlaylist = playlists.find((playlist) => playlist.name === PLAYLIST_NAME);

    if (!foundPlaylist) {
        throw new Error("Playlist has not been instantiated!");
    }

    playerPlaylist = foundPlaylist;
    return foundPlaylist;
}

export function getTracklistHandler(spotify: Spotify): AsyncHandler {
    return async (req, res) => {
        try {
            const playlist = await getPlaylist(spotify);
            const rawTracks = await spotify.getPlaylistTracks(playlist.id);
            console.log(rawTracks);

            const tracks = rawTracks.map((rawTrack) => rawTrack.track);

            res.status(200);
            res.send({
                playlist,
                tracks,
            });
            res.end();
        } catch (error) {
            res.status(500);
            res.send(error);
            res.end();
        }
    };
}

export function registerHandlers(app: Express, spotify: Spotify, auth: Authentication) {
    app.use(Paths.GET_TRACKS_PATH, redirectForAuth(auth, getTracklistHandler(spotify)));
}
