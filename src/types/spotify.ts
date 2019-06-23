export interface IListResponse<T> {
    items: T[];
}

export interface IPlaylist {
    name: string;
    id: string;
    href: string;
    tracksHref: string;
}

export interface IArtist {
    name: string;
}

export interface ITrack {
    name: string;
}
