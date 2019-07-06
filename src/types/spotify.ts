export interface IListResponse<T> {
    items: T[];
}

export interface IRawSpotifyTrack {
    added_at: string;
    track: ITrack;
}

export interface ICurrentPlayback {
    item: IRawSpotifyTrack|null;
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

export interface ITrackReorderRequest {
    range_start: number;
    range_length?: number;
    insert_before: number;
    snapshot_id?: string;
}

export interface IAddTrackRequest {
    uris: string[];
    position?: number;
}

export interface IRemoveTrackRequest {
    tracks: Array<{
        uri: string;
        positions?: number[];
    }>;
}
