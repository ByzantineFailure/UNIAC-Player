import needle from "needle";

import {IListResponse, IPlaylist, ITrack} from "../types/spotify";

import {Authentication} from "./auth";

// const PLAYLIST_NAME = "Web Playlist";

export class Spotify {
    constructor(private readonly auth: Authentication) {}

    public getPlaylists(): Promise<IPlaylist[]> {
        return new Promise((resolve, reject) => {
            this.makeGetRequest<IListResponse<IPlaylist>>("https://api.spotify.com/v1/me/playlists")
            .then((result: IListResponse<IPlaylist>) => {
                resolve(result.items);
            }).catch((err: Error) => {
                reject(err);
            });
        });
    }

    public getPlaylistTracks(playlistId: string): Promise<ITrack[]> {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        return new Promise((resolve, reject) => {
            this.makeGetRequest<IListResponse<ITrack>>(url).then(( result: IListResponse<ITrack>) => {
                resolve(result.items);
            }).catch((err: Error) => {
                reject(err);
            });
        });
    }

    private makeGetRequest<T>(url: string): Promise<T> {
        return new Promise((resolve, reject) => {
            if (this.auth.needToAuth()) {
                reject(new Error("Need to auth"));
            }

            needle.get(url, {
                headers: this.auth.getAccessHeaders()!
            }, (error: Error|null, response: needle.NeedleResponse, body: T) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    }
                    resolve(body);
            });
        });
    }
}
