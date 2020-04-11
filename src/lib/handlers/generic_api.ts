import {Express, Response} from "express";
import {Spotify} from "../spotify";

import {AsyncHandler, IGenericStartPlaylistRequest} from "../../types/api";
import * as Paths from "../paths";
import { Authentication, redirectForAuth } from "./auth";

function genericHandler(operation: () => Promise<any>): AsyncHandler {
  return async (req, res) => {
    let value: any;

    try {
      value = await operation();
    } catch (ex) {
      handleError(ex, res);
      return;
    }

    res.status(200);
    if (value) {
      res.send(value);
    }
    res.end();
    return;
  };
}

function handleError(ex: Error, res: Response)  {
    res.status(500);
    res.send(ex);
    res.end();
}

function getPlaylists(spotify: Spotify) {
  return genericHandler(async () => await spotify.getPlaylists());
}

function nextTrack(spotify: Spotify) {
  return genericHandler(async () => await spotify.nextTrack());
}

function previousTrack(spotify: Spotify) {
  return genericHandler(async () => await spotify.previousTrack());
}

function pause(spotify: Spotify) {
  return genericHandler(async () => await spotify.pausePlayback());
}

function play(spotify: Spotify) {
  return genericHandler(async () => await spotify.startPlayback());
}

function startPlaylist(spotify: Spotify): AsyncHandler {
  return async (req, res) => {
    const request: IGenericStartPlaylistRequest = req.body;

    console.log(`Starting playlist with uri ${request}`);

    try {
      await spotify.startPlaylist(request.uri);
      res.status(200);
      res.end();
    } catch (ex) {
      handleError(ex, res);
    }
  };
}

export function registerGenericApiHandlers(app: Express, spotify: Spotify, auth: Authentication) {
  app.get(Paths.GENERIC_GET_PLAYLISTS_PATH, redirectForAuth(auth, getPlaylists(spotify)));
  app.post(Paths.GENERIC_NEXT_TRACK_PATH, redirectForAuth(auth, nextTrack(spotify)));
  app.post(Paths.GENERIC_PREVIOUS_TRACK_PATH, redirectForAuth(auth, previousTrack(spotify)));
  app.post(Paths.GENERIC_PAUSE_PATH, redirectForAuth(auth, pause(spotify)));
  app.post(Paths.GENERIC_PLAY_PATH, redirectForAuth(auth, play(spotify)));
  app.post(Paths.GENERIC_START_PLAYLIST_PATH, redirectForAuth(auth, startPlaylist(spotify)));
}
