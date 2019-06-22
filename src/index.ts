import express from "express";
import path from "path";

const app = express();
const port = 7777;

app.use("/static/", express.static(path.join(__dirname, "web")));
app.use("/", (req, res) => {
  res.redirect("/static/");
  res.end();
});

app.listen(port, () => {
  console.log("Running successfully on port " + port);
});
