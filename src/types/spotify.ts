export interface IListResponse<T> {
    items: T[];
}

export interface IRawSpotifyTrack {
    added_at: string;
    track: ITrack;
}

export interface IPlaylist {
    name: string;
    id: string;
    href: string;
    tracksHref: string;
    uri: string;
}

export interface IArtist {
    id: string;
    name: string;
    uri: string;
}

export interface ITrack {
    artists: IArtist[];
    id: string;
    name: string;
    uri: string;
}
