import needle from "needle";

import {IListResponse, IPlaylist, IRawSpotifyTrack} from "../types/spotify";

import {Authentication} from "./handlers/auth";

export class Spotify {
    constructor(private readonly auth: Authentication) {}

    public async getPlaylists(): Promise<IPlaylist[]> {
        const response =
        await this.makeGetRequest<IListResponse<IPlaylist>>("https://api.spotify.com/v1/me/playlists");
        return response.items;
    }

    public async getPlaylistTracks(playlistId: string): Promise<IRawSpotifyTrack[]> {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        const response = await this.makeGetRequest<IListResponse<IRawSpotifyTrack>>(url);
        return response.items;
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
