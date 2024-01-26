const express = require("express");
const app = express();

app.use(express.static(__dirname + '/static'));

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/static/index.html");
});


const listener = app.listen(8089, () => {
    console.log("Your app is listening on port " + listener.address().port);
});