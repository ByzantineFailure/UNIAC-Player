import needle from "needle";
import {Store} from "redux";

import {PARTY_ADD_TRACK_PATH, PARTY_GET_CURRENT_TRACK_PATH, PARTY_GET_TRACKS_PATH, PARTY_NEXT_TRACK_PATH, PARTY_PAUSE_PATH, PARTY_PLAY_PATH, PARTY_REMOVE_TRACK_PATH} from "../../lib/paths";
import {IAddTrackRequest, IGetPlayStateResponse, IGetTracklistResponse, IRemoveTrackRequest} from "../../types/api";
import * as actions from "../state/actions";
import {IState} from "../state/reducer";

let api: Api|null = null;

const REFRESH_POLL_INTERVAL = 3000;

export class Api {

    public static createApi(store: Store<IState>) {
        if (api) {
            console.warn("Trying to instantiate more than one copy of API!");
            console.trace();
            return;
        }
        api = new Api(store);
    }

    public static getApi(): Api {
        if (!api) {
            throw new Error("Api not created!");
        }

        return api;
    }

    private constructor(private readonly store: Store<IState>) {
        setInterval(this.getPlayState.bind(this), REFRESH_POLL_INTERVAL);
        setInterval(this.getTracks.bind(this), REFRESH_POLL_INTERVAL);
    }

    public getTracks(): void {
        this.store.dispatch({
            type: actions.TYPES.REQUEST_PLAYLIST,
        });
        needle.get(getRequestPath(PARTY_GET_TRACKS_PATH),
            (error: Error|null, response: needle.NeedleResponse, body: IGetTracklistResponse) => {
            if (error) {
                console.log(error);
                this.store.dispatch({
                    type: actions.TYPES.REQUEST_PLAYLIST_ERROR,
                });
                return;
            }

            this.store.dispatch({
                payload: body,
                type: actions.TYPES.REQUEST_PLAYLIST_SUCCESS,
            });
        });
    }

    public submitTrackUri(uri: string, toFront: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            this.store.dispatch({
                payload: uri,
                type: actions.TYPES.SUBMIT_URI,
            });

            const requestBody: IAddTrackRequest = {
                toFront,
                uri,
            };

            needle.put(getRequestPath(PARTY_ADD_TRACK_PATH), requestBody, {json: true},
                (error: Error|null, response: needle.NeedleResponse, body: IGetTracklistResponse) => {
                if (error) {
                    console.log(error);
                    this.store.dispatch({
                        type: actions.TYPES.SUBMIT_URI_ERROR,
                    });
                    reject(error);
                    return;
                }

                this.store.dispatch({
                    payload: body,
                    type: actions.TYPES.SUBMIT_URI_SUCCESS,
                });
                resolve();
            });
        });
    }

    public getPlayState() {
        this.store.dispatch({
            type: actions.TYPES.REQUEST_PLAYSTATE,
        });

        needle.get(getRequestPath(PARTY_GET_CURRENT_TRACK_PATH),
            (error: Error|null, response: needle.NeedleResponse, body: IGetPlayStateResponse) => {
            if (error) {
                console.log(error);
                this.store.dispatch({
                    type: actions.TYPES.REQUEST_PLAYSTATE_ERROR,
                });
                return;
            }

            this.store.dispatch({
                payload: body,
                type: actions.TYPES.REQUEST_PLAYSTATE_SUCCESS,
            });
        });
    }

    public removeTrack(uri: string) {
        this.store.dispatch({
            type: actions.TYPES.REMOVE_TRACK
        });

        const requestBody: IRemoveTrackRequest = {
            uri,
        };

        needle.delete(getRequestPath(PARTY_REMOVE_TRACK_PATH), requestBody, {json: true},
            (error: Error|null, response: needle.NeedleResponse, body: IGetTracklistResponse) => {
                if (error) {
                    console.log(error);
                    this.store.dispatch({
                        type: actions.TYPES.REMOVE_TRACK_ERROR,
                    });
                    return;
                }

                this.store.dispatch({
                    payload: body,
                    type: actions.TYPES.REMOVE_TRACK_SUCCESS
                });
            });
    }

    public startPlayback() {
        this.store.dispatch({
            type: actions.TYPES.START_PLAYBACK,
        });
        needle.post(getRequestPath(PARTY_PLAY_PATH), {}, {json: true},
            (error: Error|null, response: needle.NeedleResponse, body: IGetPlayStateResponse) => {
            if (error) {
                console.log(error);
                this.store.dispatch({
                    type: actions.TYPES.START_PLAYBACK_ERROR,
                });
                return;
            }

            this.store.dispatch({
                payload: body,
                type: actions.TYPES.START_PLAYBACK_SUCCESS,
            });
        });
    }

    public pausePlayback() {
        this.store.dispatch({
            type: actions.TYPES.PAUSE_PLAYBACK,
        });
        needle.post(getRequestPath(PARTY_PAUSE_PATH), {}, {json: true},
            (error: Error|null, response: needle.NeedleResponse, body: IGetPlayStateResponse) => {
            if (error) {
                console.log(error);
                this.store.dispatch({
                    type: actions.TYPES.PAUSE_PLAYBACK_ERROR,
                });
                return;
            }

            this.store.dispatch({
                payload: body,
                type: actions.TYPES.PAUSE_PLAYBACK_SUCCESS,
            });
        });
    }

    public skipTrack() {
        this.store.dispatch({
            type: actions.TYPES.SKIP_TRACK,
        });

        needle.post(getRequestPath(PARTY_NEXT_TRACK_PATH), {}, {json: true},
            (error: Error|null, response: needle.NeedleResponse, body: IGetPlayStateResponse) => {
            if (error) {
                console.log(error);
                this.store.dispatch({
                    type: actions.TYPES.SKIP_TRACK_ERROR,
                });
                return;
            }

            this.store.dispatch({
                payload: body,
                type: actions.TYPES.SKIP_TRACK_SUCCESS,
            });
        });
    }
}

function getRequestPath(path: string) {
    return `${window.location.protocol}//${window.location.host}${path}`;
}
