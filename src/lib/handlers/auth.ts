import * as express from "express";
import needle from "needle";
import querystring from "querystring";
import {URL} from "url";

import * as Credentials from "../../credentials";

const REQUEST_TOKEN_URL = "https://accounts.spotify.com/authorize";
const REDIRECT_PATH = "/access_token";

const REQUEST_TOKEN_PARAM = "code";

const ENCODED_SECRETS = new Buffer(`${Credentials.CLIENT_ID}:${Credentials.CLIENT_SECRET}`).toString("base64");

export class Authentication {
    public onAuthenticated: Promise<void>;

    private readonly redirectUrl: string;
    private accessToken: string|null = null;
    private refreshToken: string|null = null;

    constructor(
        hostname: string,
        https: boolean = false,
        port: number|null = null,
    ) {
        const protocol =  https ? "https:" : "http:";
        const urlConstructor = new URL(`${protocol}//${hostname}`);
        urlConstructor.pathname = REDIRECT_PATH;

        if (!!port) {
            urlConstructor.port = port + "";
        }

        this.redirectUrl = urlConstructor.href;

        this.onAuthenticated = new Promise((resolve, reject) => {
            this.resolveAuth = resolve;
        });
    }

    public needToAuth(): boolean {
        return !this.accessToken;
    }

    public getAccessHeaders(): {}|null {
        if (this.accessToken) {
            return { Authorization: `Bearer ${this.accessToken}` };
        } else {
            return null;
        }
    }

    public getRequestTokenHandler(req: express.Request, res: express.Response): void {
        const query = {
            client_id: Credentials.CLIENT_ID,
            redirect_uri: this.redirectUrl,
            response_type: "code",
            scope: Credentials.SCOPES,
        };

        const tokenRedirectUrl = REQUEST_TOKEN_URL + "?" + querystring.stringify(query);

        res.redirect(301, tokenRedirectUrl);
        res.end();
    }

    // TODO - prevent this from re-authing if we've already got authentication handled.
    // We can get into a real nasty state if we don't do that.
    public getAccessTokenHandler(req: express.Request, res: express.Response): void {
        if (!req.query[REQUEST_TOKEN_PARAM]) {
            console.log(req.query);
            res.status(400).send('No value found for "code" query param');
            res.end();
            return;
        }

        const requestBody = querystring.stringify({
            code: req.query[REQUEST_TOKEN_PARAM],
            grant_type: "authorization_code",
            redirect_uri: this.redirectUrl,
        });

        needle.post("https://accounts.spotify.com/api/token", requestBody,
            { headers: { Authorization: `Basic ${ENCODED_SECRETS}` } },
            (error: Error|null, response: needle.NeedleResponse, body: {
                access_token: string,
                token_type: string,
                scope: string,
                expires_in: number,
                refresh_token: string
            }) =>  {
            if (error) {
                res.status(500).send(JSON.stringify(error, null, 2));
                res.end();
            }

            this.accessToken = body.access_token;
            this.refreshToken = body.refresh_token;
            res.redirect(301, "/static");
            res.end();

            setTimeout(this.refreshTokens, (body.expires_in * 1000) - 30000);
            this.resolveAuth!();
        });
    }
    private resolveAuth: () => void = () => {};

    private refreshTokens() {
        console.log("refreshing tokens...");

        const requestBody = querystring.stringify({
            grant_type: "refresh_token",
            refresh_token: this.refreshToken
        });

        const boundReference = this.refreshTokens.bind(this);

        needle.post("https://accounts.spotify.com/api/token", requestBody,
            { headers: { Authorization: `Basic ${ENCODED_SECRETS}` } },
            (error: Error|null, response: needle.NeedleResponse, body: {
                access_token: string,
                token_type: string,
                scope: string,
                expires_in: number,
            }) =>  {
            if (error) {
                console.log(error);
                this.accessToken = null;
                this.refreshToken = null;
                return;
            }

            this.accessToken = body.access_token;

            // TODO - make this work
            // Dollars to donuts this causes a stack overflow after several days of running.
            setTimeout(boundReference, (body.expires_in * 1000) - 30000);
        });
    }
}

export function redirectForAuth(auth: Authentication, callback: express.Handler):
    express.Handler {
        return (req: express.Request, res: express.Response) => {
            if (auth.needToAuth()) {
                res.redirect("/request_token");
                res.end();
                return;
            }

            callback(req, res, () => {});
        };
}
