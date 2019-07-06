import needle from "needle";

import {IAddTrackRequest, ICurrentPlayback, IListResponse, IPlaylist, IRawSpotifyTrack, IRemoveTrackRequest} from "../types/spotify";

import {Authentication} from "./handlers/auth";

const PLAYLIST_NAME = "UNIAC Web Player Playlist";
const PLAYLIST_REFRESH_INTERVAL = 15000;
const CURRENT_TRACK_REFRESH_INTERVAL = 10000;
const CLEAR_TRACK_INTERVAL = 500;

export class Spotify {
    private _currentTrack: IRawSpotifyTrack|null = null;
    private _currentTracklist: IRawSpotifyTrack[] = [];
    private _playlist: IPlaylist|null = null;

    private hasPlaylist: Promise<void>;
    private resolveHasPlaylist: () => void = () => {};

    private hasTracks: Promise<void>;
    private resolveHasTracks: () => void = () => {};

    private get playlistId() {
        return this._playlist ? this._playlist.id : null;
    }

    get playlist() {
        return Object.assign({}, this._playlist);
    }
    get currentTracklist() {
        return this._currentTracklist.slice(0);
    }
    get currentTrack() {
        return this._currentTrack ? Object.assign({}, this._currentTrack) : null;
    }

    constructor(private readonly auth: Authentication) {
        this.hasTracks = new Promise((resolve, reject) => {
            this.resolveHasTracks = resolve;
        });

        this.hasPlaylist = new Promise((resolve, reject) => {
            this.resolveHasPlaylist = resolve;
        });

        const getTracksReference = this.getTracksFromSpotify.bind(this);
        const getCurrentTrackReference = this.getCurrentTrack.bind(this);
        const clearTrackReference = this.removePlayedTrackFromPlaylist.bind(this);

        // No need to catch; the 'reject' method of the auth promise is never called.
        this.auth.onAuthenticated.then(async () => {
            this._playlist = await this.getPlayerPlaylist().catch((error) => {
                // Explicitly rethrow so the server dies until we have the playlist
                // TODO - fix this so we create it instead of dying
                throw error;
            });
            this.resolveHasPlaylist();

            await this.getTracksFromSpotify();
            this.resolveHasTracks();

            await this.getCurrentTrack();

            setInterval(getTracksReference, PLAYLIST_REFRESH_INTERVAL);
            setInterval(getCurrentTrackReference, CURRENT_TRACK_REFRESH_INTERVAL);
            setInterval(clearTrackReference, CLEAR_TRACK_INTERVAL);
        });
    }

    // Uses the local cached version so we don't overload our rate limits.
    public async getPlaylistTracks(): Promise<IRawSpotifyTrack[]> {
        await this.hasTracks;
        return this.currentTracklist;
    }

    public async addTrackToPlaylist(uri: string, addToStart: boolean = false): Promise<{}> {
        await this.hasPlaylist;
        const url = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`;
        let position: number|undefined;

        // If we have a track playing, add the track as the next up to play.
        // Otherwise add it to the front of the playlist.
        if (addToStart) {
            await this.getCurrentTrack();
            position = this.currentTrack === null ? 0 : 1;
        }

        const request: IAddTrackRequest = {
            position,
            uris: [uri],
        };

        return this.makeRequest("post", url, request);
    }

    public async removeTrackFromPlaylist(uri: string): Promise<{}> {
        await this.hasPlaylist;
        const url = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`;
        const request: IRemoveTrackRequest = {
            tracks: [{uri}]
        };

        console.log("Delete request", request);

        return this.makeRequest("delete", url, request);
    }

    // TODO - Create the playlist if it doesn't exist.  Requires getting the user's id.
    private async getPlayerPlaylist(): Promise<IPlaylist> {
        const response =
        await this.makeRequest<IListResponse<IPlaylist>>("get", "https://api.spotify.com/v1/me/playlists");
        const playlists = response.items;
        const foundPlaylist = playlists.find((playlist) => playlist.name === PLAYLIST_NAME);

        if (!foundPlaylist) {
            throw new Error("Playlist has not been instantiated!");
        }

        return foundPlaylist;
    }

    private async getTracksFromSpotify(): Promise<void> {
        await this.hasPlaylist;
        const url = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`;
        try {
            const response = await this.makeRequest<IListResponse<IRawSpotifyTrack>>("get", url);
            this._currentTracklist = response.items;
        } catch (error) {
            console.log("Error retrieving playlist tracks from spotify", error);
        }
    }

    private async getCurrentTrack(): Promise<void> {
        const url = `https://api.spotify.com/v1/me/player`;
        try {
            const response = await this.makeRequest<ICurrentPlayback>("get", url);
            this._currentTrack = response.item;
        } catch (error) {
            console.log("Error retrieving currently playing track", error);
        }
    }

    private async removePlayedTrackFromPlaylist(): Promise<void> {
        if (!this.currentTracklist || this.currentTracklist.length === 0) {
            console.log("No tracks in playlist");
            return;
        }

        const firstTrack = this.currentTracklist[0];
        console.log("First track", firstTrack);

        try {
            if (!this.currentTrack || this.currentTrack.track.id !== firstTrack.track.id) {
                console.log("Removing track from playlist");
                await this.removeTrackFromPlaylist(firstTrack.track.uri);
                this._currentTracklist = this.currentTracklist.slice(1);
            } else {
                console.log("Current track matches currently playing");
            }
        } catch (error) {
            console.log("Error clearing played track from playlist", error);
        }
    }

    private makeRequest<T>(method: needle.NeedleHttpVerbs, url: string, params: any = {}): Promise<T> {
        if (this.auth.needToAuth()) {
            throw new Error("Need to auth");
        }

        return needle(method, url, params, {
            headers: this.auth.getAccessHeaders()!,
            json: method !== "get",
        })
        .then((response) => response.body);
    }
}
