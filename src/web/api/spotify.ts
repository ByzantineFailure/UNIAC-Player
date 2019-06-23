import needle from "needle";
import {Store} from "redux";

import {GET_TRACKS_PATH} from "../../lib/paths";
import {IGetTracklistResponse} from "../../types/api";
import * as actions from "../state/actions";
import {IState, store as storeInstance} from "../state/reducer";

let api: Api|null = null;

export class Api {

    public static getApi(): Api {
        if (!api) {
            api = new Api(storeInstance);
        }

        return api;
    }

    constructor(private readonly store: Store<IState>) {}

    public getTracks(): void {
        this.store.dispatch({
            type: actions.TYPES.REQUEST_PLAYLIST,
        });
        needle.get(getRequestPath(GET_TRACKS_PATH),
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
}

function getRequestPath(path: string) {
    return `${window.location.protocol}//${window.location.host}${path}`;
}
