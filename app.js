const express = require("express");
const cors = require("cors");
const request = require("request");
const { google } = require("googleapis");
const key = require("./service_account.json");

let bodyParser = require('body-parser');


const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(express.json());
// Define a route that handles POST requests to create a new user

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});


app.post("/submit", (req, res) => {
    const submiturl = req.body.url;
    // Changed 'var' to 'let'
    console.log(req.body,submiturl)
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ["https://www.googleapis.com/auth/indexing"],
      null
    );
    jwtClient.authorize((err, tokens) => {
      if (err) {
        return res.status(500).send("Error authorizing JWT client.");
      }
      const options = {
        url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        auth: { bearer: tokens.access_token },
        json: {
          url: submiturl, // Use 'url' from loop instead of req.body.url
          type: "URL_UPDATED",
        },
      };
      request(options, (error, response, body) => {
        res.send({
          url: submiturl,
          status: body.error ? body.error.code : response.statusCode,
          msg: body,
        });
      });
    });
  });



module.exports = app;