import express from "express";
import ip from "ip";
import path from "path";
import {registerHandlers} from "./lib/handlers/api";
import {Authentication, redirectForAuth} from "./lib/handlers/auth";
import { Spotify } from "./lib/spotify";

const app = express();
const port = 7777;
const host = ip.address();

if (!host) {
  throw new Error("Could not find host ip!");
}

const auth = new Authentication(host!, false, port);
const spotify = new Spotify(auth);

app.use(express.json());

// AUTH HANDLERS
app.use("/request_token", (req, res) => {
  if (auth.needToAuth()) {
    auth.getRequestTokenHandler(req, res);
  } else {
    res.status(403).send("Server already authenticated");
    res.end();
  }
});

app.use("/access_token", (req, res) => {
  if (auth.needToAuth()) {
      auth.getAccessTokenHandler(req, res);
  } else {
    res.status(403).send("Server already authenticated");
    res.end();
  }
});

// API HANDLERS
registerHandlers(app, spotify, auth);

// EVERYTHING ELSE
app.use("/static/", redirectForAuth(auth, express.static(path.join(__dirname, "web"))));

app.use("/", (req, res) => {
  if (auth.needToAuth()) {
    res.redirect("/request_token");
  } else {
    res.redirect("/static/");
  }

  res.end();
});

app.listen(port, () => {
  console.log("Running successfully on port " + port);
});
