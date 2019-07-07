import needle from "needle";

import {IAddTrackRequest, ICreatePlaylistRequest, ICurrentPlayback, IListResponse, IPlaybackContext, IPlaylist, IRawSpotifyTrack, IRemoveTrackRequest, IUser} from "../types/spotify";

import {Authentication} from "./handlers/auth";

const PLAYLIST_NAME = "UNIAC Web Player Playlist";
const PLAYLIST_DESCRIPTION = "Playlist for control fom UNIAC Player";
const PLAYLIST_REFRESH_INTERVAL = 15000;
const CURRENT_TRACK_REFRESH_INTERVAL = 10000;
const CLEAR_TRACK_INTERVAL = 500;

// TODO - Ensure we're actually targetting the UNIAC when we hit play. (Devices)
export class Spotify {
    private _currentTrack: IRawSpotifyTrack|null = null;
    private _playbackContext: IPlaybackContext|null = null;
    private _currentTracklist: IRawSpotifyTrack[] = [];
    private _playlist: IPlaylist|null = null;
    private _isPlaying = false;

    private readonly hasPlaylist: Promise<void>;
    private resolveHasPlaylist: () => void = () => {};

    private readonly hasTracks: Promise<void>;
    private resolveHasTracks: () => void = () => {};

    private get playlistId() {
        return this._playlist ? this._playlist.id : null;
    }

    get currentTrack() {
        return this.isPlaying && this._currentTrack ? Object.assign({}, this._currentTrack) : null;
    }
    get currentTracklist() {
        return this._currentTracklist.slice(0);
    }
    get isPlaying() {
        return this._isPlaying
            && this._playbackContext
            && this._playbackContext.uri === (this._playlist ? this._playlist.uri : "FAKE_URI");
    }
    get playlist() {
        return Object.assign({}, this._playlist);
    }
    get playingAnotherPlaylist() {
        return this._isPlaying && this._currentTrack === null;
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

    public async addTrackToPlaylist(uri: string, addToStart: boolean = false): Promise<IRawSpotifyTrack[]> {
        await this.hasPlaylist;
        const url = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`;
        let position: number|undefined;

        // If we have a track playing, add the track as the next up to play.
        // Otherwise add it to the front of the playlist.
        if (addToStart && this.currentTracklist.length > 0) {
            await this.getCurrentTrack();
            position = this.currentTrack === null ? 0 : 1;
        }

        const request: IAddTrackRequest = {
            position,
            uris: [uri],
        };

        await this.makeRequest("post", url, request);

        // We have to get the track from the uri to add to the playlist via the api anyway,
        // so just refresh the entire thing instead of doing the work of managing the array.
        await this.getTracksFromSpotify();

        return this.currentTracklist;
    }

    public async removeTrackFromPlaylist(uri: string): Promise<IRawSpotifyTrack[]> {
        await this.hasPlaylist;
        const url = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`;
        const request: IRemoveTrackRequest = {
            tracks: [{uri}]
        };

        await this.makeRequest("delete", url, request);

        // Update the playlist
        this._currentTracklist = this._currentTracklist.filter((track) => track.track.uri !== uri);

        return this.currentTracklist;
    }

    public async nextTrack(): Promise<void> {
        await this.hasPlaylist;
        const url = `https://api.spotify.com/v1/me/player/next`;

        await this.makeRequest("post", url);
        await this.getCurrentTrack();
    }

    public async startPlayback(): Promise<void> {
        await this.hasPlaylist;

        const url = "https://api.spotify.com/v1/me/player/play";

        await this.makeRequest("put", url, {
           context_uri: this.playlist.uri,
        });

        await this.getCurrentTrack();
    }

    public async pausePlayback(): Promise<void> {
        await this.hasPlaylist;

        const url = `https://api.spotify.com/v1/me/player/pause`;
        await this.makeRequest("put", url);

        await this.getCurrentTrack();
    }

    private async getPlayerPlaylist(): Promise<IPlaylist> {
        const response =
        await this.makeRequest<IListResponse<IPlaylist>>("get", "https://api.spotify.com/v1/me/playlists");
        const playlists = response.items;
        let foundPlaylist = playlists.find((playlist) => playlist.name === PLAYLIST_NAME);

        if (!foundPlaylist) {
            foundPlaylist = await this.createPlayerPlaylist();
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
        await this.hasPlaylist;

        const url = `https://api.spotify.com/v1/me/player`;
        try {
            const response = await this.makeRequest<ICurrentPlayback>("get", url);

            this._currentTrack = response.item ? { track: response.item } : null;
            this._isPlaying = response.is_playing;
            this._playbackContext = response.context;
        } catch (error) {
            console.log("Error retrieving currently playing track", error);
        }
    }

    private async removePlayedTrackFromPlaylist(): Promise<void> {
        if (!this.currentTracklist || this.currentTracklist.length === 0 || !this.isPlaying) {
            return;
        }

        const firstTrack = this.currentTracklist[0];

        try {
            if (this.currentTrack!.track.id !== firstTrack.track.id) {
                await this.removeTrackFromPlaylist(firstTrack.track.uri);
            }
        } catch (error) {
            console.log("Error clearing played track from playlist", error);
        }
    }

    private async createPlayerPlaylist(): Promise<IPlaylist> {
        const user = await this.getUser();
        const userId = user.id;
        const url = `https://api.spotify.com/v1/users/${userId}/playlists`;

        const request: ICreatePlaylistRequest = {
            description: PLAYLIST_DESCRIPTION,
            name: PLAYLIST_NAME,
        };

        return await this.makeRequest<IPlaylist>("post", url, request);
    }

    private async getUser(): Promise<IUser> {
        const url = `https://api.spotify.com/v1/me`;
        return await this.makeRequest<IUser>("get", url);
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
